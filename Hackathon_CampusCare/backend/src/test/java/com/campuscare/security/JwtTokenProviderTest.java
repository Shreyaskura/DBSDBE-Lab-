package com.campuscare.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "c2VjdXJlX2NhbXB1c2NhcmVfaW5zdGl0dXRpb25hbF9qd3Rfc2VjcmV0X2tleV8yMDI2X2FubW9k";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    @DisplayName("Should generate valid JWT token with subject email and role claim")
    void testGenerateAndValidateToken() {
        String email = "maya@campuscare.edu";
        String role = "STUDENT";

        String token = tokenProvider.generateToken(email, role);

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(email, tokenProvider.getEmailFromToken(token));
        assertEquals(role, tokenProvider.getRoleFromToken(token));
    }

    @Test
    @DisplayName("Should reject malformed or tampered JWT token")
    void testInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.token.string"));
        assertFalse(tokenProvider.validateToken(""));
        assertFalse(tokenProvider.validateToken(null));
    }
}
