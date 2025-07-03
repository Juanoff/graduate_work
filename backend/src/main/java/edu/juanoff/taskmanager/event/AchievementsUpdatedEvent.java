package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.dto.task.TaskResponseDTO;
import edu.juanoff.taskmanager.entity.Task;

public record AchievementsUpdatedEvent(
        Long userId,
        TaskResponseDTO currentTask,
        Task newTask,
        String action
) {
}
