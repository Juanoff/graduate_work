package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.dto.comment.CommentRequestDTO;
import edu.juanoff.taskmanager.dto.comment.CommentResponseDTO;
import edu.juanoff.taskmanager.security.UserDetailsImpl;
import edu.juanoff.taskmanager.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/task/{taskId}")
    @PreAuthorize("hasRole('USER') or hasRole('MANAGER') or hasRole('ADMIN')")
    public CommentResponseDTO createComment(
            @PathVariable Long taskId,
            @Valid @RequestBody CommentRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((UserDetailsImpl) userDetails).id();
        return commentService.createComment(taskId, dto, userId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@commentSecurityService.isCommentOwner(#id, principal.id) or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((UserDetailsImpl) userDetails).id();
        commentService.deleteComment(id, userId);
        return ResponseEntity.noContent().build();
    }
}
