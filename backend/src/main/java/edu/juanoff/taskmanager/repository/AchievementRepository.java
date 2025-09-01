package edu.juanoff.taskmanager.repository;

import edu.juanoff.taskmanager.entity.Achievement;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AchievementRepository extends CrudRepository<Achievement, Long> {
    Achievement findByName(String name);
}
