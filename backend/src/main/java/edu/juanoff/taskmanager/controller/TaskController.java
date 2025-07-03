package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.dto.access.TaskAccessResponseDTO;
import edu.juanoff.taskmanager.dto.task.*;
import edu.juanoff.taskmanager.dto.user.UserDTO;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.TaskAccess;
import edu.juanoff.taskmanager.filter.TaskSearchRequestDTO;
import edu.juanoff.taskmanager.security.UserDetailsImpl;
import edu.juanoff.taskmanager.service.TaskAccessService;
import edu.juanoff.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final TaskAccessService taskAccessService;

    @PostMapping
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or hasRole('USER')
            \s""")
    public ResponseEntity<TaskResponseDTO> createTask(
            @Valid @RequestBody TaskRequestDTO dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(dto, userDetails.id()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or @taskPermissionService.isTaskOwner(#id, principal.id)\s
                 or @taskPermissionService.hasTaskAccess(#id, principal.id)
            \s""")
    public TaskWithSubtasksResponseDTO getTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        return taskService.getTaskById(id, userDetails.id());
    }

    @PutMapping("/{id}")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or @taskPermissionService.isTaskOwner(#id, principal.id)\s
                 or @taskPermissionService.hasTaskAccess(#id, principal.id)
            \s""")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDTO dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, dto, userDetails.id()));
    }

    @GetMapping
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or hasRole('USER')
            \s""")
    public ResponseEntity<List<TaskResponseDTO>> getUserTasks(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        return ResponseEntity.ok(taskService.getTopLevelTasks(userDetails.id()));
    }

    @GetMapping("/search")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or hasRole('USER')
            \s""")
    public List<TaskResponseDTO> searchTasks(TaskSearchRequestDTO request) {
        return taskService.searchTasks(request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or @taskPermissionService.isTaskOwner(#id, principal.id)
            \s""")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        taskService.deleteTask(id, userDetails.id());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/today")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or hasRole('USER')
            \s""")
    public ResponseEntity<List<TaskResponseDTO>> getUserTodayTasks(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        return ResponseEntity.ok(taskService.getTodayTasks(userDetails.id()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or @taskPermissionService.isTaskOwner(#id, principal.id)\s
                 or @taskPermissionService.hasTaskAccess(#id, principal.id)
            \s""")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusUpdateRequestDTO dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        try {
            boolean updated = taskService.updateTaskStatus(id, dto, userDetails.id());
            if (!updated) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Task not found or permission denied");
            }
            return ResponseEntity.ok().body("Status updated successfully");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/due-date")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or @taskPermissionService.isTaskOwner(#id, principal.id)\s
                 or @taskPermissionService.hasTaskAccess(#id, principal.id)
            \s""")
    public ResponseEntity<?> updateTaskDueDate(
            @PathVariable Long id,
            @Valid @RequestBody TaskDueDateUpdateRequestDTO dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        try {
            boolean updated = taskService.updateTaskDueDate(id, dto, userDetails.id());
            if (!updated) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Task not found or permission denied");
            }
            return ResponseEntity.ok().body("Due date updated successfully");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/upcoming")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or hasRole('USER')
            \s""")
    public ResponseEntity<List<TaskResponseDTO>> getUpcomingTasks(
            @RequestParam("minutes") int minutes,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        List<TaskResponseDTO> upcomingTasks = taskService.getUpcomingTasks(userDetails.id(), minutes);
        return ResponseEntity.ok(upcomingTasks);
    }

    @GetMapping("/upcoming/notNotified")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or hasRole('USER')
            \s""")
    public ResponseEntity<List<TaskResponseDTO>> getNotNotifiedUpcomingTasks(
            @RequestParam("minutes") int minutes,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        List<TaskResponseDTO> upcomingTasks = taskService.getNotNotifiedUpcomingTasks(userDetails.id(), minutes);
        return ResponseEntity.ok(upcomingTasks);
    }

    @PatchMapping("/upcoming")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or hasRole('USER')
            \s""")
    public ResponseEntity<?> updateTasksNotified(
            @RequestParam("minutes") int minutes,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        taskService.markTasksAsNotified(userDetails.id(), minutes);
        return ResponseEntity.ok().body("Tasks updated successfully");
    }

    @GetMapping("/{id}/access")
    @PreAuthorize("""
                 hasRole('ADMIN')\s
                 or hasRole('USER')
            \s""")
    public List<TaskAccessResponseDTO> getTaskAccessList(
            @PathVariable Long id
    ) {
        return taskAccessService.getTaskAccessResponseDTOList(id);
    }

    @GetMapping("/users")
    public List<UserDTO> getTaskUsers(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return taskAccessService.getTaskAccessListByUserId(userDetails.id())
                .stream()
                .map(TaskAccess::getTask)
                .map(Task::getUser)
                .distinct()
                .map(user -> new UserDTO(user.getId(), user.getUsername()))
                .toList();
    }
}
