package com.campuscare.service;

import com.campuscare.dto.AuthResponse;
import com.campuscare.dto.LoginRequest;
import com.campuscare.dto.RegisterRequest;
import com.campuscare.entity.Role;
import com.campuscare.entity.User;
import com.campuscare.exception.BadRequestException;
import com.campuscare.repository.UserRepository;
import com.campuscare.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    private JwtTokenProvider tokenProvider;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        tokenProvider = new JwtTokenProvider("c2VjdXJlX2NhbXB1c2NhcmVfaW5zdGl0dXRpb25hbF9qd3Rfc2VjcmV0X2tleV8yMDI2X2FubW9k", 86400000L);
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, tokenProvider);
    }

    @Test
    @DisplayName("Should successfully register student with BCrypt encoded password")
    void testRegisterStudentSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Maya Lin");
        request.setEmail("maya@campuscare.edu");
        request.setPassword("MayaPassword@123");
        request.setStudentId("STU-2026-8910");
        request.setDepartment("Computer Science");

        when(userRepository.existsByEmail("maya@campuscare.edu")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(tokenProvider.validateToken(response.getToken()));
        assertEquals("maya@campuscare.edu", tokenProvider.getEmailFromToken(response.getToken()));
        assertEquals("maya@campuscare.edu", response.getUser().getEmail());
        assertEquals(Role.STUDENT, response.getUser().getRole());

        // Verify password was hashed with BCrypt
        verify(userRepository).save(argThat(user ->
                passwordEncoder.matches("MayaPassword@123", user.getPassword()) &&
                user.getRole() == Role.STUDENT
        ));
    }

    @Test
    @DisplayName("Should reject public registration attempting to register as ADMIN")
    void testRejectNonStudentPublicRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Hacker User");
        request.setEmail("hacker@campuscare.edu");
        request.setPassword("SecretPass@123");
        request.setRole("ADMIN");

        when(userRepository.existsByEmail("hacker@campuscare.edu")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("strictly permitted for Student accounts only"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should reject registration if email already exists in MySQL")
    void testRejectDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Duplicate User");
        request.setEmail("existing@campuscare.edu");
        request.setPassword("Password@123");

        when(userRepository.existsByEmail("existing@campuscare.edu")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should authenticate user and issue JWT token upon valid login credentials")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@campuscare.edu");
        request.setPassword("Admin@123");

        User adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@campuscare.edu");
        adminUser.setFullName("Campus Administrator");
        adminUser.setRole(Role.ADMIN);
        adminUser.setPassword(passwordEncoder.encode("Admin@123"));

        Authentication auth = new UsernamePasswordAuthenticationToken(adminUser.getEmail(), null, java.util.Collections.emptyList());
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail("admin@campuscare.edu")).thenReturn(Optional.of(adminUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(tokenProvider.validateToken(response.getToken()));
        assertEquals("admin@campuscare.edu", tokenProvider.getEmailFromToken(response.getToken()));
        assertEquals(Role.ADMIN, response.getUser().getRole());
    }
}
