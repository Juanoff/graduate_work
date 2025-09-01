package edu.juanoff.taskmanager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskAssignment {
    @EmbeddedId
    private TaskAssignmentId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("taskId")
    @JoinColumn(name = "task_id")
    private Task task;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = new TaskAssignmentId(user.getId(), task.getId());
        }
    }

    // Embeddable ID class
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaskAssignmentId implements Serializable {
        @Column(name = "user_id")
        private Long userId;

        @Column(name = "task_id")
        private Long taskId;

        // Constructors, equals, hashCode
    }

    // Constructors, Getters and Setters
}
