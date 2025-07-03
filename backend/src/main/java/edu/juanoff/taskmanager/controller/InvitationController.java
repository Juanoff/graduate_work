package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.dto.invitation.InvitationRequestDTO;
import edu.juanoff.taskmanager.dto.invitation.InvitationResponseDTO;
import edu.juanoff.taskmanager.security.UserDetailsImpl;
import edu.juanoff.taskmanager.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invitations")
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping
    public ResponseEntity<InvitationResponseDTO> createInvitation(
            @Valid @RequestBody InvitationRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invitationService.createInvitation(dto));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<Void> acceptInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        invitationService.acceptInvitation(id, userDetails.id());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<Void> declineInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        invitationService.declineInvitation(id, userDetails.id());
        return ResponseEntity.ok().build();
    }
}
