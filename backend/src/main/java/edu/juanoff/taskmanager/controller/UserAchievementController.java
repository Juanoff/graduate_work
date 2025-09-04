package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.dto.user.UserAchievementResponseDTO;
import edu.juanoff.taskmanager.security.UserDetailsImpl;
import edu.juanoff.taskmanager.service.UserAchievementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user-achievements")
@Validated
@RequiredArgsConstructor
public class UserAchievementController {

    private final UserAchievementService userAchievementService;

    @GetMapping("/me")
    public ResponseEntity<List<UserAchievementResponseDTO>> getCurrentUserAchievements(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        List<UserAchievementResponseDTO> achievements = userAchievementService.getUserAchievements(userDetails.id());
        return ResponseEntity.ok(achievements);
    }
}
