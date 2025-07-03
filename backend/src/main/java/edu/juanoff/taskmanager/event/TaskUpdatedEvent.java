package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.dto.task.TaskUpdateDTO;

public record TaskUpdatedEvent(TaskUpdateDTO taskUpdateDTO, Long userId) {
}
