package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.UserAchievement;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAchievementRepository extends CrudRepository<UserAchievement, Long> {
    List<UserAchievement> findByUserId(Long userId);
}
