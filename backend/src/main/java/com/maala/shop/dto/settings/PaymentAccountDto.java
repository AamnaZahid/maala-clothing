package com.maala.shop.dto.settings;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAccountDto {
    private Long id;
    private String accountType;
    private String accountTitle;
    private String accountNumber;
    private String bankName;
    private Boolean isActive;
    private Integer displayOrder;
}
