package edu.juanoff.taskmanager.dto.category;

import edu.juanoff.taskmanager.entity.Category;

public record CategoryResponseDTO(
        Long id,
        String name,
        String color,
        Long userId,
        boolean isOwned
) {
    public static CategoryResponseDTO fromEntity(Category category, Long currentUserId) {
        Long userId = category.getUser() != null ? category.getUser().getId() : null;
        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getColor(),
                userId,
                userId != null && userId.equals(currentUserId)
        );
    }
}
