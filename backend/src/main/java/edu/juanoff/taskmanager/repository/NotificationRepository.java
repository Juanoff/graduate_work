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

//    @Query("SELECT n FROM Notification n " +
//            "LEFT JOIN FETCH n.task " +
//            "LEFT JOIN FETCH n.invitation " +
//            "LEFT JOIN FETCH n.userAchievement " +
//            "WHERE n.isClosed = false")
//    List<Notification> findAllActive();

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isClosed = true")
    int deleteClosedNotifications();
}
