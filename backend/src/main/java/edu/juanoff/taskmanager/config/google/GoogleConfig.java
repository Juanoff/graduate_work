package edu.juanoff.taskmanager.config.google;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.MemoryDataStoreFactory;
import com.google.api.services.calendar.Calendar;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;

@Configuration
@Slf4j
public class GoogleConfig {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    @Value("${google.calendar.scope}")
    private String scope;

    @Value("${encryption.key}")
    private String encryptionKey;

    @Value("${encryption.salt}")
    private String salt;

    @Bean
    public GoogleClientSecrets googleClientSecrets() {
        return new GoogleClientSecrets()
                .setWeb(new GoogleClientSecrets.Details()
                        .setClientId(clientId)
                        .setClientSecret(clientSecret)
                        .setRedirectUris(Collections.singletonList(redirectUri)));
    }

    @Bean
    public GoogleAuthorizationCodeFlow googleAuthorizationCodeFlow(
            GoogleClientSecrets clientSecrets
    ) throws IOException {
        return new GoogleAuthorizationCodeFlow.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance(),
                clientSecrets,
                Arrays.asList(scope.split("\\s+")))
                .setDataStoreFactory(new MemoryDataStoreFactory())
                .setAccessType("offline")
                .build();
    }

    @Bean("googleCalendarServiceConfig")
    public Calendar googleCalendarService() {
        return new Calendar.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance(),
                (HttpRequest request) -> {
                })
                .setApplicationName("TaskManager")
                .build();
    }

    @Bean
    public String redirectUri() {
        return redirectUri;
    }

    @Bean
    public TextEncryptor textEncryptor() {
        log.info("Initializing TextEncryptor with key and salt");
        return Encryptors.text(encryptionKey, salt);
    }

    @Bean
    public GoogleIdTokenVerifier googleIdTokenVerifier(GoogleClientSecrets clientSecrets) {
        return new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(clientSecrets.getDetails().getClientId()))
                .build();
    }
}
