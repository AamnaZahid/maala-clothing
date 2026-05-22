package com.maala.shop.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.maala.shop.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class ImageUploadService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final boolean cloudinaryEnabled;
    private final Cloudinary cloudinary;
    private final Path uploadDir;
    private final String baseUrl;

    public ImageUploadService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret,
            @Value("${app.upload.local-dir:uploads}") String localDir,
            @Value("${app.base-url:http://localhost:8081}") String baseUrl) throws IOException {

        this.cloudinaryEnabled = cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();

        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        this.cloudinary = new Cloudinary(config);

        this.uploadDir = Paths.get(localDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;

        if (!cloudinaryEnabled) {
            log.info("Cloudinary not configured — using local file storage at {}", this.uploadDir);
        }
    }

    @SuppressWarnings("unchecked")
    public String uploadImage(MultipartFile file) {
        validate(file);

        if (cloudinaryEnabled) {
            return uploadToCloudinary(file);
        }
        return uploadToLocal(file);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("File is required", HttpStatus.BAD_REQUEST);
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new AppException("Only image files are allowed (JPEG, PNG, WebP, GIF, SVG)", HttpStatus.BAD_REQUEST);
        }
    }

    @SuppressWarnings("unchecked")
    private String uploadToCloudinary(MultipartFile file) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "maala-clothing")
            );
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            log.error("Cloudinary upload failed", e);
            throw new AppException("Image upload failed. Check Cloudinary configuration.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String uploadToLocal(MultipartFile file) {
        try {
            String ext = extensionFromFilename(file.getOriginalFilename());
            String filename = UUID.randomUUID() + ext;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return baseUrl + "/uploads/" + filename;
        } catch (IOException e) {
            log.error("Local file upload failed", e);
            throw new AppException("Image upload failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String extensionFromFilename(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        String ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        return switch (ext) {
            case ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg" -> ext;
            default -> ".jpg";
        };
    }
}
