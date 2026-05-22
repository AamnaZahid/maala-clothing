package com.maala.shop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "site_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shop_name", nullable = false)
    private String shopName;

    @Column(name = "shop_tagline")
    private String shopTagline;

    @Column(name = "shop_logo_url")
    private String shopLogoUrl;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "callmebot_api_key")
    private String callmebotApiKey;

    @Column(name = "delivery_charges", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal deliveryCharges = new BigDecimal("250");

    @Column(name = "free_delivery_threshold", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal freeDeliveryThreshold = new BigDecimal("3000");

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "facebook_url")
    private String facebookUrl;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "announcement_banner")
    private String announcementBanner;
}
