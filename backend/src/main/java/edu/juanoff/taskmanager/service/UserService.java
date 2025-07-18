package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.notification.NotificationSettingsRequestDTO;
import edu.juanoff.taskmanager.dto.user.*;
import edu.juanoff.taskmanager.entity.NotificationSettings;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.entity.UserSettings;
import edu.juanoff.taskmanager.exception.BusinessLogicException;
import edu.juanoff.taskmanager.mapper.NotificationSettingsMapper;
import edu.juanoff.taskmanager.mapper.UserMapper;
import edu.juanoff.taskmanager.repository.UserRepository;
import edu.juanoff.taskmanager.repository.UserSettingsRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserSettingsRepository userSettingsRepository;
    private final NotificationSettingsMapper notificationSettingsMapper;
    private final TaskAccessService taskAccessService;

    // Константы для загрузки аватарок
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif");
    private static final String UPLOAD_DIR = "uploads/avatars/";

    @Transactional
    public UserResponseDTO createUser(UserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new BusinessLogicException("Email already registered");
        }

        User user = userMapper.toEntity(dto);
        user.setPasswordHash(passwordEncoder.encode(dto.password()));
        return UserResponseDTO.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserResponseDTO updateUser(Long userId, @Valid UserRequestDTO dto) {
        User existingUser = getUserById(userId);

        boolean emailChanged = !Objects.equals(dto.email(), existingUser.getEmail());
        if (emailChanged && userRepository.existsByEmail(dto.email())) {
            throw new BusinessLogicException("Email already taken");
        }

        boolean hasChanges = !dto.username().equals(existingUser.getUsername()) ||
                emailChanged || dto.password() != null;

        if (!hasChanges) {
            log.debug("No changes detected for user ID: {}", userId);
            return UserResponseDTO.fromEntity(existingUser);
        }

        userMapper.updateEntityFromDto(dto, existingUser);
        if (dto.password() != null) {
            existingUser.setPasswordHash(passwordEncoder.encode(dto.password()));
        }

        return UserResponseDTO.fromEntity(userRepository.save(existingUser));
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserResponseDTOById(Long userId) {
        return UserResponseDTO.fromEntity(getUserById(userId));
    }

    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserProfileResponseDTOById(Long userId) {
        return UserProfileResponseDTO.fromEntity(getUserById(userId));
    }

    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserProfileResponseDTOByUsername(String username) {
        return UserProfileResponseDTO.fromEntity(getUserByUsername(username));
    }

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found for username: " + username));
    }

    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found for id: " + userId));
    }

    @Transactional
    public UserResponseDTO updateUserRole(Long userId, UserRoleUpdateDTO dto) {
        User user = getUserById(userId);
        user.setRole(dto.role());
        return UserResponseDTO.fromEntity(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAllWithSettings().stream().toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsersResponseDTO() {
        return userRepository.findAllWithSettings().stream().map(UserResponseDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<UserInfoResponseDTO> getAllUsersInfoResponseDTO() {
        return userRepository.findAllWithSettings().stream().map(UserInfoResponseDTO::fromEntity).toList();
    }

    @Transactional
    public void updateNotificationSettings(Long userId, NotificationSettingsRequestDTO ns) {
        NotificationSettings notificationSettings = notificationSettingsMapper.toEntity(ns);
        UserSettings userSettings = getUserSettingsByUserId(userId);
        boolean success = userSettings.setNotificationSettingsObj(notificationSettings);
        if (!success) {
            throw new BusinessLogicException("Couldn't save notification settings");
        }
        userSettingsRepository.save(userSettings);
    }

    @Transactional(readOnly = true)
    public UserSettings getUserSettingsByUserId(Long userId) {
        return userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = getUserById(userId);
                    return UserSettings.builder()
                            .user(user)
                            .build();
                });
    }

    @Transactional(readOnly = true)
    public String getNotificationSettingsByUserId(Long userId) {
        User user = getUserById(userId);
        return user.getSettings().getNotificationSettings();
    }

    @Transactional(readOnly = true)
    public long getMaxTaskNotificationInterval() {
        return userRepository.findMaxTaskNotificationInterval();
    }

    @Transactional
    public void updateUser(Long userId, UserUpdateRequestDTO dto) {
        User user = getUserById(userId);

        updateProfile(user, dto.username(), dto.bio());

        if (StringUtils.hasText(dto.email())) {
            updateEmail(user, dto.email());
        }

        if (StringUtils.hasText(dto.currentPassword()) || StringUtils.hasText(dto.newPassword())) {
            updatePassword(user, dto.currentPassword(), dto.newPassword());
        }

        userRepository.save(user);
    }

    private void updateProfile(User user, String username, String bio) {
        if (StringUtils.hasText(username) && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("Username already exists");
            }
            user.setUsername(username);
        }

        if (bio != null && !bio.equals(user.getBio())) {
            user.setBio(bio);
        }
    }

    private void updateEmail(User user, String email) {
        if (email != null && !email.equals(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email already exists");
            }
            user.setEmail(email);
            // TODO: Отправить письмо для подтверждения нового email
        }
    }

    private void updatePassword(User user, String currentPassword, String newPassword) {
        if (currentPassword != null && newPassword != null) {
            if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                throw new IllegalArgumentException("Current password is incorrect");
            }

            if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
                throw new IllegalArgumentException("New password must differ from the current one");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
    }

    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) throws IOException {
        User user = getUserById(userId);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename.isEmpty()) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new IllegalArgumentException("Only JPG, JPEG, PNG, and GIF files are allowed");
        }

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String uniqueFileName = UUID.randomUUID() + "_" + userId + "." + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.write(filePath, file.getBytes());

        if (user.getAvatarUrl() != null) {
            Path oldFilePath = Paths.get(user.getAvatarUrl());
            if (Files.exists(oldFilePath)) {
                Files.delete(oldFilePath);
            }
        }

        String avatarUrl = UPLOAD_DIR + uniqueFileName;
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return avatarUrl;
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex == -1 ? "" : filename.substring(dotIndex + 1);
    }

    public List<UserSearchDTO> searchUsers(String search, Long taskId, Long userId) {
        List<UserSearchDTO> users = userRepository.findByUsernameContainingIgnoreCase(search)
                .stream()
                .filter(u -> !u.getId().equals(userId) && !u.getRole().equals(User.Role.ADMIN))
                .map(u -> new UserSearchDTO(u.getId(), u.getUsername(), u.getAvatarUrl(), u.getUsername()))
                .toList();

        if (taskId != null) {
            List<Long> invitedUserIds = taskAccessService.getTaskAccessList(taskId)
                    .stream()
                    .map(taskAccess -> taskAccess.getUser().getId())
                    .toList();

            users = users.stream()
                    .filter(user -> !invitedUserIds.contains(user.id()))
                    .toList();
        }

        return users;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new EntityNotFoundException("User not found with email: " + email)
        );
    }
}
