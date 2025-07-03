package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.dto.achievement.AchievementRequestDTO;
import edu.juanoff.taskmanager.dto.achievement.AchievementResponseDTO;
import edu.juanoff.taskmanager.service.AchievementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AchievementController {

    private final AchievementService achievementService;

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AchievementResponseDTO>> getAllAchievements() {
        List<AchievementResponseDTO> achievements = achievementService.getAllAchievements();
        return ResponseEntity.ok(achievements);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AchievementResponseDTO> createAchievement(
            @Valid @RequestBody AchievementRequestDTO requestDTO
    ) {
        AchievementResponseDTO responseDTO = achievementService.createAchievement(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }
}
