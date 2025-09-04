package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.achievement.AchievementRequestDTO;
import edu.juanoff.taskmanager.dto.achievement.AchievementResponseDTO;
import edu.juanoff.taskmanager.entity.Achievement;
import edu.juanoff.taskmanager.event.AchievementCreatedEvent;
import edu.juanoff.taskmanager.mapper.AchievementMapper;
import edu.juanoff.taskmanager.repository.AchievementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final AchievementMapper achievementMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public AchievementResponseDTO createAchievement(AchievementRequestDTO requestDTO) {
        Achievement achievement = achievementMapper.toEntity(requestDTO);
        Achievement savedAchievement = achievementRepository.save(achievement);

        eventPublisher.publishEvent(new AchievementCreatedEvent(savedAchievement));

        return achievementMapper.toDto(achievementRepository.save(achievement));
    }

    @Transactional(readOnly = true)
    public List<AchievementResponseDTO> getAllAchievements() {
        return StreamSupport.stream(achievementRepository.findAll().spliterator(), false)
                .map(achievementMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Achievement> getAllAchievementEntities() {
        return StreamSupport.stream(achievementRepository.findAll().spliterator(), false)
                .toList();
    }
}
