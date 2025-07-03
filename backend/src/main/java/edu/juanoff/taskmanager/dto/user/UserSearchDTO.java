package edu.juanoff.taskmanager.dto.user;

public record UserSearchDTO(
        Long id,
        String username,
        String avatar,
        String fullName
) {
}
