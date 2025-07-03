package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationCleanupService {

    private final NotificationRepository notificationRepository;

    @Transactional
    @Scheduled(cron = "0 0 0 */2 * *")
    public void deleteClosedNotifications() {
        int count = notificationRepository.deleteClosedNotifications();
        log.info("Удалено закрытых уведомлений через JPA: {}", count);
    }
}
