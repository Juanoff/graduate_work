package edu.juanoff.taskmanager.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequestDTO(
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,

        @Size(max = 160, message = "Bio must not exceed 160 characters")
        String bio,

        @Email(message = "Invalid email format")
        String email,

        String currentPassword,

        @Size(min = 8, max = 100, message = "New password must be between 8 and 100 characters")
        String newPassword
) {
    public UserUpdateRequestDTO {
        if (currentPassword != null && (newPassword == null || newPassword.trim().isEmpty())) {
            throw new IllegalArgumentException("New password is required when current password is provided");
        }
    }
}
