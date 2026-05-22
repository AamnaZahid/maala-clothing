package com.maala.shop.dto.order;

import com.maala.shop.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String deliveryAddress;
    private String city;
    private List<OrderItemDto> items;
    private BigDecimal totalAmount;
    private BigDecimal deliveryCharges;
    private BigDecimal grandTotal;
    private OrderStatus status;
    private String paymentMethod;
    private String paymentTransactionId;
    private String paymentScreenshotUrl;
    private String leopardTrackingNumber;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
