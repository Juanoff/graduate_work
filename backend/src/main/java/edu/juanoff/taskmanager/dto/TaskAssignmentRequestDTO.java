package edu.juanoff.taskmanager.dto;

import jakarta.validation.constraints.NotNull;

public record TaskAssignmentRequestDTO(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Task ID is required")
        Long taskId
) {
}
