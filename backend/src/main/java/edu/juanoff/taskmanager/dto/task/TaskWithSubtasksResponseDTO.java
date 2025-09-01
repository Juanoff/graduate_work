package edu.juanoff.taskmanager.dto.task;

import edu.juanoff.taskmanager.entity.AccessLevel;
import edu.juanoff.taskmanager.entity.Task;

import java.time.LocalDateTime;
import java.util.List;

public record TaskWithSubtasksResponseDTO(
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
        List<TaskWithSubtasksResponseDTO> subtasks
) {
    public static TaskWithSubtasksResponseDTO fromEntity(Task task, AccessLevel accessLevel) {
        return new TaskWithSubtasksResponseDTO(
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
                task.getSubtasks().stream()
                        .map(t -> fromEntity(t, accessLevel))
                        .toList()
        );
    }
}
