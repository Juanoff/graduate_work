package edu.juanoff.taskmanager.dto.task;

import edu.juanoff.taskmanager.entity.AccessLevel;
import edu.juanoff.taskmanager.entity.Task;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequestDTO(
        @NotNull(message = "Status is required")
        Task.StatusType status,

        @NotNull(message = "Access level is required")
        AccessLevel accessLevel
) {
}
