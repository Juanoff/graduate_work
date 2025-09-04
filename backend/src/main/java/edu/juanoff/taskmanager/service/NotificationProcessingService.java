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
            log.info("Reach method: processTaskNotifications");
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime dueDate = task.getDueDate();
            Long ownerId = task.getUser().getId();

            for (User user : usersWithAccess) {
                UserSettings settings = user.getSettings();
                NotificationSettings ns = settings.getNotificationSettingsObj();
                log.info("SUCCESS GET SETTINGS USER: {}", ns);
                if (!ns.isTaskEnabled()) {
                    log.info("TASK IS NOT ENABLED");
                    continue;
                }

                long intervalMinutes = ns.getTaskNotificationInterval();
                log.info("INTERVAL MINUTES: {}", intervalMinutes);
                LocalDateTime userThreshold = now.plusMinutes(intervalMinutes);
                log.info("USER THRESHOLD: {}", userThreshold);

                if (dueDate.isAfter(now) && dueDate.isBefore(userThreshold)) {
                    log.info("TASK IN INTERVAL IS GOOD...");
                    notificationService.createNotificationForTask(task, user);
                    if (Objects.equals(user.getId(), ownerId)) {
                        log.info("IT IS OWNER. SET TASK NOTIFIED");
                        taskService.setTaskNotified(task);
                    } else {
                        log.info("IT IS NOT OWNER. SET TASK NOT NOTIFIED");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing notifications for task {}: {}", task.getId(), e.getMessage());
        }
    }
}
