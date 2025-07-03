package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.entity.Invitation;

public record InvitationResponseCreatedEvent(Invitation invitation, String response) {
}
