package com.campuscare.controller;

import com.campuscare.dto.FeedbackRequest;
import com.campuscare.dto.FeedbackResponse;
import com.campuscare.entity.User;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.UserRepository;
import com.campuscare.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserRepository userRepository;

    public FeedbackController(FeedbackService feedbackService, UserRepository userRepository) {
        this.feedbackService = feedbackService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found in database"));
    }

    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        FeedbackResponse response = feedbackService.submitFeedback(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<FeedbackResponse> getFeedback(
            @PathVariable Long complaintId,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        FeedbackResponse response = feedbackService.getFeedbackByComplaintId(complaintId, currentUser);
        return ResponseEntity.ok(response);
    }
}
