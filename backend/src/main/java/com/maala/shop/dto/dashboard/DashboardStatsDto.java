package com.maala.shop.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long todayOrders;
    private long pendingPaymentConfirmation;
    private BigDecimal monthRevenue;
    private long totalDispatched;
}
