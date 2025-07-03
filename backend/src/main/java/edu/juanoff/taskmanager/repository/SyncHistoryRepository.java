package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.SyncHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SyncHistoryRepository extends JpaRepository<SyncHistory, Long> {
    Optional<SyncHistory> findTopByUserIdAndStatusOrderBySyncTimeDesc(Long userId, String status);
}
