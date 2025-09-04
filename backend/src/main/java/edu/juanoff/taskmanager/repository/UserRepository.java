package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.settings")
    List<User> findAllWithSettings();

    @Query(value = "SELECT COALESCE(MAX(CAST(notification_settings::json->>'taskNotificationInterval' AS INTEGER)), 1440) " +
            "FROM user_settings " +
            "WHERE (notification_settings::json->>'taskEnabled') = 'true'",
            nativeQuery = true)
    Long findMaxTaskNotificationInterval();

    List<User> findByUsernameContainingIgnoreCase(String username);
}
