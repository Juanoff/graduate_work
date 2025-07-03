package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.Comment;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends CrudRepository<Comment, Long> {
    List<Comment> findAllByTaskIdOrderByCreatedAtDesc(Long taskId);

    boolean existsByIdAndUserId(Long commentId, Long userId);
}
