package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.entity.TaskAccess;

public record AccessLevelChangedEvent(TaskAccess taskAccess) {
}
