package com.campuscare.controller;

import com.campuscare.dto.ComplaintResponse;
import com.campuscare.dto.StatusUpdateRequest;
import com.campuscare.entity.User;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.UserRepository;
import com.campuscare.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffController {

    private final StaffService staffService;
    private final UserRepository userRepository;

    public StaffController(StaffService staffService, UserRepository userRepository) {
        this.staffService = staffService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedStaff(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UnauthorizedException("Staff user not found in database"));
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getStaffComplaints(Authentication authentication) {
        User staffUser = getAuthenticatedStaff(authentication);
        List<ComplaintResponse> complaints = staffService.getStaffComplaints(staffUser);
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        User staffUser = getAuthenticatedStaff(authentication);
        ComplaintResponse response = staffService.updateStaffComplaintStatus(id, request, staffUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/complaints/{id}/accept")
    public ResponseEntity<ComplaintResponse> acceptComplaint(
            @PathVariable Long id,
            Authentication authentication) {
        User staffUser = getAuthenticatedStaff(authentication);
        ComplaintResponse response = staffService.acceptComplaint(id, staffUser);
        return ResponseEntity.ok(response);
    }
}
