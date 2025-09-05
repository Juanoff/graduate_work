package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.notification.NotificationResponseDTO;
import edu.juanoff.taskmanager.dto.task.TaskUpdateDTO;
import edu.juanoff.taskmanager.entity.*;
import edu.juanoff.taskmanager.event.TaskUpdatedEvent;
import edu.juanoff.taskmanager.repository.NotificationRepository;
import edu.juanoff.taskmanager.repository.TaskAccessRepository;
import edu.juanoff.taskmanager.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Predicate;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskAccessRepository taskAccessRepository;
    private final TaskRepository taskRepository;

    public void createNotificationForTask(Task task, User user) {
        if (isNotificationDisabled(user, NotificationSettings::isTaskEnabled)) {
            return;
        }

        log.info("Reach method: createNotificationForTask");

        NotificationMetadata metadata = new NotificationMetadata(
                task.getId().toString(), task.getTitle(),
                task.getDueDate().format(DateTimeFormatter.ofPattern("HH:mm")),
                null, null, null, null,
                null, null
        );

        Notification notification = saveNotification(user, Notification.Type.TASK_DEADLINE, metadata);
        sendNotificationToUser(notification);
    }

    public void createNotificationForInvitation(Invitation invitation) {
        User user = invitation.getRecipient();
        if (isNotificationDisabled(user, NotificationSettings::isInvitationEnabled)) {
            return;
        }

        NotificationMetadata metadata = new NotificationMetadata(
                invitation.getTask().getId().toString(), invitation.getTask().getTitle(), null,
                invitation.getId().toString(), invitation.getSender().getUsername(), null,
                invitation.getAccessLevel().name(),
                null, null
        );

        Notification notification = saveNotification(user, Notification.Type.TASK_INVITATION, metadata);
        sendNotificationToUser(notification);
    }

    public void createNotificationForAchievement(UserAchievement userAchievement) {
        User user = userAchievement.getUser();
        if (isNotificationDisabled(user, NotificationSettings::isAchievementEnabled)) {
            return;
        }

        NotificationMetadata metadata = new NotificationMetadata(
                null, null, null, null,
                null, null, null,
                userAchievement.getId().toString(), userAchievement.getAchievement().getName()
        );

        Notification notification = saveNotification(user, Notification.Type.USER_ACHIEVEMENT, metadata);
        sendNotificationToUser(notification);
    }

    public void createResponseNotificationForInvitation(Invitation invitation, String action) {
        User user = invitation.getSender();
        if (isNotificationDisabled(user, NotificationSettings::isInvitationEnabled)) {
            return;
        }

        NotificationMetadata metadata = new NotificationMetadata(
                invitation.getTask().getId().toString(), invitation.getTask().getTitle(), null,
                invitation.getId().toString(), invitation.getRecipient().getUsername(), action,
                null, null, null
        );

        Notification notification = saveNotification(user, Notification.Type.TASK_INVITATION_RESPONSE, metadata);
        sendNotificationToUser(notification);
    }

    public void createNotificationForAccessChanged(TaskAccess taskAccess) {
        User user = taskAccess.getUser();

        NotificationMetadata metadata = new NotificationMetadata(
                taskAccess.getTask().getId().toString(), taskAccess.getTask().getTitle(), null,
                null, null, null, taskAccess.getAccessLevel().name(),
                null, null
        );

        Notification notification = saveNotification(user, Notification.Type.TASK_ACCESS_RIGHTS_CHANGED, metadata);
        sendNotificationToUser(notification);
    }

    public void createNotificationForAccessRemoved(TaskAccess taskAccess) {
        User user = taskAccess.getUser();

        NotificationMetadata metadata = new NotificationMetadata(
                taskAccess.getTask().getId().toString(), taskAccess.getTask().getTitle(), null,
                null, null, null,
                null, null, null
        );

        Notification notification = saveNotification(user, Notification.Type.TASK_ACCESS_RIGHTS_REMOVED, metadata);
        sendNotificationToUser(notification);
    }

    private record UserWithAccess(User user, AccessLevel accessLevel) {
    }

    public void notifyTaskUpdate(TaskUpdatedEvent taskUpdatedEvent) {
        TaskUpdateDTO taskUpdateDTO = taskUpdatedEvent.taskUpdateDTO();
        List<UserWithAccess> users = getUsersWithAccess(taskUpdateDTO.id(), taskUpdatedEvent.userId());

        for (UserWithAccess user : users) {
            String username = user.user().getUsername();
            try {
                messagingTemplate.convertAndSendToUser(
                        username,
                        "/topic/task-updates/" + taskUpdateDTO.id(),
                        TaskUpdateDTO.fromEntity(taskUpdateDTO, user.accessLevel)
                );
                log.debug("Sent task update for task {} to user {}", taskUpdateDTO.id(), username);
            } catch (Exception e) {
                log.error("Failed to send task update for task {} to user {}: {}",
                        taskUpdateDTO.id(), username, e.getMessage());
            }
        }
    }

    @Transactional(readOnly = true)
    private List<UserWithAccess> getUsersWithAccess(Long taskId, Long userId) {
        Task task = taskRepository.findTaskWithUserById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found for id: " + taskId));

        Set<UserWithAccess> users = new HashSet<>();

        Optional.of(task.getUser())
                .filter(u -> !u.getId().equals(userId))
                .map(u -> new UserWithAccess(u, AccessLevel.OWNER))
                .ifPresent(users::add);

        List<TaskAccess> taskAccesses = taskAccessRepository.findByTaskId(task.getId()).stream()
                .filter(ta -> !ta.getUser().getId().equals(userId))
                .toList();

        taskAccesses.forEach(access -> users.add(new UserWithAccess(access.getUser(), access.getAccessLevel())));

        return new ArrayList<>(users);
    }

    private boolean isNotificationDisabled(User user, Predicate<NotificationSettings> predicate) {
        NotificationSettings settings = user.getSettings().getNotificationSettingsObj();
        if (settings == null || !predicate.test(settings)) {
            log.error("Notification disabled or missing for setting");
            return true;
        }
        return false;
    }

    private static String getTitleForType(Notification.Type type) {
        return switch (type) {
            case TASK_DEADLINE -> "Напоминание о задаче";
            case TASK_INVITATION -> "Новое приглашение";
            case USER_ACHIEVEMENT -> "Новое достижение";
            case TASK_INVITATION_RESPONSE -> "Ответ на приглашение";
            case TASK_ACCESS_RIGHTS_CHANGED -> "Права доступа к задаче изменены";
            case TASK_ACCESS_RIGHTS_REMOVED -> "Доступ к задаче отозван";
        };
    }

    @Transactional
    private Notification saveNotification(User user, Notification.Type type, NotificationMetadata metadata) {
        log.info("Reach method: saveNotification");

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(getTitleForType(type))
                .metadata(metadata)
                .build();
        return notificationRepository.save(notification);
    }

    private void sendNotificationToUser(Notification notification) {
        try {
            log.info("Reach method: sendNotificationToUser");
            NotificationResponseDTO notificationDTO = NotificationResponseDTO.fromEntity(notification);
            messagingTemplate.convertAndSendToUser(
                    notification.getUser().getUsername(),
                    "/topic/notifications",
                    notificationDTO
            );
            log.info("Success send in method: sendNotificationToUser");
        } catch (Exception e) {
            log.error("Failed to send notification for achievement {}: {}", notification.getId(), e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotificationsForUser(Long userId, boolean onlyOpen) {
        List<Notification> notifications;
        if (onlyOpen) {
            notifications = notificationRepository.findByUserIdAndIsClosedFalse(userId);
        } else {
            notifications = notificationRepository.findByUserId(userId);
        }
        return notifications.stream()
                .map(NotificationResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public void closeNotification(Long notificationId) {
        Notification notification = getNotificationEntityById(notificationId);
        notification.setIsClosed(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = getNotificationEntityById(notificationId);
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    private Notification getNotificationEntityById(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found for id: " + notificationId));
    }
}
