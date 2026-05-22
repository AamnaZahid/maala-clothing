package com.maala.shop.repository;

import com.maala.shop.entity.PaymentAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentAccountRepository extends JpaRepository<PaymentAccount, Long> {
    List<PaymentAccount> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<PaymentAccount> findAllByOrderByDisplayOrderAsc();
}
