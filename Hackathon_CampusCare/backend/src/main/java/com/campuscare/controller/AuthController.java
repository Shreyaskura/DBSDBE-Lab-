package com.campuscare.controller;

import com.campuscare.dto.AuthResponse;
import com.campuscare.dto.LoginRequest;
import com.campuscare.dto.RegisterRequest;
import com.campuscare.dto.UserSummaryDto;
import com.campuscare.entity.User;
import com.campuscare.repository.UserRepository;
import com.campuscare.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        addJwtCookie(response, authResponse.getToken());
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        addJwtCookie(response, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserSummaryDto> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new UserSummaryDto(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("campuscare_jwt", "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    private void addJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("campuscare_jwt", token);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(86400); // 24 hours
        response.addCookie(cookie);
    }
}
