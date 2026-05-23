package com.maala.shop.service;

import com.maala.shop.dto.common.PageResponse;
import com.maala.shop.dto.order.*;
import com.maala.shop.entity.*;
import com.maala.shop.exception.AppException;
import com.maala.shop.mapper.EntityMapper;
import com.maala.shop.repository.OrderRepository;
import com.maala.shop.repository.ProductRepository;
import com.maala.shop.repository.SiteSettingsRepository;
import com.maala.shop.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SiteSettingsRepository siteSettingsRepository;
    private final OrderNumberService orderNumberService;
    private final WhatsAppNotificationService whatsAppNotificationService;
    private final PhoneNormalizationService phoneNormalizationService;

    @Transactional
    public OrderDto placeOrder(PlaceOrderRequest request, UserPrincipal principal) {
        SiteSettings settings = getSettings();
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .filter(Product::getIsActive)
                    .orElseThrow(() -> new AppException("Product not found: " + itemReq.getProductId(), HttpStatus.BAD_REQUEST));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new AppException("Insufficient stock for " + product.getName(), HttpStatus.BAD_REQUEST);
            }

            BigDecimal unitPrice = product.getEffectivePrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            String imageUrl = product.getImageUrls() != null && !product.getImageUrls().isEmpty()
                    ? product.getImageUrls().get(0) : null;

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .productImageUrl(imageUrl)
                    .size(itemReq.getSize())
                    .color(itemReq.getColor())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .costAtPurchase(product.getCostPrice())
                    .build();
            orderItems.add(orderItem);

            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);
        }

        BigDecimal deliveryCharges = calculateDeliveryCharges(totalAmount, settings);
        BigDecimal grandTotal = totalAmount.add(deliveryCharges);

        Order order = Order.builder()
                .orderNumber(orderNumberService.generateOrderNumber())
                .customer(principal != null ? principal.getUser() : null)
                .customerName(request.getCustomerName())
                .customerPhone(phoneNormalizationService.normalize(request.getCustomerPhone()))
                .customerEmail(request.getCustomerEmail())
                .deliveryAddress(request.getDeliveryAddress())
                .city(request.getCity())
                .totalAmount(totalAmount)
                .deliveryCharges(deliveryCharges)
                .grandTotal(grandTotal)
                .status(OrderStatus.PAYMENT_SUBMITTED)
                .paymentMethod(request.getPaymentMethod())
                .paymentTransactionId(request.getPaymentTransactionId())
                .paymentScreenshotUrl(request.getPaymentScreenshotUrl())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        Order saved = orderRepository.save(order);

        NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
        whatsAppNotificationService.sendNewOrderNotification(
                saved.getOrderNumber(),
                saved.getCustomerName(),
                saved.getCustomerPhone(),
                saved.getItems().size(),
                nf.format(saved.getGrandTotal()),
                saved.getPaymentMethod(),
                saved.getPaymentTransactionId()
        );

        return EntityMapper.toOrderDto(saved);
    }

    @Transactional(readOnly = true)
    public OrderDto trackOrder(String orderNumber, String phone) {
        Order order = orderRepository.findByOrderNumberAndCustomerPhone(
                        orderNumber, phoneNormalizationService.normalize(phone))
                .orElseThrow(() -> new AppException("Order not found. Check order number and phone.", HttpStatus.NOT_FOUND));
        return EntityMapper.toOrderDto(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderDto> getMyOrders(UserPrincipal principal, int page, int size) {
        Page<Order> orders = orderRepository.findByCustomerId(
                principal.getUser().getId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return toPageResponse(orders);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderDto> getAdminOrders(OrderStatus status, int page, int size) {
        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByStatus(status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        } else {
            orders = orderRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        }
        return toPageResponse(orders);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Order not found", HttpStatus.NOT_FOUND));
        return EntityMapper.toOrderDto(order);
    }

    @Transactional
    public OrderDto updateStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Order not found", HttpStatus.NOT_FOUND));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(request.getStatus());
        Order saved = orderRepository.save(order);

        if (request.getStatus() == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            restoreStock(saved);
        }
        if (request.getStatus() == OrderStatus.PAYMENT_CONFIRMED && oldStatus != OrderStatus.PAYMENT_CONFIRMED) {
            whatsAppNotificationService.sendPaymentConfirmedNotification(saved.getOrderNumber());
        }
        if (request.getStatus() == OrderStatus.DISPATCHED && oldStatus != OrderStatus.DISPATCHED) {
            whatsAppNotificationService.sendDispatchedNotification(
                    saved.getOrderNumber(),
                    saved.getLeopardTrackingNumber() != null ? saved.getLeopardTrackingNumber() : "N/A"
            );
        }

        return EntityMapper.toOrderDto(saved);
    }

    @Transactional
    public OrderDto updateTracking(Long id, UpdateTrackingRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Order not found", HttpStatus.NOT_FOUND));
        OrderStatus oldStatus = order.getStatus();
        order.setLeopardTrackingNumber(request.getLeopardTrackingNumber());
        if (order.getStatus() == OrderStatus.PAYMENT_CONFIRMED || order.getStatus() == OrderStatus.PROCESSING) {
            order.setStatus(OrderStatus.DISPATCHED);
        }
        Order saved = orderRepository.save(order);
        if (saved.getStatus() == OrderStatus.DISPATCHED && oldStatus != OrderStatus.DISPATCHED) {
            whatsAppNotificationService.sendDispatchedNotification(
                    saved.getOrderNumber(),
                    saved.getLeopardTrackingNumber() != null ? saved.getLeopardTrackingNumber() : "N/A"
            );
        }
        return EntityMapper.toOrderDto(saved);
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }
    }

    @Transactional
    public OrderDto updateAdminNotes(Long id, UpdateAdminNotesRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Order not found", HttpStatus.NOT_FOUND));
        order.setAdminNotes(request.getAdminNotes());
        return EntityMapper.toOrderDto(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getRecentOrders() {
        return orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(EntityMapper::toOrderDto)
                .collect(Collectors.toList());
    }

    private BigDecimal calculateDeliveryCharges(BigDecimal totalAmount, SiteSettings settings) {
        return settings.getDeliveryCharges() != null ? settings.getDeliveryCharges() : new BigDecimal("250");
    }

    private SiteSettings getSettings() {
        return siteSettingsRepository.findAll().stream().findFirst()
                .orElse(SiteSettings.builder()
                        .deliveryCharges(new BigDecimal("250"))
                        .freeDeliveryThreshold(new BigDecimal("3000"))
                        .build());
    }

    private PageResponse<OrderDto> toPageResponse(Page<Order> orders) {
        List<OrderDto> content = orders.getContent().stream()
                .map(EntityMapper::toOrderDto)
                .collect(Collectors.toList());
        return PageResponse.<OrderDto>builder()
                .content(content)
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .last(orders.isLast())
                .build();
    }
}
