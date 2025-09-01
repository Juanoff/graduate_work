package edu.juanoff.taskmanager.mapper;

import edu.juanoff.taskmanager.dto.user.UserRequestDTO;
import edu.juanoff.taskmanager.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "tasks", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "assignments", ignore = true)
    @Mapping(target = "role", constant = "USER")
    @Mapping(target = "settings", ignore = true)
    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    User toEntity(UserRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "tasks", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "assignments", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "settings", ignore = true)
    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    void updateEntityFromDto(UserRequestDTO dto, @MappingTarget User user);
}
