package edu.juanoff.taskmanager.dto.achievement;

import edu.juanoff.taskmanager.entity.Achievement;

public record AchievementResponseDTO(
        Long id,
        String name,
        String description,
        Integer targetValue
) {
    public static AchievementResponseDTO fromEntity(Achievement achievement) {
        return new AchievementResponseDTO(
                achievement.getId(),
                achievement.getName(),
                achievement.getDescription(),
                achievement.getTargetValue()
        );
    }
}
