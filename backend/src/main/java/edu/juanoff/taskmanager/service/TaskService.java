package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.task.*;
import edu.juanoff.taskmanager.entity.*;
import edu.juanoff.taskmanager.event.AchievementsUpdatedEvent;
import edu.juanoff.taskmanager.event.TaskUpdatedEvent;
import edu.juanoff.taskmanager.filter.TaskSearchRequestDTO;
import edu.juanoff.taskmanager.filter.TaskSpecificationBuilder;
import edu.juanoff.taskmanager.handler.AchievementAction;
import edu.juanoff.taskmanager.mapper.TaskMapper;
import edu.juanoff.taskmanager.repository.TaskAccessRepository;
import edu.juanoff.taskmanager.repository.TaskRepository;
import edu.juanoff.taskmanager.util.CacheNames;
import edu.juanoff.taskmanager.util.TaskStatusUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final TaskAccessRepository taskAccessRepository;
    private final UserService userService;
    private final CategoryService categoryService;
    private final ApplicationEventPublisher eventPublisher;
    private final TaskSpecificationBuilder specBuilder;

    @Transactional
    public TaskResponseDTO createTask(TaskRequestDTO taskDto, Long userId) {
        User user = userService.getUserById(userId);
        Task task = taskMapper.toEntity(taskDto);
        task.setUser(user);

        if (taskDto.parentTaskId() != null) {
            Task parentTask = getTaskByIdAndUserId(taskDto.parentTaskId(), userId);
            task.setParentTask(parentTask);
        }

        if (taskDto.categoryId() != null) {
            Category category = categoryService.getCategoryEntityById(taskDto.categoryId());
            task.setCategory(category);
        }

        if (task.getParentTask() != null) {
            Task parentTask = getTaskEntityById(task.getParentTask().getId());
            task.setCategory(parentTask.getCategory());
        }

        Task savedTask = taskRepository.save(task);

        eventPublisher.publishEvent(new AchievementsUpdatedEvent(userId, null, savedTask, AchievementAction.CREATE));
        if (TaskStatusUtils.hasTaskJustBeenCompleted(null, savedTask)) {
            savedTask = markTaskAsCompleted(savedTask);
        }

        return TaskResponseDTO.fromEntity(savedTask, AccessLevel.OWNER);
    }

    @Transactional
    public TaskResponseDTO updateTask(Long taskId, TaskRequestDTO dto, Long userId) {
        Task existingTask = getTaskEntityById(taskId); //! Было by id and userId
        TaskResponseDTO curTask = taskMapper.toDto(existingTask);

        //! Прислать новое уведомление, если срок выполнения был измненен
        if (dto.dueDate() != existingTask.getDueDate()) {
            existingTask.setNotified(false);
        }

        taskMapper.updateEntityFromDto(dto, existingTask);

        //! Выше проверка dueDate на null, но нужно иметь возможность убрать срок выполнения
        existingTask.setDueDate(dto.dueDate());

        if (dto.parentTaskId() != null && !dto.parentTaskId().equals(existingTask.getParentTask().getId())) {
            Task parentTask = getTaskByIdAndUserId(dto.parentTaskId(), userId);
            existingTask.setParentTask(parentTask);
        } else if (dto.parentTaskId() == null) {
            existingTask.setParentTask(null);
        }

        if (existingTask.getUser().getId().equals(userId)) {
            if (dto.categoryId() != null) {
                Category category = categoryService.getCategoryEntityById(dto.categoryId());
                existingTask.setCategory(category);

                //! В подзадачах меняем категорию тоже
                existingTask.getSubtasks().forEach(subtask -> subtask.setCategory(category));
            } else {
                existingTask.setCategory(null);

                //! В подзадачах ставим без категории тоже
                existingTask.getSubtasks().forEach(subtask -> subtask.setCategory(null));
            }
        }

        if (dto.status().equals(Task.StatusType.DONE)) {
            existingTask.setCompletedAt(LocalDateTime.now());
        }

        Task savedTask = taskRepository.save(existingTask);

        if (savedTask.getUser().getId().equals(userId)) {
            eventPublisher.publishEvent(new AchievementsUpdatedEvent(userId, curTask, savedTask, AchievementAction.COMPLETE));
        }

        if (TaskStatusUtils.hasTaskJustBeenCompleted(curTask, savedTask)) {
            savedTask = markTaskAsCompleted(savedTask);
        } else if (TaskStatusUtils.hasTaskBeenRevertedToIncomplete(curTask, savedTask)) {
            savedTask = markTaskAsIncomplete(savedTask);
        }

        eventPublisher.publishEvent(new TaskUpdatedEvent(TaskUpdateDTO.fromEntity(savedTask, dto.accessLevel()), userId));

        return TaskResponseDTO.fromEntity(savedTask, dto.accessLevel());
    }

    @Transactional
    @CacheEvict(value = CacheNames.TASK_OWNERSHIP, key = "{#taskId, #userId}")
    public void deleteTask(Long taskId, Long userId) {
        Task task = getTaskByIdAndUserId(taskId, userId);
        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    public Task getTaskByIdAndUserId(Long taskId, Long userId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Task not found with id: " + taskId + " and user_id: " + userId
                ));
    }

    @Transactional(readOnly = true)
    public TaskWithSubtasksResponseDTO getTaskById(Long taskId, Long userId) {
        Task task = getTaskEntityById(taskId);

        AccessLevel accessLevel;
        if (task.getUser().getId().equals(userId)) {
            accessLevel = AccessLevel.OWNER;
        } else {
            TaskAccess sharedAccess = taskAccessRepository.findByTaskIdAndUserId(taskId, userId)
                    .orElseThrow(() -> new AccessDeniedException(
                            "User with id: " + userId + " does not have access to this task"
                    ));

            accessLevel = sharedAccess.getAccessLevel();
        }

        return TaskWithSubtasksResponseDTO.fromEntity(task, accessLevel);
    }

    @Transactional(readOnly = true)
    public Task getTaskEntityById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));
    }

    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getTodayTasks(Long userId) {
        LocalDate today = LocalDate.now();
        List<Task> tasks = taskRepository.findByUserIdAndDueDateBetween(
                userId,
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );
        return tasks.stream().map(t -> TaskResponseDTO.fromEntity(t, AccessLevel.OWNER)).toList();
    }

    @Transactional
    public boolean updateTaskStatus(Long taskId, TaskStatusUpdateRequestDTO dto, Long userId) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return false;
        }

        Task task = taskOpt.get();
