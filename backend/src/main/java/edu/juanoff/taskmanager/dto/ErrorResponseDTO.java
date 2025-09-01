package edu.juanoff.taskmanager.dto;


import org.slf4j.MDC;

import java.time.Instant;

public record ErrorResponseDTO(
        int status,
        String error,
        String message,
        String timestamp,
        String traceId
) {
    public ErrorResponseDTO(int status, String error, String message) {
        this(status, error, message, Instant.now().toString(), MDC.get("traceId"));
    }
}
