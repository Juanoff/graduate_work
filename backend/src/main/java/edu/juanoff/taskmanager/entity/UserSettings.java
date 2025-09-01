package edu.juanoff.taskmanager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Objects;

@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "notification_settings", columnDefinition = "json")
    private String notificationSettings;

    @JsonIgnore
    public NotificationSettings getNotificationSettingsObj() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(notificationSettings, NotificationSettings.class);
        } catch (JsonProcessingException e) {
            return new NotificationSettings();
        }
    }

    @JsonIgnore
    public boolean setNotificationSettingsObj(NotificationSettings settings) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            this.notificationSettings = mapper.writeValueAsString(settings);
            return true;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize notification settings for user {}: {}", getId(), e.getMessage());
            return false;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserSettings settings = (UserSettings) o;
        return id != null && Objects.equals(id, settings.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
