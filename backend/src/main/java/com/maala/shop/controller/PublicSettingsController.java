package com.maala.shop.controller;

import com.maala.shop.dto.ApiResponse;
import com.maala.shop.dto.settings.PaymentAccountDto;
import com.maala.shop.dto.settings.SiteSettingsDto;
import com.maala.shop.service.ImageUploadService;
import com.maala.shop.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SettingsService settingsService;
    private final ImageUploadService imageUploadService;

    @GetMapping("/api/settings/public")
    public ResponseEntity<ApiResponse<SiteSettingsDto>> publicSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getPublicSettings()));
    }

    @GetMapping("/api/payment-accounts/public")
    public ResponseEntity<ApiResponse<List<PaymentAccountDto>>> publicPaymentAccounts() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getActivePaymentAccounts()));
    }

    @PostMapping("/api/upload/image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = imageUploadService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", Map.of("url", url)));
    }

    @PostMapping("/api/upload/payment-proof")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPaymentProof(@RequestParam("file") MultipartFile file) {
        String url = imageUploadService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success("Screenshot uploaded", Map.of("url", url)));
    }
}
