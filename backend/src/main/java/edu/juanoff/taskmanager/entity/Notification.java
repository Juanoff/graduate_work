package edu.juanoff.taskmanager.entity;

import edu.juanoff.taskmanager.converter.MetadataConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private Type type = Type.TASK_DEADLINE;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "metadata", columnDefinition = "TEXT")
    @Convert(converter = MetadataConverter.class)
    private NotificationMetadata metadata;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Builder.Default
    @Column(name = "is_closed", nullable = false)
    private Boolean isClosed = false;

    public enum Type {
        TASK_DEADLINE,
        TASK_INVITATION,
        USER_ACHIEVEMENT,
        TASK_INVITATION_RESPONSE,
        TASK_ACCESS_RIGHTS_CHANGED,
        TASK_ACCESS_RIGHTS_REMOVED
    }
}
