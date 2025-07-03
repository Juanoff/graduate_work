package edu.juanoff.taskmanager.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequestDTO(
        @NotBlank(message = "Comment content cannot be empty")
        @Size(max = 2000, message = "Comment must be less than 2000 characters")
        String content
) {
}
