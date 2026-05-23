package com.maala.shop.mapper;

import com.maala.shop.dto.auth.UserDto;
import com.maala.shop.dto.category.CategoryDto;
import com.maala.shop.dto.order.OrderDto;
import com.maala.shop.dto.order.OrderItemDto;
import com.maala.shop.dto.product.ProductDto;
import com.maala.shop.dto.settings.PaymentAccountDto;
import com.maala.shop.dto.settings.SiteSettingsDto;
import com.maala.shop.entity.*;

import java.util.List;
import java.util.stream.Collectors;

public final class EntityMapper {

    private EntityMapper() {}

    public static UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .city(user.getCity())
                .role(user.getRole())
                .mustChangePassword(user.getMustChangePassword())
                .build();
    }

    public static CategoryDto toCategoryDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .imageUrl(category.getImageUrl())
                .build();
    }

    public static ProductDto toProductDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountedPrice(product.getDiscountedPrice())
                .effectivePrice(product.getEffectivePrice())
                .costPrice(product.getCostPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrls(product.getImageUrls())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .sizes(product.getSizes())
                .colors(product.getColors())
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .createdAt(product.getCreatedAt())
                .build();
    }

    public static OrderItemDto toOrderItemDto(OrderItem item) {
        return OrderItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .productImageUrl(item.getProductImageUrl())
                .size(item.getSize())
                .color(item.getColor())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .costAtPurchase(item.getCostAtPurchase())
                .build();
    }

    public static OrderDto toOrderDto(Order order) {
        List<OrderItemDto> items = order.getItems().stream()
                .map(EntityMapper::toOrderItemDto)
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerEmail(order.getCustomerEmail())
                .deliveryAddress(order.getDeliveryAddress())
                .city(order.getCity())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .deliveryCharges(order.getDeliveryCharges())
                .grandTotal(order.getGrandTotal())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentTransactionId(order.getPaymentTransactionId())
                .paymentScreenshotUrl(order.getPaymentScreenshotUrl())
                .leopardTrackingNumber(order.getLeopardTrackingNumber())
                .adminNotes(order.getAdminNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public static PaymentAccountDto toPaymentAccountDto(PaymentAccount account) {
        return PaymentAccountDto.builder()
                .id(account.getId())
                .accountType(account.getAccountType())
                .accountTitle(account.getAccountTitle())
                .accountNumber(account.getAccountNumber())
                .bankName(account.getBankName())
                .isActive(account.getIsActive())
                .displayOrder(account.getDisplayOrder())
                .build();
    }

    public static SiteSettingsDto toSiteSettingsDto(SiteSettings settings) {
        return SiteSettingsDto.builder()
                .id(settings.getId())
                .shopName(settings.getShopName())
                .shopTagline(settings.getShopTagline())
                .shopLogoUrl(settings.getShopLogoUrl())
                .whatsappNumber(settings.getWhatsappNumber())
                .callmebotApiKey(settings.getCallmebotApiKey())
                .deliveryCharges(settings.getDeliveryCharges())
                .freeDeliveryThreshold(settings.getFreeDeliveryThreshold())
                .instagramUrl(settings.getInstagramUrl())
                .facebookUrl(settings.getFacebookUrl())
                .contactEmail(settings.getContactEmail())
                .announcementBanner(settings.getAnnouncementBanner())
                .build();
    }
}
