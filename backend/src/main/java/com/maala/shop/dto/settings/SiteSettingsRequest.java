package com.maala.shop.dto.settings;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SiteSettingsRequest {

    @NotBlank(message = "Shop name is required")
    private String shopName;

    private String shopTagline;
    private String shopLogoUrl;
    private String whatsappNumber;
    private String callmebotApiKey;

    @NotNull(message = "Delivery charges are required")
    private BigDecimal deliveryCharges;

    @NotNull(message = "Free delivery threshold is required")
    private BigDecimal freeDeliveryThreshold;

    private String instagramUrl;
    private String facebookUrl;
    private String contactEmail;
    private String announcementBanner;
}
