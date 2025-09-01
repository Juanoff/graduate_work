package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends CrudRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    @Query("SELECT DISTINCT t FROM Task t " +
            "LEFT JOIN t.sharedWith ta " +
            "WHERE t.user.id = :userId OR ta.user.id = :userId")
    List<Task> findAllAccessibleTasks(@Param("userId") Long userId);

    Optional<Task> findByIdAndUserId(Long taskId, Long userId);

    List<Task> findByUserId(Long userId);

    boolean existsByIdAndUserId(Long taskId, Long userId);

    List<Task> findByUserIdAndDueDateBetween(Long userId, LocalDateTime startOfDay, LocalDateTime endOfDay);

    List<Task> findByUserIdAndParentTaskIsNull(Long userId);

    @Modifying
    @Query("UPDATE Task t SET t.category = NULL WHERE t.category.id = :categoryId AND t.user.id = :userId")
    void updateCategoryToNull(@Param("categoryId") Long categoryId, @Param("userId") Long userId);

    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.user u " +
            "WHERE t.user.id = :userId " +
            "AND t.completedAt IS NULL " +
            "AND t.notified = false " +
            "AND t.dueDate BETWEEN :startThreshold AND :endThreshold")
    List<Task> findNotNotifiedUpcomingTasks(@Param("userId") Long userId,
                                            @Param("startThreshold") LocalDateTime startThreshold,
                                            @Param("endThreshold") LocalDateTime endThreshold);

    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :start AND :end AND t.notified = false AND t.completedAt IS NULL")
    List<Task> findByDueDateBetweenAndNotifiedFalse(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("select t from Task t join fetch t.user where t.id = :taskId")
    Optional<Task> findTaskWithUserById(@Param("taskId") Long taskId);

    Optional<Task> findByGoogleEventId(String googleEventId);

    List<Task> findByUserIdAndDueDateNotNull(Long userId);
}
