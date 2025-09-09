package edu.juanoff.taskmanager.exception;

import lombok.Getter;

@Getter
public class FileStorageException extends RuntimeException {
    private final String code;

    public FileStorageException(String code, String message) {
        super(message);
        this.code = code;
    }
}
