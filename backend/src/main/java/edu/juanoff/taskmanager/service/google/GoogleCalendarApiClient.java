package edu.juanoff.taskmanager.service.google;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarApiClient {

    private final Calendar calendarService;

    @Retry(name = "googleApi")
    public Event createEvent(String calendarId, Event event, String accessToken) throws IOException {
        log.info("Creating event in calendar: {}", calendarId);
        return calendarService.events().insert(calendarId, event)
                .setOauthToken(accessToken)
                .execute();
    }

    @Retry(name = "googleApi")
    public Event updateEvent(String calendarId, String eventId, Event event, String accessToken) throws IOException {
        log.info("Updating event {} in calendar: {}", eventId, calendarId);
        return calendarService.events().update(calendarId, eventId, event)
                .setOauthToken(accessToken)
                .execute();
    }

    @Retry(name = "googleApi")
    public Event getEvent(String calendarId, String eventId, String accessToken) throws IOException {
        log.info("Fetching event {} from calendar: {}", eventId, calendarId);
        return calendarService.events().get(calendarId, eventId)
                .setOauthToken(accessToken)
                .execute();
    }

    @Retry(name = "googleApi")
    public List<Event> listEvents(String calendarId, String accessToken, long timeMin) throws IOException {
        log.info("Listing events from calendar: {}", calendarId);
        return calendarService.events().list(calendarId)
                .setOauthToken(accessToken)
                .setTimeMin(new DateTime(timeMin))
                .execute()
                .getItems();
    }

    @Retry(name = "googleApi")
    public void deleteEvent(String calendarId, String eventId, String accessToken) throws IOException {
        log.info("Deleting event {} from calendar: {}", eventId, calendarId);
        calendarService.events().delete(calendarId, eventId)
                .setOauthToken(accessToken)
                .execute();
    }
}
