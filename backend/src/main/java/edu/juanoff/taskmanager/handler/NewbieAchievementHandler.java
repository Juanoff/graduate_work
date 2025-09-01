package edu.juanoff.taskmanager.handler;

import edu.juanoff.taskmanager.dto.task.TaskResponseDTO;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.UserAchievement;
import edu.juanoff.taskmanager.service.AchievementProgressService;
import edu.juanoff.taskmanager.util.TaskStatusUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NewbieAchievementHandler implements AchievementHandler {

    private final AchievementProgressService achievementProgressService;

    @Override
    public void handle(UserAchievement userAchievement, TaskResponseDTO curTask, Task newTask, String action) {
        if (!AchievementAction.COMPLETE.equals(action) || newTask.getParentTask() != null) {
            return;
        }

        if (TaskStatusUtils.hasTaskJustBeenCompleted(curTask, newTask)) {
            int target = userAchievement.getAchievement().getTargetValue();
            achievementProgressService.incrementProgress(userAchievement, target);
        } else if (TaskStatusUtils.hasTaskBeenRevertedToIncomplete(curTask, newTask)) {
            achievementProgressService.decrementProgress(userAchievement);
        }
    }
}
