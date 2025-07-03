package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.access.TaskAccessResponseDTO;
import edu.juanoff.taskmanager.entity.AccessLevel;
import edu.juanoff.taskmanager.entity.Invitation;
import edu.juanoff.taskmanager.entity.TaskAccess;
import edu.juanoff.taskmanager.event.AccessLevelChangedEvent;
import edu.juanoff.taskmanager.event.AccessLevelRemovedEvent;
import edu.juanoff.taskmanager.repository.TaskAccessRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskAccessService {

    private final TaskAccessRepository taskAccessRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void addTaskAccess(Invitation invitation) {
        TaskAccess access = TaskAccess.builder()
                .task(invitation.getTask())
                .user(invitation.getRecipient())
                .accessLevel(invitation.getAccessLevel())
                .build();
        taskAccessRepository.save(access);
    }

    @Transactional(readOnly = true)
    public List<TaskAccessResponseDTO> getTaskAccessResponseDTOList(Long taskId) {
        return getTaskAccessList(taskId).stream()
                .map(TaskAccessResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskAccess> getTaskAccessList(Long taskId) {
        return taskAccessRepository.findAllByTaskId(taskId).stream()
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskAccess> getTaskAccessListByUserId(Long userId) {
        return taskAccessRepository.findAllByUserId(userId).stream()
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskAccess getTaskAccessById(Long id) {
        return taskAccessRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("TaskAccess not found with id: " + id));
    }

    @Transactional
    public TaskAccess updateAccessLevel(Long id, AccessLevel accessLevel) {
        TaskAccess access = getTaskAccessById(id);
        access.setAccessLevel(accessLevel);
        TaskAccess updated = taskAccessRepository.save(access);

        eventPublisher.publishEvent(new AccessLevelChangedEvent(updated));
        return updated;
    }

    @Transactional
    public void deleteAccess(Long id) {
        TaskAccess access = getTaskAccessById(id);
        taskAccessRepository.delete(access);

        eventPublisher.publishEvent(new AccessLevelRemovedEvent(access));
    }
}
