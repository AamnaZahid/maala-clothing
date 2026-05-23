package com.maala.shop.controller;

import com.maala.shop.dto.ApiResponse;
import com.maala.shop.dto.category.CategoryDto;
import com.maala.shop.dto.category.CategoryRequest;
import com.maala.shop.dto.common.PageResponse;
import com.maala.shop.dto.dashboard.DashboardStatsDto;
import com.maala.shop.dto.order.*;
import com.maala.shop.dto.product.ProductDto;
import com.maala.shop.dto.product.ProductRequest;
import com.maala.shop.dto.report.ReportSummaryDto;
import com.maala.shop.dto.settings.PaymentAccountDto;
import com.maala.shop.dto.settings.PaymentAccountRequest;
import com.maala.shop.dto.settings.SiteSettingsDto;
import com.maala.shop.dto.settings.SiteSettingsRequest;
import com.maala.shop.dto.stock.StockPurchaseDto;
import com.maala.shop.dto.stock.StockPurchaseRequest;
import com.maala.shop.entity.OrderStatus;
import com.maala.shop.service.OrderService;
import com.maala.shop.service.ProductService;
import com.maala.shop.service.ReportService;
import com.maala.shop.service.SettingsService;
import com.maala.shop.service.StockPurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;
    private final SettingsService settingsService;
    private final ReportService reportService;
    private final StockPurchaseService stockPurchaseService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> dashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getDashboardStats()));
    }

    @GetMapping("/dashboard/recent-orders")
    public ResponseEntity<ApiResponse<List<OrderDto>>> recentOrders() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getRecentOrders()));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> products(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProductsAdmin(page, size)));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductForAdmin(id)));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product created", productService.createProduct(request)));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.updateProduct(id, request)));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @GetMapping("/products/low-stock")
    public ResponseEntity<ApiResponse<List<ProductDto>>> lowStock() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStockProducts()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category created", productService.createCategory(request)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", productService.updateCategory(id, request)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        productService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> orders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAdminOrders(status, page, size)));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrder(id)));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateStatus(
            @PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", orderService.updateStatus(id, request)));
    }

    @PutMapping("/orders/{id}/tracking")
    public ResponseEntity<ApiResponse<OrderDto>> updateTracking(
            @PathVariable Long id, @Valid @RequestBody UpdateTrackingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tracking updated", orderService.updateTracking(id, request)));
    }

    @PutMapping("/orders/{id}/notes")
    public ResponseEntity<ApiResponse<OrderDto>> updateNotes(
            @PathVariable Long id, @RequestBody UpdateAdminNotesRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Notes updated", orderService.updateAdminNotes(id, request)));
    }

    @GetMapping("/orders/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> orderStats() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getDashboardStats()));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<SiteSettingsDto>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getSettings()));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<SiteSettingsDto>> updateSettings(@Valid @RequestBody SiteSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Settings updated", settingsService.updateSettings(request)));
    }

    @PostMapping("/settings/test-whatsapp")
    public ResponseEntity<ApiResponse<Void>> testWhatsApp() {
        boolean sent = settingsService.sendTestWhatsApp();
        if (!sent) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("WhatsApp not configured. Set phone and CallMeBot API key in Settings."));
        }
        return ResponseEntity.ok(ApiResponse.success("Test WhatsApp message sent", null));
    }

    @GetMapping("/payment-accounts")
    public ResponseEntity<ApiResponse<List<PaymentAccountDto>>> paymentAccounts() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getPaymentAccounts()));
    }

    @PostMapping("/payment-accounts")
    public ResponseEntity<ApiResponse<PaymentAccountDto>> createPaymentAccount(
            @Valid @RequestBody PaymentAccountRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Account created", settingsService.createPaymentAccount(request)));
    }

    @PutMapping("/payment-accounts/{id}")
    public ResponseEntity<ApiResponse<PaymentAccountDto>> updatePaymentAccount(
            @PathVariable Long id, @Valid @RequestBody PaymentAccountRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Account updated", settingsService.updatePaymentAccount(id, request)));
    }

    @DeleteMapping("/payment-accounts/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePaymentAccount(@PathVariable Long id) {
        settingsService.deletePaymentAccount(id);
        return ResponseEntity.ok(ApiResponse.success("Account deleted", null));
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<ApiResponse<ReportSummaryDto>> reportSummary(
            @RequestParam(defaultValue = "month") String range,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        ReportSummaryDto data;
        if ("lifetime".equalsIgnoreCase(range)) {
            data = reportService.lifetime();
        } else if (year != null && month != null) {
            data = reportService.monthly(year, month);
        } else {
            data = reportService.thisMonth();
        }
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/stock-purchases")
    public ResponseEntity<ApiResponse<PageResponse<StockPurchaseDto>>> stockPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(stockPurchaseService.list(page, size)));
    }

    @PostMapping("/stock-purchases")
    public ResponseEntity<ApiResponse<StockPurchaseDto>> recordStockPurchase(
            @Valid @RequestBody StockPurchaseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock purchase recorded", stockPurchaseService.record(request)));
    }

    @DeleteMapping("/stock-purchases/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStockPurchase(@PathVariable Long id) {
        stockPurchaseService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Stock purchase removed", null));
    }
}
