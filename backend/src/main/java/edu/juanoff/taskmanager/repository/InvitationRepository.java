package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.Invitation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends CrudRepository<Invitation, Long> {

    boolean existsByTaskIdAndRecipientId(Long taskId, Long recipientId);

    List<Invitation> findAllByRecipientIdAndStatus(Long recipientId, Invitation.Status status);

    Optional<Invitation> findByIdAndRecipientId(Long id, Long recipientId);
}
