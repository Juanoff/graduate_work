package edu.juanoff.taskmanager.dto.access;

import edu.juanoff.taskmanager.entity.AccessLevel;
import edu.juanoff.taskmanager.entity.TaskAccess;

public record TaskAccessResponseDTO(
        Long id,
        Long userId,
        String username,
        String avatar,
        AccessLevel accessLevel
) {
    public static TaskAccessResponseDTO fromEntity(TaskAccess taskAccess) {
        return new TaskAccessResponseDTO(
                taskAccess.getId(),
                taskAccess.getTask().getId(),
                taskAccess.getUser().getUsername(),
                taskAccess.getUser().getAvatarUrl(),
                taskAccess.getAccessLevel()
        );
    }
}