//        // Проверка прав доступа
//        boolean isOwner = task.getUser().getId().equals(userId);
//        boolean hasEditAccess = task.getSharedWith().stream()
//                .anyMatch(ta -> ta.getUser().getId().equals(userId) && ta.getAccessLevel() == AccessLevel.EDIT);
//        if (!isOwner && !hasEditAccess) {
//            return false;
//        }

        if (task.getDueDate() != null && task.getDueDate().isBefore(LocalDateTime.now())) {
            if (dto.status() != Task.StatusType.DONE) {
                throw new IllegalStateException("Cannot change status of overdue task except to DONE");
            }
        }

        TaskResponseDTO curTask = taskMapper.toDto(task);
        task.setStatus(dto.status());

        Task savedTask = taskRepository.save(task);

        eventPublisher.publishEvent(new AchievementsUpdatedEvent(userId, curTask, savedTask, AchievementAction.COMPLETE));

        if (TaskStatusUtils.hasTaskJustBeenCompleted(curTask, savedTask)) {
            markTaskAsCompleted(savedTask);
        } else if (TaskStatusUtils.hasTaskBeenRevertedToIncomplete(curTask, savedTask)) {
            markTaskAsIncomplete(savedTask);
        }

        eventPublisher.publishEvent(
                new TaskUpdatedEvent(TaskUpdateDTO.fromEntity(savedTask, dto.accessLevel()), userId)
        );
        return true;
    }

    @Transactional
    public boolean updateTaskDueDate(Long taskId, TaskDueDateUpdateRequestDTO dto, Long userId) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return false;
        }

        Task task = taskOpt.get();
        TaskResponseDTO curTask = taskMapper.toDto(task);
        task.setDueDate(dto.dueDate());

        Task savedTask = taskRepository.save(task);

        eventPublisher.publishEvent(new AchievementsUpdatedEvent(userId, curTask, savedTask, AchievementAction.COMPLETE));

        if (TaskStatusUtils.hasTaskJustBeenCompleted(curTask, savedTask)) {
            markTaskAsCompleted(savedTask);
        } else if (TaskStatusUtils.hasTaskBeenRevertedToIncomplete(curTask, savedTask)) {
            markTaskAsIncomplete(savedTask);
        }

        eventPublisher.publishEvent(
                new TaskUpdatedEvent(TaskUpdateDTO.fromEntity(savedTask, dto.accessLevel()), userId)
        );

        return true;
    }

    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getTopLevelTasks(Long userId) {
        // Получаем текущего пользователя
        User user = userService.getUserById(userId);

        // Получаем собственные задачи пользователя
        List<Task> ownedTasks = taskRepository.findByUserIdAndParentTaskIsNull(user.getId());

        // Получаем задачи из TaskAccess
        List<TaskAccess> sharedTasksAccess = taskAccessRepository.findAllByUserId(user.getId());

        // Объединяем списки и преобразуем в DTO с указанием прав доступа
        List<TaskResponseDTO> allTasks = new ArrayList<>();

        // Собственные задачи (полные права)
        allTasks.addAll(ownedTasks.stream()
                .map(task -> TaskResponseDTO.fromEntity(task, AccessLevel.OWNER))
                .toList());

        // Задачи из TaskAccess (с соответствующими правами)
        allTasks.addAll(sharedTasksAccess.stream()
                .map(access -> TaskResponseDTO.fromEntity(access.getTask(), access.getAccessLevel()))
                .toList());

        return allTasks;
    }

    @Transactional
    public void updateCategoryToNull(Long categoryId, Long userId) {
        taskRepository.updateCategoryToNull(categoryId, userId);
    }

    @Transactional(readOnly = true)
    public List<Task> getNotNotifiedUpcomingEntityTasks(Long userId, int minutes) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endTime = now.plusMinutes(minutes);
        return taskRepository.findNotNotifiedUpcomingTasks(userId, now, endTime);
    }

    @Transactional(readOnly = true)
    public List<Task> getUpcomingEntityTasks(Long userId, int minutes) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endTime = now.plusMinutes(minutes);
        return taskRepository.findByUserIdAndDueDateBetween(userId, now, endTime);
    }

    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getUpcomingTasks(Long userId, int minutes) {
        List<Task> tasks = getUpcomingEntityTasks(userId, minutes);
        return tasks.stream().map(taskMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getNotNotifiedUpcomingTasks(Long userId, int minutes) {
        List<Task> tasks = getNotNotifiedUpcomingEntityTasks(userId, minutes);
        return tasks.stream().map(taskMapper::toDto).toList();
    }

    @Transactional
    public void markTasksAsNotified(Long userId, int minutes) {
        List<Task> upcomingTasks = getNotNotifiedUpcomingEntityTasks(userId, minutes);
        for (Task task : upcomingTasks) {
            task.setNotified(true);
            taskRepository.save(task);
        }
    }

    public void setTaskNotified(Task task) {
        task.setNotified(true);
        taskRepository.save(task);
    }

    public Task markTaskAsCompleted(Task task) {
        task.setCompletedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Task markTaskAsIncomplete(Task task) {
        task.setCompletedAt(null);
        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public List<Task> getAllNotNotifiedUpcomingTasks(LocalDateTime start, LocalDateTime end) {
        return taskRepository.findByDueDateBetweenAndNotifiedFalse(start, end);
    }

    @Transactional(readOnly = true)
    public List<TaskResponseDTO> searchTasks(TaskSearchRequestDTO request) {
        Specification<Task> spec = specBuilder.build(request);
        return taskRepository.findAll(spec)
                .stream()
                .map(t -> TaskResponseDTO.fromEntity(t, AccessLevel.OWNER))
                .toList();
    }
}
