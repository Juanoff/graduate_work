package edu.juanoff.taskmanager.mapper;

import edu.juanoff.taskmanager.dto.comment.CommentRequestDTO;
import edu.juanoff.taskmanager.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(target = "user", ignore = true)
    Comment toEntity(CommentRequestDTO dto);
}
