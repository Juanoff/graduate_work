package edu.juanoff.taskmanager.service.google;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import edu.juanoff.taskmanager.entity.SyncHistory;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.repository.SyncHistoryRepository;
import edu.juanoff.taskmanager.repository.TaskRepository;
import edu.juanoff.taskmanager.service.UserService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarService {

    private static final String PRIMARY_CALENDAR = "primary";
    private static final long LAST_30_DAYS_MILLIS = 30L * 24 * 60 * 60 * 1000;

    private final GoogleCalendarApiClient calendarApiClient;
    private final GoogleTokenService tokenService;
    private final TaskRepository taskRepository;
    private final UserService userService;
    private final SyncHistoryRepository syncHistoryRepository;

    private volatile boolean cancelSync = false;

    @Transactional
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @RateLimiter(name = "googleSync")
    public void syncTasks(Long userId) {
        validateSyncNotCancelled(userId);
        log.info("Starting task synchronization for user: {}", userId);

        String accessToken = getAccessToken(userId);
        List<String> eventIds = new ArrayList<>();

        try {
            eventIds.addAll(syncTasksToCalendar(userId, accessToken));
            syncCalendarToTasks(userId, accessToken);
            saveSyncHistory(userId, eventIds, "COMPLETED");
            log.info("Successfully synced tasks for user: {}", userId);
        } catch (IOException e) {
            log.error("Failed to sync tasks for user: {}", userId, e);
            saveSyncHistory(userId, eventIds, "FAILED");
            throw new GoogleCalendarException("Failed to sync with Google Calendar", e);
        }
    }

    public void cancelSync() {
        cancelSync = true;
        log.info("Sync cancellation requested");
    }

    public void resetCancelSync() {
        cancelSync = false;
        log.info("Sync cancellation reset");
    }

    @Transactional
    @RateLimiter(name = "googleUndo")
    public void undoSync(Long userId) {
        SyncHistory history = syncHistoryRepository
                .findTopByUserIdAndStatusOrderBySyncTimeDesc(userId, "COMPLETED")
                .filter(h -> h.getSyncTime().isAfter(LocalDateTime.now().minusMinutes(5)))
                .orElseThrow(() -> new GoogleCalendarException("No recent sync found to undo"));

        String accessToken = getAccessToken(userId);
        try {
            deleteCalendarEvents(history.getEventIds(), accessToken);
            updateTasksAfterUndo(history.getEventIds());
            history.setStatus("CANCELLED");
            syncHistoryRepository.save(history);
            log.info("Successfully undone sync for user: {}", userId);
        } catch (IOException e) {
            log.error("Failed to undo sync for user: {}", userId, e);
            throw new GoogleCalendarException("Failed to undo sync", e);
        }
    }

    private void validateSyncNotCancelled(Long userId) {
        if (cancelSync) {
            log.info("Sync cancelled for user: {}", userId);
            throw new GoogleCalendarException("Sync cancelled by user");
        }
    }

    private String getAccessToken(Long userId) {
        try {
            return tokenService.getValidCredential(userId).getAccessToken();
        } catch (Exception e) {
            log.error("Failed to get access token for user: {}", userId, e);
            throw new GoogleCalendarException("Failed to authenticate with Google Calendar", e);
        }
    }

    private List<String> syncTasksToCalendar(Long userId, String accessToken) throws IOException {
        List<Task> tasks = taskRepository.findByUserIdAndDueDateNotNull(userId);
        List<String> eventIds = new ArrayList<>();

        for (Task task : tasks) {
            validateSyncNotCancelled(userId);
            String eventId = task.getGoogleEventId() == null
                    ? createCalendarEvent(task, accessToken)
                    : updateCalendarEvent(task, accessToken);
            if (eventId != null) {
                eventIds.add(eventId);
            }
        }
        return eventIds;
    }

    private String createCalendarEvent(Task task, String accessToken) throws IOException {
        Event event = new Event()
                .setSummary(task.getTitle())
                .setDescription(task.getDescription())
                .setStart(createEventDateTime(task.getDueDate()))
                .setEnd(createEventDateTime(task.getDueDate().plusHours(1)));

        Event createdEvent = calendarApiClient.createEvent(PRIMARY_CALENDAR, event, accessToken);

        task.setGoogleEventId(createdEvent.getId());
        task.setCalendarId(PRIMARY_CALENDAR);
        task.setLastSyncedAt(LocalDateTime.now());
        taskRepository.save(task);

        log.info("Created calendar event {} for task {}", createdEvent.getId(), task.getId());
        return createdEvent.getId();
    }

    private String updateCalendarEvent(Task task, String accessToken) throws IOException {
        try {
            Event event = calendarApiClient.getEvent(PRIMARY_CALENDAR, task.getGoogleEventId(), accessToken);
            event.setSummary(task.getTitle())
                    .setDescription(task.getDescription())
                    .setStart(createEventDateTime(task.getDueDate()))
                    .setEnd(createEventDateTime(task.getDueDate().plusHours(1)));

            calendarApiClient.updateEvent(PRIMARY_CALENDAR, task.getGoogleEventId(), event, accessToken);

            task.setLastSyncedAt(LocalDateTime.now());
            taskRepository.save(task);

            log.info("Updated calendar event {} for task {}", task.getGoogleEventId(), task.getId());
            return task.getGoogleEventId();
        } catch (IOException e) {
            if (e.getMessage().contains("404")) {
                log.warn("Event {} not found for task {}. Creating new event.", task.getGoogleEventId(), task.getId());
                task.setGoogleEventId(null);
                return createCalendarEvent(task, accessToken);
            }
            throw e;
        }
    }

    private void syncCalendarToTasks(Long userId, String accessToken) throws IOException {
        List<Event> events = calendarApiClient.listEvents(
                PRIMARY_CALENDAR, accessToken, System.currentTimeMillis() - LAST_30_DAYS_MILLIS
        );

        for (Event event : events) {
            if (event.getStart().getDateTime() == null) {
                log.debug("Skipping all-day event: {}", event.getId());
                continue;
            }

            if (taskRepository.findByGoogleEventId(event.getId()).isEmpty()) {
                createTaskFromEvent(userId, event);
            }
        }
    }

    private void createTaskFromEvent(Long userId, Event event) {
        LocalDateTime dueDate = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(event.getStart().getDateTime().getValue()),
                ZoneId.systemDefault()
        );

        Task task = Task.builder()
                .title(event.getSummary() != null ? event.getSummary() : "Untitled Event")
                .description(event.getDescription())
                .dueDate(dueDate)
                .status(Task.StatusType.TO_DO)
                .priority(Task.Priority.MEDIUM)
                .user(userService.getUserById(userId))
                .googleEventId(event.getId())
                .calendarId(PRIMARY_CALENDAR)
                .lastSyncedAt(LocalDateTime.now())
                .build();
        taskRepository.save(task);

        log.info("Created task {} from calendar event {}", task.getId(), event.getId());
    }

    private void deleteCalendarEvents(String eventIds, String accessToken) throws IOException {
        if (eventIds == null || eventIds.isEmpty()) {
            return;
        }

        for (String eventId : eventIds.split(",")) {
            if (!eventId.isEmpty()) {
                try {
                    calendarApiClient.deleteEvent(PRIMARY_CALENDAR, eventId, accessToken);
                    log.debug("Deleted event {} during undo", eventId);
                } catch (IOException e) {
                    if (e.getMessage().contains("404")) {
                        log.warn("Event {} not found during undo, skipping", eventId);
                    } else {
                        throw e;
                    }
                }
            }
        }
    }

    private void updateTasksAfterUndo(String eventIds) {
        if (eventIds == null || eventIds.isEmpty()) {
            return;
        }

        for (String eventId : eventIds.split(",")) {
            if (!eventId.isEmpty()) {
                Optional<Task> task = taskRepository.findByGoogleEventId(eventId);
                task.ifPresent(t -> {
                    t.setGoogleEventId(null);
                    t.setCalendarId(null);
                    t.setLastSyncedAt(null);
                    taskRepository.save(t);
                    log.debug("Cleared Google event ID for task {}", t.getId());
                });
            }
        }
    }

    private void saveSyncHistory(Long userId, List<String> eventIds, String status) {
        SyncHistory history = SyncHistory.builder()
                .user(userService.getUserById(userId))
                .syncTime(LocalDateTime.now())
                .eventIds(String.join(",", eventIds))
                .status(status)
                .build();
        syncHistoryRepository.save(history);
    }

    private EventDateTime createEventDateTime(LocalDateTime dateTime) {
        return new EventDateTime().setDateTime(
                new DateTime(dateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli())
        );
    }
}
