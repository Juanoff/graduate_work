package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.invitation.InvitationRequestDTO;
import edu.juanoff.taskmanager.dto.invitation.InvitationResponseDTO;
import edu.juanoff.taskmanager.entity.Invitation;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.event.InvitationCreatedEvent;
import edu.juanoff.taskmanager.event.InvitationResponseCreatedEvent;
import edu.juanoff.taskmanager.repository.InvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final TaskAccessService taskAccessService;
    private final UserService userService;
    private final TaskService taskService;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public InvitationResponseDTO createInvitation(InvitationRequestDTO invitationRequestDTO) {
        User sender = userService.getUserById(invitationRequestDTO.senderId());
        User recipient = userService.getUserById(invitationRequestDTO.recipientId());
        Task task = taskService.getTaskEntityById(invitationRequestDTO.taskId());

        Invitation invitation = Invitation.builder()
                .task(task)
                .sender(sender)
                .recipient(recipient)
                .accessLevel(invitationRequestDTO.accessLevel())
                .status(Invitation.Status.PENDING)
                .build();

        Invitation saved = invitationRepository.save(invitation);
        eventPublisher.publishEvent(new InvitationCreatedEvent(saved));

        return InvitationResponseDTO.fromEntity(saved);
    }

    @Transactional
    public void acceptInvitation(Long invitationId, Long recipientId) {
        Invitation invitation = invitationRepository.findById(invitationId).orElseThrow();
        if (!invitation.getRecipient().getId().equals(recipientId)) {
            throw new AccessDeniedException("You are not the recipient");
        }

        invitation.setStatus(Invitation.Status.ACCEPTED);
        invitationRepository.save(invitation);

        taskAccessService.addTaskAccess(invitation);
        eventPublisher.publishEvent(new InvitationResponseCreatedEvent(invitation, "принял"));
    }

    @Transactional
    public void declineInvitation(Long invitationId, Long recipientId) {
        Invitation invitation = invitationRepository.findById(invitationId).orElseThrow();
        if (!invitation.getRecipient().getId().equals(recipientId)) {
            throw new AccessDeniedException("You are not the recipient");
        }

        invitation.setStatus(Invitation.Status.DECLINED);
        invitationRepository.save(invitation);

        eventPublisher.publishEvent(new InvitationResponseCreatedEvent(invitation, "отклонил"));
    }
}
