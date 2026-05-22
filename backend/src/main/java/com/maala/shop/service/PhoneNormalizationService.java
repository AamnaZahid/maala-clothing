package com.maala.shop.service;

import com.maala.shop.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class PhoneNormalizationService {

    /** Pakistani mobile in international format without + (e.g. 923094094776). */
    private static final Pattern PK_MOBILE = Pattern.compile("^923\\d{9}$");

    /**
     * Normalizes Pakistani mobile numbers to {@code 923XXXXXXXXX}.
     * Accepts formats like {@code 03XX...}, {@code +92 3XX...}, {@code 92 3XX...}, with spaces/dashes.
     */
    public String normalize(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new AppException("Phone number is required", HttpStatus.BAD_REQUEST);
        }

        String digits = phone.replaceAll("\\D", "");

        if (digits.startsWith("00")) {
            digits = digits.substring(2);
        }

        if (digits.startsWith("92")) {
            // already country code
        } else if (digits.startsWith("0")) {
            digits = "92" + digits.substring(1);
        } else if (digits.length() == 10 && digits.startsWith("3")) {
            digits = "92" + digits;
        }

        if (!PK_MOBILE.matcher(digits).matches()) {
            throw new AppException(
                    "Invalid Pakistani mobile number. Use 03XX XXXXXXX or +92 3XX XXXXXXX",
                    HttpStatus.BAD_REQUEST
            );
        }

        return digits;
    }

    /** Returns digits suitable for {@code https://wa.me/...} links. */
    public String toWhatsAppNumber(String phone) {
        if (phone == null || phone.isBlank()) {
            return "";
        }
        try {
            return normalize(phone);
        } catch (AppException ex) {
            return phone.replaceAll("\\D", "");
        }
    }

    /** Formats {@code 923094094776} as {@code 0309-4094776} for display. */
    public String formatForDisplay(String normalizedPhone) {
        if (normalizedPhone == null || normalizedPhone.isBlank()) {
            return "";
        }
        String digits = normalizedPhone.replaceAll("\\D", "");
        if (digits.startsWith("92") && digits.length() == 12) {
            return "0" + digits.substring(2, 6) + "-" + digits.substring(6);
        }
        return normalizedPhone;
    }
}
