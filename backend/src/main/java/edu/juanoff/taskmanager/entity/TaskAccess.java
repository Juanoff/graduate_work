package edu.juanoff.taskmanager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "task_access",
        uniqueConstraints = @UniqueConstraint(columnNames = {"task_id", "user_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskAccess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessLevel accessLevel;
}
