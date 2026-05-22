package com.maala.shop.entity;

public enum OrderStatus {
    PENDING_PAYMENT,
    PAYMENT_SUBMITTED,
    PAYMENT_CONFIRMED,
    PROCESSING,
    DISPATCHED,
    DELIVERED,
    CANCELLED
}
