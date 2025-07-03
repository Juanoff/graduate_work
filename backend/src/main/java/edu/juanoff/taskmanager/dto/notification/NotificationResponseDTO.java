package edu.juanoff.taskmanager.dto.notification;

import edu.juanoff.taskmanager.entity.Notification;
import edu.juanoff.taskmanager.entity.NotificationMetadata;

import java.time.LocalDateTime;

public record NotificationResponseDTO(
        Long id,
        Notification.Type type,
        String title,
        NotificationMetadata metadata,
        LocalDateTime createdAt,
        boolean isRead,
        boolean isClosed
) {
    public static NotificationResponseDTO fromEntity(Notification notification) {
        if (notification == null) {
            throw new IllegalArgumentException("Notification cannot be null");
        }

        return new NotificationResponseDTO(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMetadata(),
                notification.getCreatedAt(),
                notification.getIsRead(),
                notification.getIsClosed()
        );
    }
}
