package edu.juanoff.taskmanager.mapper;

import edu.juanoff.taskmanager.dto.notification.NotificationRequestDTO;
import edu.juanoff.taskmanager.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "title", ignore = true)
    @Mapping(target = "metadata", ignore = true)
    Notification toEntity(NotificationRequestDTO dto);
}
