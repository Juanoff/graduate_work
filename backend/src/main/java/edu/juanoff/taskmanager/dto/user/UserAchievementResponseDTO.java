package edu.juanoff.taskmanager.dto.user;

public record UserAchievementResponseDTO(
        Long id,
        Long achievementId,
        String achievementName,
        String achievementDescription,
        Integer targetValue,
        Integer progress,
        Boolean completed
) {
}
