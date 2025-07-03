package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.repository.GoogleTokenRepository;
import edu.juanoff.taskmanager.security.UserDetailsImpl;
import edu.juanoff.taskmanager.service.google.GoogleCalendarException;
import edu.juanoff.taskmanager.service.google.GoogleCalendarService;
import edu.juanoff.taskmanager.service.google.GoogleTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/google")
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarController {

    private final GoogleTokenService tokenService;
    private final GoogleCalendarService calendarService;
    private final GoogleTokenRepository tokenRepository;

    @GetMapping("/auth")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getAuthUrl(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam String redirectBackUrl
    ) {
        String url = tokenService.getAuthorizationUrl(userDetails.id(), redirectBackUrl);
        return ResponseEntity.ok(Collections.singletonMap("url", url));
    }

    @GetMapping("/callback")
    public ResponseEntity<String> handleCallback(
            @RequestParam String code,
            @RequestParam String state
    ) {
        try {
            String redirectUrl = tokenService.handleCallback(code, state);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirectUrl)
                    .build();
        } catch (GoogleCalendarException e) {
            log.error("OAuth callback failed: {}", e.getMessage());

            String errorRedirect = "http://localhost:3000/settings?status=error&message=" +
                    URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", errorRedirect)
                    .build();
        }
    }

    @PostMapping("/sync")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> syncCalendar(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            calendarService.resetCancelSync();
            calendarService.syncTasks(userDetails.id());
            return ResponseEntity.ok("Sync completed successfully");
        } catch (GoogleCalendarException e) {
            log.error("Sync failed for user {}: {}", userDetails.id(), e.getMessage());
            if (e.getMessage().contains("Please reconnect Google Calendar")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Sync failed: Please reconnect Google Calendar.");
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Sync failed: " + e.getMessage());
        }
    }

    @PostMapping("/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> cancelSync(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            calendarService.cancelSync();
            return ResponseEntity.ok("Sync cancellation requested");
        } catch (Exception e) {
            log.error("Failed to cancel sync for user {}: {}", userDetails.id(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to cancel sync: " + e.getMessage());
        }
    }

    @PostMapping("/undo")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> undoSync(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            calendarService.undoSync(userDetails.id());
            return ResponseEntity.ok("Sync undone successfully");
        } catch (GoogleCalendarException e) {
            log.error("Undo sync failed for user {}: {}", userDetails.id(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Undo failed: " + e.getMessage());
        }
    }

    @GetMapping("/check")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> checkConnection(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isConnected = tokenRepository.existsByUserId(userDetails.id());
        Map<String, Object> response = new HashMap<>();
        response.put("isConnected", isConnected);
        if (isConnected) {
            response.put("email", tokenService.getConnectedEmail(userDetails.id()));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/disconnect")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> disconnect(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            tokenService.disconnect(userDetails.id());
            return ResponseEntity.ok("Google Calendar disconnected successfully");
        } catch (GoogleCalendarException e) {
            log.error("Disconnect failed for user {}: {}", userDetails.id(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Disconnect failed: " + e.getMessage());
        }
    }
}
