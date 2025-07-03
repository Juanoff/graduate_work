package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.entity.Invitation;

public record InvitationCreatedEvent(Invitation invitation) {
}
