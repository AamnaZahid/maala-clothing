package com.maala.shop.service;

import com.maala.shop.dto.report.ReportSummaryDto;
import com.maala.shop.dto.report.TopProductDto;
import com.maala.shop.entity.Order;
import com.maala.shop.entity.OrderItem;
import com.maala.shop.entity.OrderStatus;
import com.maala.shop.repository.OrderRepository;
import com.maala.shop.repository.ProductRepository;
import com.maala.shop.repository.StockPurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final Set<OrderStatus> EXCLUDED_FROM_SALES =
            EnumSet.of(OrderStatus.CANCELLED, OrderStatus.PENDING_PAYMENT);

    private static final DateTimeFormatter DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockPurchaseRepository stockPurchaseRepository;

    @Transactional(readOnly = true)
    public ReportSummaryDto monthly(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(LocalTime.MAX);
        return build(ym.getMonth().name() + " " + year, start, end);
    }

    @Transactional(readOnly = true)
    public ReportSummaryDto lifetime() {
        LocalDateTime start = LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.now().with(LocalTime.MAX);
        return build("Lifetime", start, end);
    }

    @Transactional(readOnly = true)
    public ReportSummaryDto thisMonth() {
        LocalDate today = LocalDate.now();
        return monthly(today.getYear(), today.getMonthValue());
    }

    private ReportSummaryDto build(String label, LocalDateTime start, LocalDateTime end) {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> !EXCLUDED_FROM_SALES.contains(o.getStatus()))
                .filter(o -> !o.getCreatedAt().isBefore(start) && !o.getCreatedAt().isAfter(end))
                .collect(Collectors.toList());

        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal cogs = BigDecimal.ZERO;
        BigDecimal delivery = BigDecimal.ZERO;
        long itemsSold = 0;

        Map<Long, TopProductDto.TopProductDtoBuilder> productAgg = new HashMap<>();
        Map<Long, Long> productQty = new HashMap<>();
        Map<Long, BigDecimal> productRev = new HashMap<>();
        Map<Long, BigDecimal> productProfit = new HashMap<>();
        Map<Long, String> productNames = new HashMap<>();

        for (Order o : orders) {
            revenue = revenue.add(nullToZero(o.getTotalAmount()));
            delivery = delivery.add(nullToZero(o.getDeliveryCharges()));
            for (OrderItem item : o.getItems()) {
                int qty = item.getQuantity() == null ? 0 : item.getQuantity();
                itemsSold += qty;
                BigDecimal itemRevenue = nullToZero(item.getSubtotal());
                BigDecimal itemCost = nullToZero(item.getCostAtPurchase()).multiply(BigDecimal.valueOf(qty));
                cogs = cogs.add(itemCost);

                Long pid = item.getProduct() != null ? item.getProduct().getId() : null;
                if (pid != null) {
                    productNames.put(pid, item.getProductName());
                    productQty.merge(pid, (long) qty, Long::sum);
                    productRev.merge(pid, itemRevenue, BigDecimal::add);
                    productProfit.merge(pid, itemRevenue.subtract(itemCost), BigDecimal::add);
                }
            }
        }

        BigDecimal grossProfit = revenue.subtract(cogs);
        BigDecimal stockSpending = nullToZero(stockPurchaseRepository.sumTotalCostBetween(start, end));
        Long stockUnits = stockPurchaseRepository.sumQuantityBetween(start, end);
        BigDecimal netResult = grossProfit.subtract(stockSpending);

        List<TopProductDto> topProducts = productQty.entrySet().stream()
                .sorted(Comparator.<Map.Entry<Long, Long>>comparingLong(Map.Entry::getValue).reversed())
                .limit(5)
                .map(e -> TopProductDto.builder()
                        .productId(e.getKey())
                        .productName(productNames.get(e.getKey()))
                        .quantitySold(e.getValue())
                        .revenue(productRev.getOrDefault(e.getKey(), BigDecimal.ZERO))
                        .profit(productProfit.getOrDefault(e.getKey(), BigDecimal.ZERO))
                        .build())
                .collect(Collectors.toList());

        return ReportSummaryDto.builder()
                .label(label)
                .periodStart(start.toLocalDate().format(DATE))
                .periodEnd(end.toLocalDate().format(DATE))
                .ordersCount(orders.size())
                .itemsSold(itemsSold)
                .revenue(revenue)
                .costOfGoodsSold(cogs)
                .grossProfit(grossProfit)
                .deliveryCollected(delivery)
                .stockSpending(stockSpending)
                .stockUnitsBought(stockUnits == null ? 0 : stockUnits)
                .netResult(netResult)
                .inventoryValueAtCost(nullToZero(productRepository.sumInventoryValueAtCost()))
                .totalStockOnHand(productRepository.sumStockOnHand() == null ? 0 : productRepository.sumStockOnHand().intValue())
                .topProducts(topProducts)
                .build();
    }

    private static BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
