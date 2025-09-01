package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.dto.notification.NotificationResponseDTO;
import edu.juanoff.taskmanager.security.UserDetailsImpl;
import edu.juanoff.taskmanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsForUser(
            @RequestParam(defaultValue = "true") boolean onlyOpen,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        List<NotificationResponseDTO> notifications = notificationService.getNotificationsForUser(userDetails.id(), onlyOpen);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{notificationId}/close")
    public ResponseEntity<Void> closeNotification(@PathVariable Long notificationId) {
        notificationService.closeNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }
}
