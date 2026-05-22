package com.maala.shop.dto.settings;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteSettingsDto {
    private Long id;
    private String shopName;
    private String shopTagline;
    private String shopLogoUrl;
    private String whatsappNumber;
    private String callmebotApiKey;
    private BigDecimal deliveryCharges;
    private BigDecimal freeDeliveryThreshold;
    private String instagramUrl;
    private String facebookUrl;
    private String contactEmail;
    private String announcementBanner;
}
