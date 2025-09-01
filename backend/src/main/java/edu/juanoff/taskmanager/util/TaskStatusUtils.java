package edu.juanoff.taskmanager.util;

import edu.juanoff.taskmanager.dto.task.TaskResponseDTO;
import edu.juanoff.taskmanager.entity.Task;

public final class TaskStatusUtils {

    private TaskStatusUtils() {
    }

    public static boolean hasTaskJustBeenCompleted(TaskResponseDTO curTask, Task newTask) {
        return (curTask == null || !Task.StatusType.DONE.equals(curTask.status()))
                && Task.StatusType.DONE.equals(newTask.getStatus());
    }

    public static boolean hasTaskBeenRevertedToIncomplete(TaskResponseDTO curTask, Task newTask) {
        return curTask != null && Task.StatusType.DONE.equals(curTask.status())
                && !Task.StatusType.DONE.equals(newTask.getStatus());
    }
}
