package edu.juanoff.taskmanager.mapper;

import edu.juanoff.taskmanager.dto.achievement.AchievementRequestDTO;
import edu.juanoff.taskmanager.dto.achievement.AchievementResponseDTO;
import edu.juanoff.taskmanager.entity.Achievement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AchievementMapper {
    @Mapping(target = "id", ignore = true)
    Achievement toEntity(AchievementRequestDTO dto);

    AchievementResponseDTO toDto(Achievement achievement);
}
