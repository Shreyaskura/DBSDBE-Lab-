package com.campuscare.controller;

import com.campuscare.dto.NotificationResponse;
import com.campuscare.entity.User;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.UserRepository;
import com.campuscare.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found in database"));
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        List<NotificationResponse> list = notificationService.getUserNotifications(currentUser);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markNotificationAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        NotificationResponse response = notificationService.markAsRead(id, currentUser);
        return ResponseEntity.ok(response);
    }
}
