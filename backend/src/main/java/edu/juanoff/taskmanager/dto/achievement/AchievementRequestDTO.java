package edu.juanoff.taskmanager.dto.achievement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AchievementRequestDTO(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Name must be less than 255 characters")
        String name,

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description must be less than 2000 characters")
        String description,

        @NotNull(message = "Target value is required")
        @Positive(message = "Target value must be positive")
        Integer targetValue
) {
}
