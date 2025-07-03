package edu.juanoff.taskmanager.dto.user;

import edu.juanoff.taskmanager.entity.User;
import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateDTO(
        @NotNull(message = "Role is required")
        User.Role role
) {
}
