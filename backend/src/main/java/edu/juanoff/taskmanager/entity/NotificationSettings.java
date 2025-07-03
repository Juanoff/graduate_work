package edu.juanoff.taskmanager.entity;

import lombok.Data;

@Data
public class NotificationSettings {
    private int taskNotificationInterval = 60;
    private boolean taskEnabled = true;
    private boolean invitationEnabled = true;
    private boolean achievementEnabled = true;
}
