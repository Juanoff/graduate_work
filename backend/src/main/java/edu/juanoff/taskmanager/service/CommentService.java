package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.comment.CommentRequestDTO;
import edu.juanoff.taskmanager.dto.comment.CommentResponseDTO;
import edu.juanoff.taskmanager.entity.Comment;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.exception.AuthorizationException;
import edu.juanoff.taskmanager.exception.ResourceNotFoundException;
import edu.juanoff.taskmanager.mapper.CommentMapper;
import edu.juanoff.taskmanager.repository.CommentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final CommentMapper commentMapper;

    public CommentResponseDTO createComment(Long taskId, CommentRequestDTO dto, Long userId) {
        // Получаем задачу и пользователя
        Task task = taskService.getTaskEntityById(taskId);
        User user = userService.getUserById(userId);

        // Создаем комментарий
        Comment comment = commentMapper.toEntity(dto);
        comment.setTask(task);
        comment.setUser(user);

        // Сохраняем и возвращаем DTO
        return CommentResponseDTO.fromEntity(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId, Long userId) {
        // Получаем комментарий
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Проверяем права доступа
        if (!comment.getUser().getId().equals(userId)) {
            throw new AuthorizationException("You can only delete your own comments");
        }

        // Удаляем комментарий
        commentRepository.delete(comment);
    }

    public CommentResponseDTO addCommentToTask(Long taskId, CommentRequestDTO dto, Long userId) {
        Task task = taskService.getTaskEntityById(taskId);
        User user = userService.getUserById(userId);

        Comment comment = commentMapper.toEntity(dto);
        comment.setTask(task);
        comment.setUser(user);

        return CommentResponseDTO.fromEntity(commentRepository.save(comment));
    }

    public List<CommentResponseDTO> getTaskComments(Long taskId) {
        return commentRepository.findAllByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(CommentResponseDTO::fromEntity)
                .toList();
    }

    // Остальные методы
}
