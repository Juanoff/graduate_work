package edu.juanoff.taskmanager.scheduler;

import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.TaskAccess;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.repository.TaskAccessRepository;
import edu.juanoff.taskmanager.service.NotificationProcessingService;
import edu.juanoff.taskmanager.service.TaskService;
import edu.juanoff.taskmanager.service.UserService;
import edu.juanoff.taskmanager.util.AsyncExecutorNames;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Semaphore;

@Service
@Slf4j
public class NotificationScheduler {

    private final TaskService taskService;
    private final UserService userService;
    private final NotificationProcessingService notificationProcessingService;
    private final TaskAccessRepository taskAccessRepository;
    private final Semaphore semaphore;
    private final Executor taskExecutor;

    public NotificationScheduler(
            TaskService taskService,
            UserService userService,
            NotificationProcessingService notificationProcessingService,
            TaskAccessRepository taskAccessRepository,
            Semaphore semaphore,
            @Qualifier(AsyncExecutorNames.NOTIFICATION) Executor taskExecutor
    ) {
        this.taskService = taskService;
        this.userService = userService;
        this.notificationProcessingService = notificationProcessingService;
        this.taskAccessRepository = taskAccessRepository;
        this.semaphore = semaphore;
        this.taskExecutor = taskExecutor;
    }

    private record TaskWithUsers(Task task, List<User> users) {
    }

    @Transactional
    @Scheduled(fixedRateString = "${scheduler.notification.check-rate}")
    public void checkUpcomingTasks() {
        long maxIntervalMinutes = userService.getMaxTaskNotificationInterval();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusMinutes(maxIntervalMinutes);

        List<Task> upcomingTasks = taskService.getAllNotNotifiedUpcomingTasks(now, threshold);
        log.info("Found {} upcoming tasks within {} minutes to process", upcomingTasks.size(), maxIntervalMinutes);

        List<TaskWithUsers> tasksWithUsers = upcomingTasks.stream()
                .map(task -> new TaskWithUsers(task, getUsersWithAccess(task)))
                .toList();

        tasksWithUsers.forEach(taskWithUsers -> {
            if (semaphore.tryAcquire()) {
                taskExecutor.execute(() -> {
                    try {
                        notificationProcessingService.processTaskNotifications(taskWithUsers.task(), taskWithUsers.users());
                    } finally {
                        semaphore.release();
                    }
                });
            } else {
                log.debug("Concurrency limit reached for task {}", taskWithUsers.task().getId());
            }
        });
    }

    @Transactional(readOnly = true)
    private List<User> getUsersWithAccess(Task task) {
        List<User> users = new ArrayList<>();

        User owner = task.getUser();
        Hibernate.initialize(owner.getSettings());
        users.add(owner);

        List<TaskAccess> taskAccesses = taskAccessRepository.findByTaskId(task.getId());
        taskAccesses.forEach(access -> {
            User user = access.getUser();
            Hibernate.initialize(user.getSettings());
            users.add(user);
        });

        return users.stream().distinct().toList();
    }
}
