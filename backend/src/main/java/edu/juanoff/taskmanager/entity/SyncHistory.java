package edu.juanoff.taskmanager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "sync_time", nullable = false)
    private LocalDateTime syncTime;

    @Column(name = "event_ids", length = 4000)
    private String eventIds;

    @Column(name = "status", nullable = false)
    private String status;
}
