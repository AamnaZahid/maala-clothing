package com.maala.shop.repository;

import com.maala.shop.entity.StockPurchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface StockPurchaseRepository extends JpaRepository<StockPurchase, Long> {

    Page<StockPurchase> findAllByOrderByPurchaseDateDesc(Pageable pageable);

    List<StockPurchase> findByProductIdOrderByPurchaseDateDesc(Long productId);

    @Query("SELECT COALESCE(SUM(s.totalCost), 0) FROM StockPurchase s")
    BigDecimal sumAllTotalCost();

    @Query("SELECT COALESCE(SUM(s.totalCost), 0) FROM StockPurchase s WHERE s.purchaseDate BETWEEN :start AND :end")
    BigDecimal sumTotalCostBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(s.quantity), 0) FROM StockPurchase s WHERE s.purchaseDate BETWEEN :start AND :end")
    Long sumQuantityBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
