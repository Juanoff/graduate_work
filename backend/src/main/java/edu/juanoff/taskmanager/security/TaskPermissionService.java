package edu.juanoff.taskmanager.security;

import edu.juanoff.taskmanager.repository.TaskAccessRepository;
import edu.juanoff.taskmanager.repository.TaskRepository;
import edu.juanoff.taskmanager.util.CacheNames;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskPermissionService {

    private final TaskRepository taskRepository;
    private final TaskAccessRepository taskAccessRepository;

    @Cacheable(value = CacheNames.TASK_OWNERSHIP, key = "{#taskId, #userId}")
    public boolean isTaskOwner(Long taskId, Long userId) {
        return taskRepository.existsByIdAndUserId(taskId, userId);
    }

    @Cacheable(value = CacheNames.TASK_ACCESS, key = "{#taskId, #userId}")
    public boolean hasTaskAccess(Long taskId, Long userId) {
        return taskAccessRepository.existsByTaskIdAndUserId(taskId, userId);
    }
}
