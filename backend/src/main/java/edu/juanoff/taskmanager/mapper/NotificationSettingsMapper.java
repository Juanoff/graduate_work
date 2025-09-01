package edu.juanoff.taskmanager.mapper;

import edu.juanoff.taskmanager.dto.notification.NotificationSettingsRequestDTO;
import edu.juanoff.taskmanager.entity.NotificationSettings;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationSettingsMapper {

    NotificationSettings toEntity(NotificationSettingsRequestDTO dto);
}
