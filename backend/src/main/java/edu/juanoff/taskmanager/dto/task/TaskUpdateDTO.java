package edu.juanoff.taskmanager.dto.task;

import edu.juanoff.taskmanager.entity.AccessLevel;
import edu.juanoff.taskmanager.entity.Task;

import java.time.LocalDateTime;

public record TaskUpdateDTO(
        Long id,
        String title,
        String description,
        Task.StatusType status,
        Task.Priority priority,
        LocalDateTime dueDate,
        LocalDateTime completedAt,
        Long parentTaskId,
        Long categoryId,
        int subtasksCount,
        AccessLevel accessLevel
) {
    public static TaskUpdateDTO fromEntity(Task task, AccessLevel accessLevel) {
        return new TaskUpdateDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCompletedAt(),
                task.getParentTask() != null ? task.getParentTask().getId() : null,
                task.getCategory() != null ? task.getCategory().getId() : null,
                task.getSubtasks().size(),
                accessLevel
        );
    }

    public static TaskUpdateDTO fromEntity(TaskUpdateDTO task, AccessLevel accessLevel) {
        return new TaskUpdateDTO(
                task.id(),
                task.title(),
                task.description(),
                task.status(),
                task.priority(),
                task.dueDate(),
                task.completedAt(),
                task.parentTaskId(),
                task.categoryId(),
                task.subtasksCount(),
                accessLevel
        );
    }
}
