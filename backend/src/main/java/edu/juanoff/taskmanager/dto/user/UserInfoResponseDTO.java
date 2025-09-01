package edu.juanoff.taskmanager.dto.user;

import edu.juanoff.taskmanager.entity.User;

public record UserInfoResponseDTO(
        Long id,
        String username
) {
    public static UserInfoResponseDTO fromEntity(User user) {
        return new UserInfoResponseDTO(
                user.getId(),
                user.getUsername()
        );
    }
}
