package com.maala.shop.repository;

import com.maala.shop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    boolean existsByCategoryId(Long categoryId);

    Page<Product> findByIsActiveTrue(Pageable pageable);

    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    List<Product> findByStockQuantityLessThanAndIsActiveTrue(Integer quantity);

    @Query("""
        SELECT COALESCE(SUM(COALESCE(p.costPrice, 0) * p.stockQuantity), 0)
        FROM Product p WHERE p.isActive = true
        """)
    java.math.BigDecimal sumInventoryValueAtCost();

    @Query("SELECT COALESCE(SUM(p.stockQuantity), 0) FROM Product p WHERE p.isActive = true")
    Long sumStockOnHand();
}
