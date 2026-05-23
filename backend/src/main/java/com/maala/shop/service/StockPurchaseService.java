package com.maala.shop.service;

import com.maala.shop.dto.common.PageResponse;
import com.maala.shop.dto.stock.StockPurchaseDto;
import com.maala.shop.dto.stock.StockPurchaseRequest;
import com.maala.shop.entity.Product;
import com.maala.shop.entity.StockPurchase;
import com.maala.shop.exception.AppException;
import com.maala.shop.repository.ProductRepository;
import com.maala.shop.repository.StockPurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockPurchaseService {

    private final StockPurchaseRepository stockPurchaseRepository;
    private final ProductRepository productRepository;

    @Transactional
    public StockPurchaseDto record(StockPurchaseRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException("Product not found", HttpStatus.NOT_FOUND));

        BigDecimal total = request.getCostPerUnit().multiply(BigDecimal.valueOf(request.getQuantity()));
        LocalDateTime when = request.getPurchaseDate() != null ? request.getPurchaseDate() : LocalDateTime.now();

        StockPurchase purchase = StockPurchase.builder()
                .product(product)
                .quantity(request.getQuantity())
                .costPerUnit(request.getCostPerUnit())
                .totalCost(total)
                .purchaseDate(when)
                .notes(request.getNotes())
                .build();

        product.setStockQuantity((product.getStockQuantity() == null ? 0 : product.getStockQuantity()) + request.getQuantity());
        if (Boolean.TRUE.equals(request.getUpdateProductCost()) || product.getCostPrice() == null) {
            product.setCostPrice(request.getCostPerUnit());
        }
        productRepository.save(product);

        return toDto(stockPurchaseRepository.save(purchase));
    }

    @Transactional(readOnly = true)
    public PageResponse<StockPurchaseDto> list(int page, int size) {
        Page<StockPurchase> p = stockPurchaseRepository.findAllByOrderByPurchaseDateDesc(PageRequest.of(page, size));
        List<StockPurchaseDto> content = p.getContent().stream().map(this::toDto).collect(Collectors.toList());
        return PageResponse.<StockPurchaseDto>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional
    public void delete(Long id) {
        StockPurchase purchase = stockPurchaseRepository.findById(id)
                .orElseThrow(() -> new AppException("Stock purchase not found", HttpStatus.NOT_FOUND));
        Product product = purchase.getProduct();
        if (product != null) {
            int newStock = Math.max(0, (product.getStockQuantity() == null ? 0 : product.getStockQuantity()) - purchase.getQuantity());
            product.setStockQuantity(newStock);
            productRepository.save(product);
        }
        stockPurchaseRepository.deleteById(id);
    }

    private StockPurchaseDto toDto(StockPurchase p) {
        Product prod = p.getProduct();
        String img = null;
        if (prod != null && prod.getImageUrls() != null && !prod.getImageUrls().isEmpty()) {
            img = prod.getImageUrls().get(0);
        }
        return StockPurchaseDto.builder()
                .id(p.getId())
                .productId(prod != null ? prod.getId() : null)
                .productName(prod != null ? prod.getName() : null)
                .productImageUrl(img)
                .quantity(p.getQuantity())
                .costPerUnit(p.getCostPerUnit())
                .totalCost(p.getTotalCost())
                .purchaseDate(p.getPurchaseDate())
                .notes(p.getNotes())
                .build();
    }
}
