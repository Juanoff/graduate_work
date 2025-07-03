package edu.juanoff.taskmanager.dto.task;

import edu.juanoff.taskmanager.entity.AccessLevel;
import edu.juanoff.taskmanager.entity.Task;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record TaskRequestDTO(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be less than 255 characters")
        String title,

        @Size(max = 2000, message = "Description must be less than 2000 characters")
        String description,

        @FutureOrPresent(message = "Due date must be in the future or present")
        LocalDateTime dueDate,

        Long parentTaskId,

        Long categoryId,

        @NotNull(message = "Status is required")
        Task.StatusType status,

        @NotNull(message = "Priority is required")
        Task.Priority priority,

        @NotNull(message = "Access level is required")
        AccessLevel accessLevel
) {
}
