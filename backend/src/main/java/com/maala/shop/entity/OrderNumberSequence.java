package com.maala.shop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_number_sequence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderNumberSequence {

    @Id
    @Column(name = "year_month", length = 6)
    private String yearMonth;

    @Column(name = "last_number", nullable = false)
    private Integer lastNumber;
}
