package edu.juanoff.taskmanager.dto.user;

import edu.juanoff.taskmanager.entity.User;

import java.time.LocalDateTime;

public record UserProfileResponseDTO(
        Long id,
        String username,
        String email,
        User.Role role,
        LocalDateTime createdAt,
        String bio,
        String avatarUrl,
        int tasksCount
) {
    public static UserProfileResponseDTO fromEntity(User user) {
        return new UserProfileResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getTasks().stream().filter(t -> t.getParentTask() == null).toList().size()
        );
    }
}
