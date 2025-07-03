package edu.juanoff.taskmanager.dto.notification;

import jakarta.validation.constraints.NotNull;

public record NotificationRequestDTO(
        @NotNull(message = "Task ID is required")
        Long taskId,

        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Is read status is required")
        Boolean isRead,

        @NotNull(message = "Is closed status is required")
        Boolean isClosed
) {
}
