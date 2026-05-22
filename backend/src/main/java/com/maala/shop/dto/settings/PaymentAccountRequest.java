package com.maala.shop.dto.settings;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentAccountRequest {

    @NotBlank(message = "Account type is required")
    private String accountType;

    @NotBlank(message = "Account title is required")
    private String accountTitle;

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    private String bankName;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    private Integer displayOrder;
}
