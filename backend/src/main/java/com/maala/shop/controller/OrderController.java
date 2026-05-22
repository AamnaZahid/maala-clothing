package com.maala.shop.controller;

import com.maala.shop.dto.ApiResponse;
import com.maala.shop.dto.common.PageResponse;
import com.maala.shop.dto.order.OrderDto;
import com.maala.shop.dto.order.PlaceOrderRequest;
import com.maala.shop.security.UserPrincipal;
import com.maala.shop.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        OrderDto order = orderService.placeOrder(request, principal);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDto>> trackOrder(
            @PathVariable String orderNumber,
            @RequestParam String phone) {
        return ResponseEntity.ok(ApiResponse.success(orderService.trackOrder(orderNumber, phone)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> myOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyOrders(principal, page, size)));
    }
}
