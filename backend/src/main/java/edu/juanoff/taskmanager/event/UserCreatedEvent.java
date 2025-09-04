package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.entity.User;

public record UserCreatedEvent(
        User user
) {
}
