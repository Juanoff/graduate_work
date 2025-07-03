package edu.juanoff.taskmanager.handler;

import edu.juanoff.taskmanager.dto.task.TaskResponseDTO;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.UserAchievement;
import edu.juanoff.taskmanager.service.AchievementProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PriorityGuruAchievementHandler implements AchievementHandler {

    private final AchievementProgressService achievementProgressService;

    @Override
    public void handle(UserAchievement userAchievement, TaskResponseDTO curTask, Task newTask, String action) {
        if (newTask.getParentTask() != null) {
            return;
        }

        if (AchievementAction.COMPLETE.equals(action)) {
            if (Task.Priority.HIGH.equals(newTask.getPriority()) && !Task.Priority.HIGH.equals(curTask.priority())) {
                achievementProgressService.incrementProgress(userAchievement, userAchievement.getAchievement().getTargetValue());
            } else if (Task.Priority.HIGH.equals(curTask.priority()) && !Task.Priority.HIGH.equals(newTask.getPriority())) {
                achievementProgressService.decrementProgress(userAchievement);
            }
        } else if (AchievementAction.CREATE.equals(action) && Task.Priority.HIGH.equals(newTask.getPriority())) {
            achievementProgressService.incrementProgress(userAchievement, userAchievement.getAchievement().getTargetValue());
        }
    }
}
