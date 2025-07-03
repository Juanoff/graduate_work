package edu.juanoff.taskmanager.event;

import edu.juanoff.taskmanager.service.UserAchievementService;
import edu.juanoff.taskmanager.util.AsyncExecutorNames;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class AchievementEventListener {

    private final UserAchievementService userAchievementService;

    @Async(AsyncExecutorNames.ACHIEVEMENT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAchievementUpdate(AchievementsUpdatedEvent event) {
        userAchievementService.processAchievementUpdate(event);
    }
}
