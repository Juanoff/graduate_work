package edu.juanoff.taskmanager.dto.comment;

import edu.juanoff.taskmanager.entity.Comment;

import java.time.LocalDateTime;

public record CommentResponseDTO(
        Long id,
        String content,
        LocalDateTime createdAt,
        Long taskId,
        Long userId,
        String username
) {
    public static CommentResponseDTO fromEntity(Comment comment) {
        return new CommentResponseDTO(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getTask().getId(),
                comment.getUser().getId(),
                comment.getUser().getUsername()
        );
    }
}
