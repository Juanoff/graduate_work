package edu.juanoff.taskmanager.entity;

public record NotificationMetadata(
        String taskId,
        String taskTitle,
        String deadline,
        String invitationId,
        String username,
        String action,
        String accessLevel,
        String achievementId,
        String achievementName
) {
}
