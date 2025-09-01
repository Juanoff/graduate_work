package edu.juanoff.taskmanager.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusType status = StatusType.TO_DO;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_task_id")
    @JsonBackReference
    private Task parentTask;

    @Builder.Default
    @Column(name = "notified", nullable = false)
    private Boolean notified = false;

    @Column(name = "google_event_id")
    private String googleEventId;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Column(name = "calendar_id")
    private String calendarId;

    @Builder.Default
    @OneToMany(mappedBy = "parentTask", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Task> subtasks = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<TaskAssignment> assignments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TaskAccess> sharedWith = new ArrayList<>();

    public enum StatusType {
        TO_DO, IN_PROGRESS, DONE
    }

    public enum Priority {
        LOW, MEDIUM, HIGH
    }

    public int getNestingLevel() {
        int level = 0;
        Task current = this.parentTask;
        while (current != null) {
            level++;
            current = current.getParentTask();
        }
        return level;
    }

    @PrePersist
    @PreUpdate
    public void validateNesting() {
        if (getNestingLevel() >= 3) {
            throw new IllegalStateException("Максимальная вложенность подзадач — 2 уровня.");
        }
    }

    // Constructors, Getters and Setters
}
