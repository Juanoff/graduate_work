package edu.juanoff.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequestDTO(
        @NotBlank(message = "Username is required")
        String username,

        @Email
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Password is required")
        String password
) {
}
