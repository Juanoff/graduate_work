package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.notification.NotificationSettingsRequestDTO;
import edu.juanoff.taskmanager.dto.user.*;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.entity.UserSettings;
import edu.juanoff.taskmanager.event.UserCreatedEvent;
import edu.juanoff.taskmanager.exception.BusinessLogicException;
import edu.juanoff.taskmanager.mapper.UserMapper;
import edu.juanoff.taskmanager.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final TaskAccessService taskAccessService;
    private final UserSettingsService userSettingsService;
    private final AvatarService avatarService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public UserResponseDTO createUser(UserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new BusinessLogicException("Email уже существует");
        }
        if (userRepository.existsByUsername(dto.username())) {
            throw new BusinessLogicException("Username уже существует");
        }

        User user = userMapper.toEntity(dto);
        user.setPasswordHash(passwordEncoder.encode(dto.password()));

        UserSettings us = userSettingsService.createDefaultSettings(user);
        user.setSettings(us);

        User savedUser = userRepository.save(user);

        eventPublisher.publishEvent(new UserCreatedEvent(savedUser));

        return UserResponseDTO.fromEntity(savedUser);
    }

    @Transactional
    public UserResponseDTO updateUser(Long userId, @Valid UserRequestDTO dto) {
        User existingUser = getUserById(userId);

        boolean emailChanged = !Objects.equals(dto.email(), existingUser.getEmail());
        if (emailChanged && userRepository.existsByEmail(dto.email())) {
            throw new BusinessLogicException("Email уже существует");
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

    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) throws IOException {
        User user = getUserById(userId);
        String avatarUrl = avatarService.uploadAvatar(userId, file, user.getAvatarUrl());
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return avatarUrl;
    }

    private void updateProfile(User user, String username, String bio) {
        if (StringUtils.hasText(username) && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("Username уже существует");
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
                throw new IllegalArgumentException("Email уже существует");
            }
            user.setEmail(email);
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

    @Transactional
    public void updateNotificationSettings(Long userId, NotificationSettingsRequestDTO request) {
        User user = getUserById(userId);
        userSettingsService.updateNotificationSettings(user, request);
    }
}
