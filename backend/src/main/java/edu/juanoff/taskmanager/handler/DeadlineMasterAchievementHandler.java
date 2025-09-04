package edu.juanoff.taskmanager.handler;

import edu.juanoff.taskmanager.dto.task.TaskResponseDTO;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.UserAchievement;
import edu.juanoff.taskmanager.service.AchievementProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DeadlineMasterAchievementHandler implements AchievementHandler {

    private final AchievementProgressService achievementProgressService;

    @Override
    public void handle(UserAchievement userAchievement, TaskResponseDTO curTask, Task newTask, String action) {
        if (!AchievementAction.COMPLETE.equals(action) || newTask.getParentTask() != null) {
            return;
        }

        if (!Task.StatusType.DONE.equals(curTask.status()) && Task.StatusType.DONE.equals(newTask.getStatus())) {
            if (newTask.getDueDate() != null && LocalDateTime.now().isBefore(newTask.getDueDate())) {
                achievementProgressService.incrementProgress(userAchievement, userAchievement.getAchievement().getTargetValue());
            }
        } else if (Task.StatusType.DONE.equals(curTask.status())
                && !Task.StatusType.DONE.equals(newTask.getStatus()) && newTask.getDueDate() != null) {
            achievementProgressService.decrementProgress(userAchievement);
        }
    }
}
