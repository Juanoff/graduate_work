package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.Notification;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends CrudRepository<Notification, Long> {
    List<Notification> findByUserIdAndIsClosedFalse(Long userId);

    List<Notification> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isClosed = true")
    int deleteClosedNotifications();
}
