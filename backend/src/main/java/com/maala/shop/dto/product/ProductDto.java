package com.maala.shop.dto.product;

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
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private BigDecimal effectivePrice;
    private BigDecimal costPrice;
    private Integer stockQuantity;
    private List<String> imageUrls;
    private Long categoryId;
    private String categoryName;
    private List<String> sizes;
    private List<String> colors;
    private Boolean isActive;
    private Boolean isFeatured;
    private LocalDateTime createdAt;
}
