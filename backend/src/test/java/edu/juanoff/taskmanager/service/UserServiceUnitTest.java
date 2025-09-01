package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.notification.NotificationSettingsRequestDTO;
import edu.juanoff.taskmanager.dto.user.UserRequestDTO;
import edu.juanoff.taskmanager.dto.user.UserResponseDTO;
import edu.juanoff.taskmanager.dto.user.UserSearchDTO;
import edu.juanoff.taskmanager.dto.user.UserUpdateRequestDTO;
import edu.juanoff.taskmanager.entity.NotificationSettings;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.entity.UserSettings;
import edu.juanoff.taskmanager.exception.BusinessLogicException;
import edu.juanoff.taskmanager.mapper.NotificationSettingsMapper;
import edu.juanoff.taskmanager.mapper.UserMapper;
import edu.juanoff.taskmanager.repository.UserRepository;
import edu.juanoff.taskmanager.repository.UserSettingsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @Mock
    private UserSettingsRepository userSettingsRepository;

    @Mock
    private NotificationSettingsMapper notificationSettingsMapper;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserRequestDTO userRequestDTO;
    private NotificationSettingsRequestDTO notificationSettingsDTO;
    private UserUpdateRequestDTO userUpdateRequestDTO;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .role(User.Role.USER)
                .build();

        userRequestDTO = new UserRequestDTO("testuser", "test@example.com", "password");

        notificationSettingsDTO = new NotificationSettingsRequestDTO(
                60,
                true,
                true,
                true
        );

        userUpdateRequestDTO = new UserUpdateRequestDTO(
                "newuser",
                "bio",
                "new@example.com",
                "currentPass",
                "newPass"
        );
    }

    @Test
    void shouldCreateUserSuccessfully() {
        when(userRepository.existsByEmail(userRequestDTO.email())).thenReturn(false);
        when(userMapper.toEntity(userRequestDTO)).thenReturn(user);
        when(passwordEncoder.encode(userRequestDTO.password())).thenReturn("hashedPassword");
        when(userRepository.save(user)).thenReturn(user);

        UserResponseDTO result = userService.createUser(userRequestDTO);

        assertNotNull(result);
        verify(userRepository).save(user);
        verify(passwordEncoder).encode(userRequestDTO.password());
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExistsOnCreate() {
        when(userRepository.existsByEmail(userRequestDTO.email())).thenReturn(true);

        assertThrows(BusinessLogicException.class, () -> userService.createUser(userRequestDTO));
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldUpdateUserSuccessfully() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .role(User.Role.USER)
                .build();

        UserRequestDTO userRequestDTO = new UserRequestDTO(
                "newuser",
                "new@example.com",
                "newpassword"
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail(userRequestDTO.email())).thenReturn(false);
        doNothing().when(userMapper).updateEntityFromDto(userRequestDTO, user);
        when(passwordEncoder.encode(userRequestDTO.password())).thenReturn("newHashedPassword");

        user.setUsername(userRequestDTO.username());
        user.setPasswordHash("newHashedPassword");
        when(userRepository.save(user)).thenReturn(user);

        UserResponseDTO result = userService.updateUser(1L, userRequestDTO);

        assertNotNull(result);
        assertEquals(userRequestDTO.username(), result.username());
        verify(userRepository).save(user);
        verify(userMapper).updateEntityFromDto(userRequestDTO, user);
    }

    @Test
    void shouldThrowExceptionWhenEmailTakenOnUpdate() {
        User existingUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .role(User.Role.USER)
                .build();

        UserRequestDTO userRequestDTO = new UserRequestDTO(
                "newuser",
                "taken@example.com",
                "newpassword"
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThrows(BusinessLogicException.class, () -> userService.updateUser(1L, userRequestDTO));

        verify(userRepository).findById(1L);
        verify(userRepository).existsByEmail("taken@example.com");
        verifyNoMoreInteractions(userRepository, userMapper, passwordEncoder);
    }

    @Test
    void shouldDeleteUserSuccessfully() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.deleteUser(1L);

        verify(userRepository).delete(user);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundOnDelete() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> userService.deleteUser(1L));
    }

    @Test
    void shouldGetAllUsersSuccessfully() {
        when(userRepository.findAllWithSettings()).thenReturn(List.of(user));

        List<User> result = userService.getAllUsers();

        assertEquals(1, result.size());
        verify(userRepository).findAllWithSettings();
    }

    @Test
    void shouldUpdateNotificationSettingsSuccessfully() {
        UserSettings settings = new UserSettings();
        when(userSettingsRepository.findByUserId(1L)).thenReturn(Optional.of(settings));
        when(notificationSettingsMapper.toEntity(notificationSettingsDTO)).thenReturn(new NotificationSettings());
        when(userSettingsRepository.save(settings)).thenReturn(settings);

        userService.updateNotificationSettings(1L, notificationSettingsDTO);

        verify(userSettingsRepository).save(settings);
    }

    @Test
    void shouldUpdateUserProfileSuccessfully() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByUsername(userUpdateRequestDTO.username())).thenReturn(false);
        when(userRepository.existsByEmail(userUpdateRequestDTO.email())).thenReturn(false);
        when(passwordEncoder.matches(userUpdateRequestDTO.currentPassword(), user.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode(userUpdateRequestDTO.newPassword())).thenReturn("newHashedPassword");
        when(userRepository.save(user)).thenReturn(user);

        userService.updateUser(1L, userUpdateRequestDTO);

        verify(userRepository).save(user);
        assertEquals(userUpdateRequestDTO.username(), user.getUsername());
        assertEquals(userUpdateRequestDTO.email(), user.getEmail());
    }

    @Test
    void shouldThrowExceptionWhenCurrentPasswordIncorrect() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(userUpdateRequestDTO.currentPassword(), user.getPasswordHash())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> userService.updateUser(1L, userUpdateRequestDTO));
    }

    @Test
    void shouldSearchUsersSuccessfully() {
        when(userRepository.findByUsernameContainingIgnoreCase("test")).thenReturn(List.of(user));

        List<UserSearchDTO> result = userService.searchUsers("test", null, 2L);

        assertEquals(1, result.size());
        verify(userRepository).findByUsernameContainingIgnoreCase("test");
    }
}
