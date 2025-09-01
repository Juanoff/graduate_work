package edu.juanoff.taskmanager.filter;

import edu.juanoff.taskmanager.entity.AccessLevel;
import edu.juanoff.taskmanager.entity.Task;

public record TaskSearchRequestDTO(
        String query,
        Task.StatusType status,
        Task.Priority priority,
        Long categoryId,
        String dueDateFilter,
        AccessLevel accessLevel,
        Long userId
) {
}
