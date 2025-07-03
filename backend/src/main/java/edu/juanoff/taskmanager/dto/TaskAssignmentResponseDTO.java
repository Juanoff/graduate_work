package edu.juanoff.taskmanager.dto;

import edu.juanoff.taskmanager.entity.TaskAssignment;

import java.time.LocalDateTime;

public record TaskAssignmentResponseDTO(
        Long userId,
        String username,
        Long taskId,
        String taskTitle,
        LocalDateTime assignedAt
) {
    public static TaskAssignmentResponseDTO fromEntity(TaskAssignment assignment) {
        return new TaskAssignmentResponseDTO(
                assignment.getUser().getId(),
                assignment.getUser().getUsername(),
                assignment.getTask().getId(),
                assignment.getTask().getTitle(),
                assignment.getAssignedAt()
        );
    }
}
