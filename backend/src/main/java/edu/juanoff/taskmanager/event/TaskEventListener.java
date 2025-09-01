package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.service.NotificationService;
import edu.juanoff.taskmanager.util.AsyncExecutorNames;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class TaskEventListener {

    private final NotificationService notificationService;

    @Async(AsyncExecutorNames.NOTIFICATION)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTaskUpdate(TaskUpdatedEvent event) {
        notificationService.notifyTaskUpdate(event);
    }
}
