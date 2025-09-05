package edu.juanoff.taskmanager.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.backend-url}")
    private String backendUrl;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/png", "image/gif");

    public String storeFile(Long entityId, MultipartFile file, String uploadDir, String oldFileUrl) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename.isBlank()) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();

        validateMimeType(file);

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String uniqueFileName = UUID.randomUUID() + "_" + entityId + "." + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFileName).normalize();

        if (!filePath.startsWith(uploadPath)) {
            throw new SecurityException("Invalid file path");
        }

        Files.write(filePath, file.getBytes());

        if (oldFileUrl != null) {
            deleteOldFile(oldFileUrl, uploadPath);
        }

        return backendUrl + uploadDir + uniqueFileName;
    }

    public void deleteOldFile(String oldFileUrl, Path uploadPath) {
        try {
            Path oldFilePath = uploadPath.resolve(Paths.get(new URI(oldFileUrl).getPath()).getFileName()).normalize();
            if (Files.exists(oldFilePath)) {
                Files.delete(oldFilePath);
            }
        } catch (Exception e) {
            log.warn("Could not delete old file: {}", oldFileUrl, e);
        }
    }

    private void validateMimeType(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream()) {
            String mimeType = URLConnection.guessContentTypeFromStream(is);
            if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
                throw new IllegalArgumentException("Invalid file type: " + mimeType);
            }
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex == -1 ? "" : filename.substring(dotIndex + 1);
    }
}
