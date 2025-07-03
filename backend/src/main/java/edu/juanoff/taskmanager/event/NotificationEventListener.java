package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.entity.Invitation;
import edu.juanoff.taskmanager.entity.TaskAccess;
import edu.juanoff.taskmanager.service.NotificationService;
import edu.juanoff.taskmanager.util.AsyncExecutorNames;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    @Async(AsyncExecutorNames.NOTIFICATION)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleInvitationNotification(InvitationCreatedEvent event) {
        notificationService.createNotificationForInvitation(event.invitation());
    }

    @Async(AsyncExecutorNames.NOTIFICATION)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleInvitationResponseNotification(InvitationResponseCreatedEvent event) {
        Invitation invitation = event.invitation();
        String response = event.response();
        notificationService.createResponseNotificationForInvitation(invitation, response);
    }

    @Async(AsyncExecutorNames.NOTIFICATION)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAccessLevelChanged(AccessLevelChangedEvent event) {
        TaskAccess taskAccess = event.taskAccess();
        notificationService.createNotificationForAccessChanged(taskAccess);
    }

    @Async(AsyncExecutorNames.NOTIFICATION)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAccessRemoved(AccessLevelRemovedEvent event) {
        TaskAccess taskAccess = event.taskAccess();
        notificationService.createNotificationForAccessRemoved(taskAccess);
    }
}
