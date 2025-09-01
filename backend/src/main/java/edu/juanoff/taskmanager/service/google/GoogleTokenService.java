package edu.juanoff.taskmanager.service.google;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import edu.juanoff.taskmanager.entity.GoogleToken;
import edu.juanoff.taskmanager.repository.GoogleTokenRepository;
import edu.juanoff.taskmanager.service.UserService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleTokenService {

    private static final String SESSION_STATE_KEY_PREFIX = "oauth_state_";
    private static final String EXPECTED_STATE_KEY = "oauth_expected_state";

    private final GoogleTokenRepository tokenRepository;
    private final GoogleAuthorizationCodeFlow flow;
    private final TextEncryptor textEncryptor;
    private final String redirectUri;
    private final UserService userService;
    private final HttpSession session;
    private final GoogleIdTokenVerifier idTokenVerifier;

    @Value("#{'${google.calendar.scope}'.split('\\s+')}")
    private List<String> requiredScopes;

    record OAuthData(Long userId, String redirectUrl) implements Serializable {
    }

    @RateLimiter(name = "googleAuth")
    public String getAuthorizationUrl(Long userId, String redirectBackUrl) {
        String state = UUID.randomUUID().toString();
        OAuthData oauthData = new OAuthData(userId, redirectBackUrl);

        session.setAttribute(EXPECTED_STATE_KEY, state);
        session.setAttribute(SESSION_STATE_KEY_PREFIX + state, oauthData);

        log.info("Generating authorization URL for user: {}, state: {}", userId, state);

        return flow.newAuthorizationUrl()
                .setState(state)
                .setRedirectUri(redirectUri)
                .setAccessType("offline")
                //.setApprovalPrompt("force") // Всегда запрашивать согласие для refresh_token
                .build();
    }

    @Transactional
    @RateLimiter(name = "googleAuth")
    @Retry(name = "googleApi")
    public String handleCallback(String code, String state) throws GoogleCalendarException {
        OAuthData oauthData = validateAndExtractSessionData(state);
        Long userId = oauthData.userId();
        String redirectBackUrl = oauthData.redirectUrl();

        try {
            GoogleTokenResponse response = exchangeCodeForTokens(code);
            validateTokenResponse(response);
            String email = extractEmailFromIdToken(response.getIdToken(), userId);
            saveOrUpdateToken(userId, response, email);

            log.info("Successfully handled OAuth callback for user: {}", userId);
            return redirectBackUrl + "?status=success";
        } catch (IOException e) {
            log.error("OAuth callback failed for user {}: {}", userId, e.getMessage());
            throw new GoogleCalendarException("Failed to process OAuth callback", e);
        }
    }

    public Credential getValidCredential(Long userId) throws IOException {
        GoogleToken token = findTokenByUserId(userId);
        validateTokenScopes(token);

        String accessToken = decryptToken(token.getAccessToken(), "access token", userId);

        if (isTokenExpired(token)) {
            accessToken = refreshAccessToken(token, userId);
        }

        return createCredential(accessToken, userId);
    }

    public String getConnectedEmail(Long userId) throws GoogleCalendarException {
        GoogleToken token = findTokenByUserId(userId);
        return decryptToken(token.getEmail(), "email", userId);
    }

    @Transactional
    @RateLimiter(name = "googleDisconnect")
    public void disconnect(Long userId) throws GoogleCalendarException {
        GoogleToken token = findTokenByUserId(userId);
        tokenRepository.delete(token);
        log.info("Disconnected Google Calendar for user: {}", userId);
    }

    private OAuthData validateAndExtractSessionData(String state) {
        String expectedState = (String) session.getAttribute(EXPECTED_STATE_KEY);
        if (expectedState == null || !expectedState.equals(state)) {
            log.warn("Invalid state parameter: expected {}, got {}", expectedState, state);
            throw new GoogleCalendarException("Invalid state parameter");
        }

        OAuthData oauthData = (OAuthData) session.getAttribute(SESSION_STATE_KEY_PREFIX + state);
        if (oauthData == null) {
            log.warn("No session data found for state: {}", state);
            throw new GoogleCalendarException("Invalid session state");
        }

        session.removeAttribute(EXPECTED_STATE_KEY);
        session.removeAttribute(SESSION_STATE_KEY_PREFIX + state);
        return oauthData;
    }

    private GoogleTokenResponse exchangeCodeForTokens(String code) throws IOException {
        return flow.newTokenRequest(code)
                .setRedirectUri(redirectUri)
                .execute();
    }

    private void validateTokenResponse(GoogleTokenResponse response) {
        String scopeStr = response.getScope();
        if (scopeStr == null || scopeStr.isBlank()) {
            log.warn("Received empty scopes in token response");
            throw new GoogleCalendarException("Empty scopes in token response");
        }

        Set<String> receivedScopes = new HashSet<>(Arrays.asList(scopeStr.split("\\s+")));
        Set<String> expectedScopes = new HashSet<>(requiredScopes);

        if (!receivedScopes.containsAll(expectedScopes)) {
            log.warn("Missing required scopes: expected {}, got {}", expectedScopes, receivedScopes);
            throw new GoogleCalendarException("Missing required scopes in token response");
        }

        if (!expectedScopes.containsAll(receivedScopes)) {
            log.debug("Received extra scopes: expected {}, got {}", expectedScopes, receivedScopes);
            // В продакшене можно либо игнорировать лишние scopes, либо отклонять
        }

        log.debug("Scopes validated successfully: {}", receivedScopes);
    }

    private String extractEmailFromIdToken(String idToken, Long userId) {
        try {
            GoogleIdToken token = idTokenVerifier.verify(idToken);
            if (token == null) {
                log.error("Invalid ID token for user: {}", userId);
                throw new GoogleCalendarException("Invalid ID token");
            }

            String email = token.getPayload().getEmail();
            if (email == null) {
                log.error("No email found in ID token for user: {}", userId);
                throw new GoogleCalendarException("Failed to retrieve user email");
            }
            log.debug("Retrieved email for user {}: {}", userId, email);
            return email;
        } catch (Exception e) {
            log.error("Failed to verify ID token for user {}: {}", userId, e.getMessage());
            throw new GoogleCalendarException("Failed to retrieve user email", e);
        }
    }

    private void saveOrUpdateToken(Long userId, GoogleTokenResponse response, String email) {
        GoogleToken token = tokenRepository.findByUserId(userId)
                .orElse(GoogleToken.builder()
                        .user(userService.getUserById(userId))
                        .build());

        token.setAccessToken(textEncryptor.encrypt(response.getAccessToken()));
        if (response.getRefreshToken() != null) {
            log.debug("Storing refresh token for user: {}", userId);
            token.setRefreshToken(textEncryptor.encrypt(response.getRefreshToken()));
        } else {
            log.warn("No refresh token received for user: {}", userId);
        }
        token.setExpiresAt(LocalDateTime.now().plusSeconds(response.getExpiresInSeconds()));
        token.setScopes(response.getScope());
        token.setEmail(textEncryptor.encrypt(email));

        tokenRepository.save(token);
        log.debug("Saved token for user: {}", userId);
    }

    private GoogleToken findTokenByUserId(Long userId) {
        return tokenRepository.findByUserId(userId)
                .orElseThrow(() -> new GoogleCalendarException("No Google token found for user: " + userId));
    }

    private void validateTokenScopes(GoogleToken token) {
        String scopeStr = token.getScopes();
        if (scopeStr == null || scopeStr.isBlank()) {
            log.warn("Stored token has empty scopes for user {}", token.getUser().getId());
            throw new GoogleCalendarException("Invalid scopes for user");
        }

        Set<String> tokenScopes = new HashSet<>(Arrays.asList(scopeStr.split("\\s+")));
        Set<String> expectedScopes = new HashSet<>(requiredScopes);

        if (!tokenScopes.containsAll(expectedScopes)) {
            log.warn("Stored token missing required scopes for user {}: expected {}, got {}",
                    token.getUser().getId(), expectedScopes, tokenScopes);
            throw new GoogleCalendarException("Invalid scopes for user");
        }
    }

    private String decryptToken(String encryptedToken, String tokenType, Long userId) {
        try {
            return textEncryptor.decrypt(encryptedToken);
        } catch (Exception e) {
            log.error("Failed to decrypt {} for user: {}", tokenType, userId, e);
            throw new GoogleCalendarException("Invalid " + tokenType + ". Please reconnect Google Calendar.");
        }
    }

    private boolean isTokenExpired(GoogleToken token) {
        return token.getExpiresAt().isBefore(LocalDateTime.now());
    }

    private String refreshAccessToken(GoogleToken token, Long userId) {
        if (token.getRefreshToken() == null) {
            log.warn("No refresh token for user: {}", userId);
            throw new GoogleCalendarException("Refresh token missing. Please reconnect Google Calendar.");
        }

        String refreshToken = decryptToken(token.getRefreshToken(), "refresh token", userId);
        log.info("Refreshing token for user: {}", userId);

        try {
            GoogleTokenResponse response = flow.newTokenRequest(refreshToken)
                    .setRedirectUri(redirectUri)
                    .execute();

            token.setAccessToken(textEncryptor.encrypt(response.getAccessToken()));
            token.setExpiresAt(LocalDateTime.now().plusSeconds(response.getExpiresInSeconds()));
            if (response.getRefreshToken() != null) {
                log.debug("Updating refresh token for user: {}", userId);
                token.setRefreshToken(textEncryptor.encrypt(response.getRefreshToken()));
            }
            tokenRepository.save(token);

            return decryptToken(token.getAccessToken(), "access token", userId);
        } catch (IOException e) {
            log.error("Failed to refresh token for user: {}. Error: {}", userId, e.getMessage());
            if (e.getMessage().contains("invalid_grant")) {
                log.warn("Invalid refresh token detected for user: {}. Deleting token.", userId);
                tokenRepository.delete(token);
                throw new GoogleCalendarException("Invalid refresh token. Please reconnect Google Calendar.");
            }
            throw new GoogleCalendarException("Failed to refresh token", e);
        }
    }

    private Credential createCredential(String accessToken, Long userId) throws IOException {
        return flow.createAndStoreCredential(
                new GoogleTokenResponse().setAccessToken(accessToken),
                userId.toString()
        );
    }
}
