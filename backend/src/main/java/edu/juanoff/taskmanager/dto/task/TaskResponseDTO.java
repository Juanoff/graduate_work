package edu.juanoff.taskmanager.dto.task;

import edu.juanoff.taskmanager.entity.AccessLevel;
import edu.juanoff.taskmanager.entity.Task;

import java.time.LocalDateTime;

public record TaskResponseDTO(
        Long id,
        String title,
        String description,
        Task.StatusType status,
        Task.Priority priority,
        LocalDateTime dueDate,
        LocalDateTime createdAt,
        LocalDateTime completedAt,
        Long userId,
        Long parentTaskId,
        Long categoryId,
        int subtasksCount,
        AccessLevel accessLevel,
        String ownerName
) {
    public static TaskResponseDTO fromEntity(Task task, AccessLevel accessLevel) {
        return new TaskResponseDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getCompletedAt(),
                task.getUser().getId(),
                task.getParentTask() != null ? task.getParentTask().getId() : null,
                task.getCategory() != null ? task.getCategory().getId() : null,
                task.getSubtasks().size(),
                accessLevel,
                task.getUser().getUsername()
        );
    }
}
