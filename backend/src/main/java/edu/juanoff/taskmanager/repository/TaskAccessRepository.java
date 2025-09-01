package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.TaskAccess;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskAccessRepository extends CrudRepository<TaskAccess, Long> {

    boolean existsByTaskIdAndUserId(Long taskId, Long userId);

    List<TaskAccess> findAllByTaskId(Long taskId);

    List<TaskAccess> findAllByUserId(Long userId);

    void deleteByTaskIdAndUserId(Long taskId, Long userId);

    @Query("SELECT ta FROM TaskAccess ta JOIN FETCH ta.user WHERE ta.task.id = :taskId")
    List<TaskAccess> findByTaskId(@Param("taskId") Long taskId);

    Optional<TaskAccess> findByTaskIdAndUserId(Long taskId, Long userId);
}
