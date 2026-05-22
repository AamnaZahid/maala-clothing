package com.maala.shop.dto.order;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTrackingRequest {

    @NotBlank(message = "Tracking number is required")
    private String leopardTrackingNumber;
}
