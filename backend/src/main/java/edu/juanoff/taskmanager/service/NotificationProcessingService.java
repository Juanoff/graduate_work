package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.entity.NotificationSettings;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.entity.UserSettings;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProcessingService {

    private final NotificationService notificationService;
    private final TaskService taskService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processTaskNotifications(Task task, List<User> usersWithAccess) {
        try {
            log.debug("Task {} has {} users with access", task.getId(), usersWithAccess.size());
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime dueDate = task.getDueDate();
            Long ownerId = task.getUser().getId();

            for (User user : usersWithAccess) {
                UserSettings settings = user.getSettings();
                NotificationSettings ns = settings.getNotificationSettingsObj();
                if (!ns.isTaskEnabled()) {
                    continue;
                }

                long intervalMinutes = ns.getTaskNotificationInterval();
                LocalDateTime userThreshold = now.plusMinutes(intervalMinutes);

                if (dueDate.isAfter(now) && dueDate.isBefore(userThreshold)) {
                    notificationService.createNotificationForTask(task, user);
                    if (Objects.equals(user.getId(), ownerId)) {
                        taskService.setTaskNotified(task);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing notifications for task {}: {}", task.getId(), e.getMessage());
        }
    }
}
