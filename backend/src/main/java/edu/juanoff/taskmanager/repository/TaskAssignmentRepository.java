package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.TaskAssignment;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskAssignmentRepository extends CrudRepository<TaskAssignment, Long> {
    boolean existsByTaskIdAndUserId(Long taskId, Long userId);

    List<TaskAssignment> findAllByTaskId(Long taskId);
}
