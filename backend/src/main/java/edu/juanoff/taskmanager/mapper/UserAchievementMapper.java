package edu.juanoff.taskmanager.mapper;

import edu.juanoff.taskmanager.dto.user.UserAchievementResponseDTO;
import edu.juanoff.taskmanager.entity.UserAchievement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserAchievementMapper {
    @Mapping(target = "achievementId", source = "achievement.id")
    @Mapping(target = "achievementName", source = "achievement.name")
    @Mapping(target = "achievementDescription", source = "achievement.description")
    @Mapping(target = "targetValue", source = "achievement.targetValue")
    UserAchievementResponseDTO toDto(UserAchievement userAchievement);
}
