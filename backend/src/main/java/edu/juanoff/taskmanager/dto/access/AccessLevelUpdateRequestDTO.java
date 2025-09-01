package edu.juanoff.taskmanager.dto.access;

import edu.juanoff.taskmanager.entity.AccessLevel;
import jakarta.validation.constraints.NotNull;

public record AccessLevelUpdateRequestDTO(
        @NotNull(message = "Access level is required")
        AccessLevel accessLevel
) {
}
