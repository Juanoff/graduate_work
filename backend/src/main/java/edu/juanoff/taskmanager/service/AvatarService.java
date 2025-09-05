package edu.juanoff.taskmanager.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AvatarService {

    private final FileStorageService fileStorageService;

    private static final String UPLOAD_DIR = "uploads/avatars/";

    public String uploadAvatar(Long userId, MultipartFile file, String oldAvatarUrl) throws IOException {
        return fileStorageService.storeFile(userId, file, UPLOAD_DIR, oldAvatarUrl);
    }
}
