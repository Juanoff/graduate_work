package edu.juanoff.taskmanager.handler;

import edu.juanoff.taskmanager.dto.task.TaskResponseDTO;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.UserAchievement;

public interface AchievementHandler {

    void handle(UserAchievement achievement, TaskResponseDTO curTask, Task newTask, String action);

    default boolean isTaskCompleted(TaskResponseDTO curTask, Task newTask) {
        return !Task.StatusType.DONE.equals(curTask.status()) && Task.StatusType.DONE.equals(newTask.getStatus());
    }

    default boolean isTaskReverted(TaskResponseDTO curTask, Task newTask) {
        return Task.StatusType.DONE.equals(curTask.status()) && !Task.StatusType.DONE.equals(newTask.getStatus());
    }
}
