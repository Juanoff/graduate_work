package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.entity.UserAchievement;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AchievementProgressService {

    private final NotificationService notificationService;

    public void incrementProgress(UserAchievement achievement, int target) {
        achievement.setProgress(achievement.getProgress() + 1);
        checkCompletion(achievement, target);
    }

    public void decrementProgress(UserAchievement achievement) {
        if (achievement.getProgress() > 0) {
            achievement.setProgress(achievement.getProgress() - 1);
        }
    }

    public void checkCompletion(UserAchievement achievement, int target) {
        if (achievement.getProgress() >= target) {
            notificationService.createNotificationForAchievement(achievement);
            achievement.setCompleted(true);
        }
    }
}
