package com.maala.shop.service;

import com.maala.shop.entity.OrderNumberSequence;
import com.maala.shop.repository.OrderNumberSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class OrderNumberService {

    private final OrderNumberSequenceRepository sequenceRepository;

    @Transactional
    public synchronized String generateOrderNumber() {
        String yearMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        OrderNumberSequence sequence = sequenceRepository.findById(yearMonth)
                .orElseGet(() -> {
                    OrderNumberSequence newSeq = new OrderNumberSequence();
                    newSeq.setYearMonth(yearMonth);
                    newSeq.setLastNumber(0);
                    return newSeq;
                });

        int next = sequence.getLastNumber() + 1;
        sequence.setLastNumber(next);
        sequenceRepository.save(sequence);

        return String.format("ORD-%s-%04d", yearMonth, next);
    }
}
