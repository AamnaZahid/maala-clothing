package com.maala.shop.repository;

import com.maala.shop.entity.OrderNumberSequence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderNumberSequenceRepository extends JpaRepository<OrderNumberSequence, String> {
}
