package edu.juanoff.taskmanager.mapper;

import edu.juanoff.taskmanager.dto.TaskAssignmentRequestDTO;
import edu.juanoff.taskmanager.entity.TaskAssignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaskAssignmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "assignedAt", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(target = "user", ignore = true)
    TaskAssignment toEntity(TaskAssignmentRequestDTO dto);
}
