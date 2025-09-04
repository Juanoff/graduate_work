package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.notification.NotificationSettingsRequestDTO;
import edu.juanoff.taskmanager.entity.NotificationSettings;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.entity.UserSettings;
import edu.juanoff.taskmanager.exception.BusinessLogicException;
import edu.juanoff.taskmanager.mapper.NotificationSettingsMapper;
import edu.juanoff.taskmanager.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final NotificationSettingsMapper notificationSettingsMapper;

    @Transactional
    public void createDefaultSettings(User user) {
        NotificationSettings defaultNotification = new NotificationSettings();

        UserSettings settings = UserSettings.builder()
                .user(user)
                .build();
        settings.setNotificationSettingsObj(defaultNotification);

        userSettingsRepository.save(settings);
    }

    @Transactional
    public void updateNotificationSettings(User user, NotificationSettingsRequestDTO ns) {
        NotificationSettings notificationSettings = notificationSettingsMapper.toEntity(ns);
        UserSettings userSettings = getUserSettingsByUser(user);

        boolean success = userSettings.setNotificationSettingsObj(notificationSettings);
        if (!success) {
            throw new BusinessLogicException("Couldn't save notification settings");
        }

        userSettingsRepository.save(userSettings);
    }

    @Transactional(readOnly = true)
    public UserSettings getUserSettingsByUser(User user) {
        return userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> UserSettings.builder()
                        .user(user)
                        .build());
    }
}
