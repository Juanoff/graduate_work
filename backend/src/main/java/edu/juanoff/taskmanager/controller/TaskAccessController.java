package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.dto.access.AccessLevelUpdateRequestDTO;
import edu.juanoff.taskmanager.dto.access.TaskAccessResponseDTO;
import edu.juanoff.taskmanager.entity.TaskAccess;
import edu.juanoff.taskmanager.security.UserDetailsImpl;
import edu.juanoff.taskmanager.service.TaskAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/task-access")
@RequiredArgsConstructor
public class TaskAccessController {

    private final TaskAccessService taskAccessService;

    @PatchMapping("/{id}")
    public ResponseEntity<TaskAccessResponseDTO> updateAccessLevel(
            @PathVariable Long id,
            @Valid @RequestBody AccessLevelUpdateRequestDTO dto
    ) {
        TaskAccess updated = taskAccessService.updateAccessLevel(id, dto.accessLevel());
        return ResponseEntity.ok(TaskAccessResponseDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccess(@PathVariable Long id) {
        taskAccessService.deleteAccess(id);
        return ResponseEntity.noContent().build();
    }
}
