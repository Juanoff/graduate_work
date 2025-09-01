package edu.juanoff.taskmanager.dto.invitation;

import edu.juanoff.taskmanager.entity.AccessLevel;
import jakarta.validation.constraints.NotNull;

public record InvitationRequestDTO(
        @NotNull(message = "Task ID is required")
        Long taskId,

        @NotNull(message = "Sender ID is required")
        Long senderId,

        @NotNull(message = "Recipient ID is required")
        Long recipientId,

        @NotNull(message = "Access level is required")
        AccessLevel accessLevel
) {
}
