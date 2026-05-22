package com.maala.shop.dto.product;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    private BigDecimal discountedPrice;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stockQuantity;

    private List<String> imageUrls = new ArrayList<>();

    @NotNull(message = "Category is required")
    private Long categoryId;

    private List<String> sizes = new ArrayList<>();
    private List<String> colors = new ArrayList<>();

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    @NotNull(message = "Featured status is required")
    private Boolean isFeatured;
}
