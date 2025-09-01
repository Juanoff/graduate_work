package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.config.security.SecurityConfig;
import edu.juanoff.taskmanager.dto.user.UserRequestDTO;
import edu.juanoff.taskmanager.dto.user.UserResponseDTO;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.exception.BusinessLogicException;
import edu.juanoff.taskmanager.mapper.UserMapperImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@Import({UserService.class, UserMapperImpl.class, SecurityConfig.class})
class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private TestEntityManager entityManager;

    @BeforeEach
    void setUp() {
        // Очищаем базу перед каждым тестом
        entityManager.clear();
    }

    @Test
    void shouldUpdateUserSuccessfully() {
        // Arrange
        User existingUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .role(User.Role.USER)
                .build();
        entityManager.persistAndFlush(existingUser);

        UserRequestDTO dto = new UserRequestDTO("newuser", "new@example.com", "newpassword");

        // Act
        UserResponseDTO result = userService.updateUser(existingUser.getId(), dto);

        // Assert
        assertNotNull(result);
        assertEquals("newuser", result.username());

        User updatedUser = entityManager.find(User.class, existingUser.getId());
        assertEquals("newuser", updatedUser.getUsername());
        assertEquals("new@example.com", updatedUser.getEmail());
        assertNotEquals("hashedPassword", updatedUser.getPasswordHash());
    }

    @Test
    void shouldThrowExceptionWhenEmailTakenOnUpdate() {
        // Arrange
        User existingUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .role(User.Role.USER)
                .build();
        User anotherUser = User.builder()
                .username("anotheruser")
                .email("taken@example.com")
                .passwordHash("hashedPassword")
                .role(User.Role.USER)
                .build();
        entityManager.persistAndFlush(existingUser);
        entityManager.persistAndFlush(anotherUser);

        UserRequestDTO dto = new UserRequestDTO("newuser", "taken@example.com", "newpassword");

        // Act & Assert
        BusinessLogicException exception = assertThrows(BusinessLogicException.class,
                () -> userService.updateUser(existingUser.getId(), dto));
        assertEquals("Email already taken", exception.getMessage());

        // Verify no changes
        User user = entityManager.find(User.class, existingUser.getId());
        assertEquals("testuser", user.getUsername());
        assertEquals("test@example.com", user.getEmail());
    }
}
