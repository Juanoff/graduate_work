package edu.juanoff.taskmanager.controller;

import edu.juanoff.taskmanager.dto.notification.NotificationSettingsRequestDTO;
import edu.juanoff.taskmanager.dto.user.UserInfoResponseDTO;
import edu.juanoff.taskmanager.dto.user.UserProfileResponseDTO;
import edu.juanoff.taskmanager.dto.user.UserSearchDTO;
import edu.juanoff.taskmanager.dto.user.UserUpdateRequestDTO;
import edu.juanoff.taskmanager.security.UserDetailsImpl;
import edu.juanoff.taskmanager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Validated
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/all")
    public ResponseEntity<List<UserInfoResponseDTO>> getAllUsers() {
        List<UserInfoResponseDTO> users = userService.getAllUsersInfoResponseDTO();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getCurrentUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        UserProfileResponseDTO user = userService.getUserProfileResponseDTOById(userDetails.id());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponseDTO> getUserByUsername(
            @PathVariable String username
    ) {
        UserProfileResponseDTO user = userService.getUserProfileResponseDTOByUsername(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me/notification-settings")
    public ResponseEntity<String> getNotificationSettings(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        String settings = userService.getNotificationSettingsByUserId(userDetails.id());
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/me/notification-settings")
    public ResponseEntity<String> updateNotificationSettings(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody NotificationSettingsRequestDTO request
    ) {
        userService.updateNotificationSettings(userDetails.id(), request);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/me")
    public ResponseEntity<Void> updateUser(
            @Valid @RequestBody UserUpdateRequestDTO dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        userService.updateUser(userDetails.id(), dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("userId") Long userId,
            @RequestParam("avatar") MultipartFile file
    ) throws IOException {
        String avatarUrl = userService.uploadAvatar(userId, file);
        return ResponseEntity.ok(Map.of("url", avatarUrl));
    }

    @GetMapping
    public ResponseEntity<List<UserSearchDTO>> searchUsers(
            @RequestParam String search,
            @RequestParam(required = false) Long taskId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        return ResponseEntity.ok(userService.searchUsers(search, taskId, userDetails.id()));
    }
}
