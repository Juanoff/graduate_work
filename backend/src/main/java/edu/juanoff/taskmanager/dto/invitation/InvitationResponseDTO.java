package edu.juanoff.taskmanager.dto.invitation;

import edu.juanoff.taskmanager.entity.Invitation;

public record InvitationResponseDTO(
        Long id,
        Long taskId,
        String senderUsername,
        String recipientUsername,
        String accessLevel,
        String status
) {
    public static InvitationResponseDTO fromEntity(Invitation invitation) {
        return new InvitationResponseDTO(
                invitation.getId(),
                invitation.getTask() != null ? invitation.getTask().getId() : null,
                invitation.getSender().getUsername(),
                invitation.getRecipient().getUsername(),
                invitation.getAccessLevel().name(),
                invitation.getStatus().name()
        );
    }
}
