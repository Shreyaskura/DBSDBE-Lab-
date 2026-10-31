package com.campuscare.controller;

import com.campuscare.dto.ComplaintResponse;
import com.campuscare.entity.Category;
import com.campuscare.entity.Complaint;
import com.campuscare.entity.Department;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.repository.CategoryRepository;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.DepartmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PublicController {

    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;

    public PublicController(CategoryRepository categoryRepository, 
                            DepartmentRepository departmentRepository,
                            ComplaintRepository complaintRepository) {
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.complaintRepository = complaintRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getPublicCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getPublicDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/public/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "CampusCare Backend Gateway");
        health.put("database", "MySQL 8 (campuscare_db connected)");
        health.put("timestamp", LocalDateTime.now());
        health.put("departmentsCount", departmentRepository.count());
        health.put("categoriesCount", categoryRepository.count());
        return ResponseEntity.ok(health);
    }

    @GetMapping("/public/tickets/{id}")
    public ResponseEntity<ComplaintResponse> getPublicTicketTracking(@PathVariable Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No ticket found with reference ID #" + id));
        String assignedStaffName = complaint.getAssignedDepartment() != null 
                ? complaint.getAssignedDepartment().getDepartmentName() + " Maintenance Team" 
                : "Institutional Triage";
        return ResponseEntity.ok(new ComplaintResponse(complaint, assignedStaffName));
    }
}
