package com.campuscare.service;

import com.campuscare.dto.AuthResponse;
import com.campuscare.dto.LoginRequest;
import com.campuscare.dto.RegisterRequest;
import com.campuscare.dto.UserSummaryDto;
import com.campuscare.entity.Role;
import com.campuscare.entity.User;
import com.campuscare.exception.BadRequestException;
import com.campuscare.repository.UserRepository;
import com.campuscare.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        // Public registration rule: Only STUDENT role is permitted
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            if (!"STUDENT".equalsIgnoreCase(request.getRole().trim())) {
                throw new BadRequestException("Public registration is strictly permitted for Student accounts only. Staff and Admin accounts are provisioned by administrators.");
            }
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setDepartmentName(request.getDepartment());
        user.setStudentId(request.getStudentId());

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        return new AuthResponse(token, new UserSummaryDto(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User record not found"));

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, new UserSummaryDto(user));
    }
}
