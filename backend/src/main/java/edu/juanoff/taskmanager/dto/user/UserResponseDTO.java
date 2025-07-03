package edu.juanoff.taskmanager.dto.user;

import edu.juanoff.taskmanager.entity.User;

public record UserResponseDTO(
        Long id,
        String username,
        User.Role role
) {
    public static UserResponseDTO fromEntity(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );
    }
}
