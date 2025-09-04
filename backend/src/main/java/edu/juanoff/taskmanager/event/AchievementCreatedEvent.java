package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.entity.Achievement;

public record AchievementCreatedEvent(
        Achievement achievement
) {
}
