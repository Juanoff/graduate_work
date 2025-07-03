package edu.juanoff.taskmanager.dto.user;

import edu.juanoff.taskmanager.entity.TaskAssignment;

import java.time.LocalDateTime;

public record UserTaskAssignmentDTO(
        Long taskId,
        String taskTitle,
        LocalDateTime assignedAt
) {
    public static UserTaskAssignmentDTO fromEntity(TaskAssignment assignment) {
        return new UserTaskAssignmentDTO(
                assignment.getTask().getId(),
                assignment.getTask().getTitle(),
                assignment.getAssignedAt()
        );
    }
}
