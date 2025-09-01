package edu.juanoff.taskmanager.dto.notification;

import jakarta.validation.constraints.Positive;

public record NotificationSettingsRequestDTO(
        @Positive(message = "Task interval must be positive")
        int taskNotificationInterval,

        boolean taskEnabled,

        boolean invitationEnabled,

        boolean achievementEnabled
) {
}
