package com.maala.shop.service;

import com.maala.shop.entity.SiteSettings;
import com.maala.shop.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppNotificationService {

    private final SiteSettingsRepository siteSettingsRepository;
    private final PhoneNormalizationService phoneNormalizationService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${callmebot.phone:923094094776}")
    private String defaultPhone;

    @Value("${callmebot.api-key:}")
    private String defaultApiKey;

    public void sendNewOrderNotification(String orderNumber, String customerName, String customerPhone,
                                         int itemCount, String grandTotal, String paymentMethod,
                                         String transactionId) {
        String message = String.format(
                "NEW ORDER RECEIVED%nOrder: %s%nCustomer: %s%nPhone: %s%nItems: %d items%nTotal: PKR %s%nPayment: %s%nTransaction ID: %s%nPlease confirm payment and update order status in admin panel.",
                orderNumber, customerName, customerPhone, itemCount, grandTotal, paymentMethod, transactionId
        );
        sendMessage(message);
    }

    public void sendPaymentConfirmedNotification(String orderNumber) {
        sendMessage("Payment confirmed for order " + orderNumber + ". Now processing.");
    }

    public void sendDispatchedNotification(String orderNumber, String trackingNumber) {
        sendMessage("Order " + orderNumber + " marked as dispatched. Tracking: " + trackingNumber);
    }

    public boolean sendTestMessage() {
        return sendMessage("Test message from Maala Clothing admin panel. WhatsApp notifications are working!");
    }

    private boolean sendMessage(String message) {
        try {
            String phone = getPhone();
            String apiKey = getApiKey();
            if (phone == null || phone.isBlank() || apiKey == null || apiKey.isBlank()) {
                log.warn("WhatsApp notification skipped: phone or API key not configured");
                return false;
            }

            String encodedMessage = UriUtils.encode(message, StandardCharsets.UTF_8);
            String url = String.format(
                    "https://api.callmebot.com/whatsapp.php?phone=%s&text=%s&apikey=%s",
                    phone, encodedMessage, apiKey
            );
            restTemplate.getForObject(url, String.class);
            log.info("WhatsApp notification sent successfully");
            return true;
        } catch (Exception e) {
            log.warn("WhatsApp notification failed: {}", e.getMessage());
            return false;
        }
    }

    private String getPhone() {
        Optional<SiteSettings> settings = siteSettingsRepository.findAll().stream().findFirst();
        String raw = settings.map(SiteSettings::getWhatsappNumber).filter(s -> !s.isBlank()).orElse(defaultPhone);
        return phoneNormalizationService.toWhatsAppNumber(raw);
    }

    private String getApiKey() {
        Optional<SiteSettings> settings = siteSettingsRepository.findAll().stream().findFirst();
        return settings.map(SiteSettings::getCallmebotApiKey).filter(s -> !s.isBlank()).orElse(defaultApiKey);
    }
}
