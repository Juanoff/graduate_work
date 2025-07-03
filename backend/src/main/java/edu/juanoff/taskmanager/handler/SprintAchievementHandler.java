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
public class SprintAchievementHandler implements AchievementHandler {

    private final AchievementProgressService achievementProgressService;

    @Override
    public void handle(UserAchievement userAchievement, TaskResponseDTO curTask, Task newTask, String action) {
        if (!AchievementAction.COMPLETE.equals(action) || newTask.getParentTask() != null) {
            return;
        }

        if (isTaskCompleted(curTask, newTask)) {
            if (newTask.getCreatedAt() != null && LocalDateTime.now().minusHours(1).isBefore(newTask.getCreatedAt())) {
                int target = userAchievement.getAchievement().getTargetValue();
                achievementProgressService.incrementProgress(userAchievement, target);
            }
        } else if (isTaskReverted(curTask, newTask)) {
            achievementProgressService.decrementProgress(userAchievement);
        }
    }
}
