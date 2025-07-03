package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.GoogleToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoogleTokenRepository extends JpaRepository<GoogleToken, Long> {
    Optional<GoogleToken> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
