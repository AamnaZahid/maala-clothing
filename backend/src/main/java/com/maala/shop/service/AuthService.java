package com.maala.shop.service;

import com.maala.shop.dto.auth.*;
import com.maala.shop.entity.RefreshToken;
import com.maala.shop.entity.Role;
import com.maala.shop.entity.User;
import com.maala.shop.exception.AppException;
import com.maala.shop.mapper.EntityMapper;
import com.maala.shop.repository.RefreshTokenRepository;
import com.maala.shop.repository.UserRepository;
import com.maala.shop.security.JwtTokenProvider;
import com.maala.shop.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PhoneNormalizationService phoneNormalizationService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(phoneNormalizationService.normalize(request.getPhone()))
                .address(request.getAddress())
                .city(request.getCity())
                .role(Role.CUSTOMER)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .mustChangePassword(false)
                .build();

        userRepository.save(user);
        return buildAuthResponse(new UserPrincipal(user));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return buildAuthResponse(principal);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AppException("Invalid refresh token", HttpStatus.UNAUTHORIZED));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new AppException("Refresh token expired", HttpStatus.UNAUTHORIZED);
        }

        UserPrincipal principal = new UserPrincipal(refreshToken.getUser());
        refreshTokenRepository.delete(refreshToken);
        return buildAuthResponse(principal);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(refreshTokenRepository::delete);
    }

    @Transactional
    public UserDto changePassword(UserPrincipal principal, ChangePasswordRequest request) {
        User user = userRepository.findById(principal.getUser().getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new AppException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
        return EntityMapper.toUserDto(user);
    }

    public UserDto getProfile(UserPrincipal principal) {
        return EntityMapper.toUserDto(principal.getUser());
    }

    private AuthResponse buildAuthResponse(UserPrincipal principal) {
        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String refreshTokenValue = jwtTokenProvider.generateRefreshToken(principal);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(principal.getUser())
                .token(refreshTokenValue + "-" + UUID.randomUUID())
                .expiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(EntityMapper.toUserDto(principal.getUser()))
                .build();
    }
}
