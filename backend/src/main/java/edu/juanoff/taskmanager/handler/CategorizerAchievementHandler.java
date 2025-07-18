package edu.juanoff.taskmanager.handler;

import edu.juanoff.taskmanager.dto.task.TaskResponseDTO;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.UserAchievement;
import edu.juanoff.taskmanager.service.AchievementProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategorizerAchievementHandler implements AchievementHandler {

    private final AchievementProgressService achievementProgressService;

    @Override
    public void handle(UserAchievement userAchievement, TaskResponseDTO curTask, Task newTask, String action) {
        if (AchievementAction.CREATE.equals(action) && newTask.getParentTask() == null
                && newTask.getCategory() != null && newTask.getCategory().getId() != null) {
            achievementProgressService.incrementProgress(userAchievement, userAchievement.getAchievement().getTargetValue());
        }
    }
}
