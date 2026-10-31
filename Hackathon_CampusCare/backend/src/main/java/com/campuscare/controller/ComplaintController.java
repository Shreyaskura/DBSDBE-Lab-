package com.campuscare.controller;

import com.campuscare.dto.*;
import com.campuscare.entity.User;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.UserRepository;
import com.campuscare.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    public ComplaintController(ComplaintService complaintService, UserRepository userRepository) {
        this.complaintService = complaintService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found in database"));
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        ComplaintResponse response = complaintService.createComplaint(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        List<ComplaintResponse> complaints = complaintService.getMyComplaints(currentUser);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable Long id,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        ComplaintResponse response = complaintService.getComplaintById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        if (currentUser.getRole() == com.campuscare.entity.Role.STUDENT) {
            throw new UnauthorizedException("Students are only authorized to view their own complaints via /api/complaints/my");
        }
        List<ComplaintResponse> complaints = complaintService.getAllComplaints(status, category);
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        ComplaintResponse response = complaintService.updateStatus(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest request,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        ComplaintResponse response = complaintService.assignComplaint(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ComplaintHistoryDto>> getComplaintHistory(
            @PathVariable Long id,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        List<ComplaintHistoryDto> history = complaintService.getComplaintHistory(id, currentUser);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}/duplicates")
    public ResponseEntity<List<DuplicateMatchDto>> getComplaintDuplicates(
            @PathVariable Long id,
            Authentication authentication) {
        getAuthenticatedUser(authentication);
        List<DuplicateMatchDto> duplicates = complaintService.getDuplicates(id);
        return ResponseEntity.ok(duplicates);
    }
}
