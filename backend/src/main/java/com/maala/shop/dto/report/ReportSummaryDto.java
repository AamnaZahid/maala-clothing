package com.maala.shop.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryDto {
    private String label;
    private String periodStart;
    private String periodEnd;

    private long ordersCount;
    private long itemsSold;

    private BigDecimal revenue;
    private BigDecimal costOfGoodsSold;
    private BigDecimal grossProfit;
    private BigDecimal deliveryCollected;

    private BigDecimal stockSpending;
    private long stockUnitsBought;
    private BigDecimal netResult;

    private BigDecimal inventoryValueAtCost;
    private Integer totalStockOnHand;

    private List<TopProductDto> topProducts;
}
