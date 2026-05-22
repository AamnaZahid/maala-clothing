package com.maala.shop.service;

import com.maala.shop.dto.dashboard.DashboardStatsDto;
import com.maala.shop.dto.settings.PaymentAccountDto;
import com.maala.shop.dto.settings.PaymentAccountRequest;
import com.maala.shop.dto.settings.SiteSettingsDto;
import com.maala.shop.dto.settings.SiteSettingsRequest;
import com.maala.shop.entity.OrderStatus;
import com.maala.shop.entity.PaymentAccount;
import com.maala.shop.entity.SiteSettings;
import com.maala.shop.exception.AppException;
import com.maala.shop.mapper.EntityMapper;
import com.maala.shop.repository.OrderRepository;
import com.maala.shop.repository.PaymentAccountRepository;
import com.maala.shop.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SiteSettingsRepository siteSettingsRepository;
    private final PaymentAccountRepository paymentAccountRepository;
    private final OrderRepository orderRepository;
    private final WhatsAppNotificationService whatsAppNotificationService;

    @Transactional(readOnly = true)
    public SiteSettingsDto getSettings() {
        SiteSettingsDto dto = EntityMapper.toSiteSettingsDto(getOrCreateSettings());
        maskCallMeBotKey(dto);
        return dto;
    }

    public SiteSettingsDto getPublicSettings() {
        SiteSettings settings = getOrCreateSettings();
        SiteSettingsDto dto = EntityMapper.toSiteSettingsDto(settings);
        dto.setCallmebotApiKey(null);
        return dto;
    }

    @Transactional
    public SiteSettingsDto updateSettings(SiteSettingsRequest request) {
        SiteSettings settings = getOrCreateSettings();
        settings.setShopName(request.getShopName());
        settings.setShopTagline(request.getShopTagline());
        settings.setShopLogoUrl(request.getShopLogoUrl());
        settings.setWhatsappNumber(request.getWhatsappNumber());
        if (request.getCallmebotApiKey() != null && !request.getCallmebotApiKey().isBlank()
                && !request.getCallmebotApiKey().contains("*")) {
            settings.setCallmebotApiKey(request.getCallmebotApiKey());
        }
        settings.setDeliveryCharges(request.getDeliveryCharges());
        settings.setFreeDeliveryThreshold(request.getFreeDeliveryThreshold());
        settings.setInstagramUrl(request.getInstagramUrl());
        settings.setFacebookUrl(request.getFacebookUrl());
        settings.setContactEmail(request.getContactEmail());
        settings.setAnnouncementBanner(request.getAnnouncementBanner());
        SiteSettingsDto dto = EntityMapper.toSiteSettingsDto(siteSettingsRepository.save(settings));
        maskCallMeBotKey(dto);
        return dto;
    }

    private void maskCallMeBotKey(SiteSettingsDto dto) {
        if (dto.getCallmebotApiKey() != null && !dto.getCallmebotApiKey().isBlank()) {
            dto.setCallmebotApiKey("********");
        }
    }

    public List<PaymentAccountDto> getPaymentAccounts() {
        return paymentAccountRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(EntityMapper::toPaymentAccountDto)
                .collect(Collectors.toList());
    }

    public List<PaymentAccountDto> getActivePaymentAccounts() {
        return paymentAccountRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(EntityMapper::toPaymentAccountDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentAccountDto createPaymentAccount(PaymentAccountRequest request) {
        PaymentAccount account = PaymentAccount.builder()
                .accountType(request.getAccountType())
                .accountTitle(request.getAccountTitle())
                .accountNumber(request.getAccountNumber())
                .bankName(request.getBankName())
                .isActive(request.getIsActive())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();
        return EntityMapper.toPaymentAccountDto(paymentAccountRepository.save(account));
    }

    @Transactional
    public PaymentAccountDto updatePaymentAccount(Long id, PaymentAccountRequest request) {
        PaymentAccount account = paymentAccountRepository.findById(id)
                .orElseThrow(() -> new AppException("Payment account not found", HttpStatus.NOT_FOUND));
        account.setAccountType(request.getAccountType());
        account.setAccountTitle(request.getAccountTitle());
        account.setAccountNumber(request.getAccountNumber());
        account.setBankName(request.getBankName());
        account.setIsActive(request.getIsActive());
        if (request.getDisplayOrder() != null) {
            account.setDisplayOrder(request.getDisplayOrder());
        }
        return EntityMapper.toPaymentAccountDto(paymentAccountRepository.save(account));
    }

    @Transactional
    public void deletePaymentAccount(Long id) {
        if (!paymentAccountRepository.existsById(id)) {
            throw new AppException("Payment account not found", HttpStatus.NOT_FOUND);
        }
        paymentAccountRepository.deleteById(id);
    }

    public boolean sendTestWhatsApp() {
        return whatsAppNotificationService.sendTestMessage();
    }

    public DashboardStatsDto getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = today.withDayOfMonth(today.lengthOfMonth()).atTime(LocalTime.MAX);

        long todayOrders = orderRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        long pendingPayment = orderRepository.countByStatus(OrderStatus.PAYMENT_SUBMITTED);
        BigDecimal monthRevenue = orderRepository.sumRevenueBetween(
                startOfMonth, endOfMonth,
                List.of(OrderStatus.CANCELLED, OrderStatus.PENDING_PAYMENT)
        );
        long dispatched = orderRepository.countByStatus(OrderStatus.DISPATCHED)
                + orderRepository.countByStatus(OrderStatus.DELIVERED);

        return DashboardStatsDto.builder()
                .todayOrders(todayOrders)
                .pendingPaymentConfirmation(pendingPayment)
                .monthRevenue(monthRevenue != null ? monthRevenue : BigDecimal.ZERO)
                .totalDispatched(dispatched)
                .build();
    }

    private SiteSettings getOrCreateSettings() {
        return siteSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> siteSettingsRepository.save(SiteSettings.builder()
                        .shopName("Maala Clothing")
                        .shopTagline("Fresh fashion delivered to your door")
                        .whatsappNumber("923094094776")
                        .deliveryCharges(new BigDecimal("250"))
                        .freeDeliveryThreshold(new BigDecimal("999999999"))
                        .announcementBanner("New lawn suits, kurtas and dupattas — Leopard Courier delivery across Pakistan")
                        .build()));
    }
}
