package edu.juanoff.taskmanager.dto.task;

import edu.juanoff.taskmanager.entity.AccessLevel;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TaskDueDateUpdateRequestDTO(
        @FutureOrPresent(message = "Due date must be in the future or present")
        @NotNull(message = "Due date is required")
        LocalDateTime dueDate,

        @NotNull(message = "Access level is required")
        AccessLevel accessLevel
) {
}
