package edu.juanoff.taskmanager.mapper;

import edu.juanoff.taskmanager.dto.task.TaskRequestDTO;
import edu.juanoff.taskmanager.dto.task.TaskResponseDTO;
import edu.juanoff.taskmanager.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TaskMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "parentTask", ignore = true)
    @Mapping(target = "subtasks", ignore = true)
    @Mapping(target = "assignments", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "sharedWith", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "notified", ignore = true)
    Task toEntity(TaskRequestDTO dto);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "parentTaskId", source = "parentTask.id")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "subtasksCount", ignore = true)
    @Mapping(target = "accessLevel", ignore = true)
    TaskResponseDTO toDto(Task task);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "parentTask", ignore = true)
    @Mapping(target = "subtasks", ignore = true)
    @Mapping(target = "assignments", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "sharedWith", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "notified", ignore = true)
    void updateEntityFromDto(TaskRequestDTO dto, @MappingTarget Task task);
}
