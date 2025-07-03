package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.TaskAssignmentRequestDTO;
import edu.juanoff.taskmanager.dto.TaskAssignmentResponseDTO;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.TaskAssignment;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.exception.BusinessLogicException;
import edu.juanoff.taskmanager.mapper.TaskAssignmentMapper;
import edu.juanoff.taskmanager.repository.TaskAssignmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TaskAssignmentService {

    private final TaskAssignmentRepository assignmentRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final TaskAssignmentMapper assignmentMapper;

    public TaskAssignmentResponseDTO assignUserToTask(TaskAssignmentRequestDTO dto, Long assignerId) {
        Task task = taskService.getTaskEntityById(dto.taskId());
        User user = userService.getUserById(dto.userId());

        if (assignmentRepository.existsByTaskIdAndUserId(dto.taskId(), dto.userId())) {
            throw new BusinessLogicException("User already assigned to this task");
        }

        TaskAssignment assignment = new TaskAssignment();
        assignment.setTask(task);
        assignment.setUser(user);

        return TaskAssignmentResponseDTO.fromEntity(assignmentRepository.save(assignment));
    }

    public List<TaskAssignmentResponseDTO> getAssignmentsForTask(Long taskId) {
        return assignmentRepository.findAllByTaskId(taskId).stream()
                .map(TaskAssignmentResponseDTO::fromEntity)
                .toList();
    }

    // Остальные методы
}
