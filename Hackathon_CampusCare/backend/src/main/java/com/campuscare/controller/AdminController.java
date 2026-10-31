package com.campuscare.controller;

import com.campuscare.dto.*;
import com.campuscare.entity.Department;
import com.campuscare.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        List<Department> departments = adminService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        Department created = adminService.createDepartment(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request) {
        Department updated = adminService.updateDepartment(id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDto>> getUsers() {
        List<UserSummaryDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<UserSummaryDto> createStaffUser(@Valid @RequestBody CreateUserRequest request) {
        UserSummaryDto created = adminService.createStaffUser(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserSummaryDto> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        UserSummaryDto updated = adminService.updateUserRole(id, role);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> analytics = adminService.getAnalytics();
        return ResponseEntity.ok(analytics);
    }
}
