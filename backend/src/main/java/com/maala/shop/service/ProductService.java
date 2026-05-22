package com.maala.shop.service;

import com.maala.shop.dto.category.CategoryDto;
import com.maala.shop.dto.category.CategoryRequest;
import com.maala.shop.dto.common.PageResponse;
import com.maala.shop.dto.product.ProductDto;
import com.maala.shop.dto.product.ProductRequest;
import com.maala.shop.entity.Category;
import com.maala.shop.entity.Product;
import com.maala.shop.exception.AppException;
import com.maala.shop.mapper.EntityMapper;
import com.maala.shop.repository.CategoryRepository;
import com.maala.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getProducts(Long categoryId, String search, BigDecimal minPrice,
                                                 BigDecimal maxPrice, int page, int size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<Product> products = productRepository.searchProducts(categoryId, search, minPrice, maxPrice, pageable);

        List<ProductDto> content = products.getContent().stream()
                .filter(Product::getIsActive)
                .map(EntityMapper::toProductDto)
                .collect(Collectors.toList());

        return PageResponse.<ProductDto>builder()
                .content(content)
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .last(products.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ProductDto getProduct(Long id) {
        Product product = productRepository.findById(id)
                .filter(Product::getIsActive)
                .orElseThrow(() -> new AppException("Product not found", HttpStatus.NOT_FOUND));
        return EntityMapper.toProductDto(product);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductForAdmin(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Product not found", HttpStatus.NOT_FOUND));
        return EntityMapper.toProductDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .map(EntityMapper::toProductDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategories() {
        return categoryRepository.findAll().stream()
                .map(EntityMapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(ProductRequest request) {
        Category category = getCategory(request.getCategoryId());
        Product product = mapToProduct(new Product(), request, category);
        return EntityMapper.toProductDto(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Product not found", HttpStatus.NOT_FOUND));
        Category category = getCategory(request.getCategoryId());
        mapToProduct(product, request, category);
        return EntityMapper.toProductDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Product not found", HttpStatus.NOT_FOUND));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional
    public CategoryDto createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .imageUrl(request.getImageUrl())
                .build();
        return EntityMapper.toCategoryDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Category not found", HttpStatus.NOT_FOUND));
        category.setName(request.getName());
        category.setImageUrl(request.getImageUrl());
        return EntityMapper.toCategoryDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new AppException("Category not found", HttpStatus.NOT_FOUND);
        }
        if (productRepository.existsByCategoryId(id)) {
            throw new AppException("Cannot delete category that has products", HttpStatus.CONFLICT);
        }
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getLowStockProducts() {
        return productRepository.findByStockQuantityLessThanAndIsActiveTrue(5).stream()
                .map(EntityMapper::toProductDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getAllProductsAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> products = productRepository.findAll(pageable);
        List<ProductDto> content = products.getContent().stream()
                .map(EntityMapper::toProductDto)
                .collect(Collectors.toList());

        return PageResponse.<ProductDto>builder()
                .content(content)
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .last(products.isLast())
                .build();
    }

    private Category getCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException("Category not found", HttpStatus.NOT_FOUND));
    }

    private Product mapToProduct(Product product, ProductRequest request, Category category) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountedPrice(request.getDiscountedPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrls(request.getImageUrls());
        product.setCategory(category);
        product.setSizes(request.getSizes());
        product.setColors(request.getColors());
        product.setIsActive(request.getIsActive());
        product.setIsFeatured(request.getIsFeatured());
        return product;
    }

    private Pageable buildPageable(int page, int size, String sort) {
        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null) {
            switch (sort) {
                case "price_asc" -> sortObj = Sort.by(Sort.Direction.ASC, "price");
                case "price_desc" -> sortObj = Sort.by(Sort.Direction.DESC, "price");
                case "newest" -> sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
                default -> sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
            }
        }
        return PageRequest.of(page, size, sortObj);
    }
}
