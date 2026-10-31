package com.campuscare.service;

import com.campuscare.dto.*;
import com.campuscare.entity.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.DepartmentRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalComplaints(complaintRepository.count());
        stats.setPendingComplaints(complaintRepository.countByStatus(Status.SUBMITTED) + complaintRepository.countByStatus(Status.ASSIGNED));
        stats.setInProgressComplaints(complaintRepository.countByStatus(Status.IN_PROGRESS));
        stats.setResolvedComplaints(complaintRepository.countByStatus(Status.RESOLVED));
        stats.setRejectedComplaints(complaintRepository.countByStatus(Status.REJECTED));
        stats.setTotalStudents(userRepository.countByRole(Role.STUDENT));
        stats.setTotalStaff(userRepository.countByRole(Role.STAFF));
        stats.setTotalDepartments(departmentRepository.count());

        // Calculate average resolution time for resolved tickets
        List<Complaint> resolvedList = complaintRepository.findByStatusOrderByCreatedAtDesc(Status.RESOLVED);
        if (!resolvedList.isEmpty()) {
            double totalHours = 0;
            int count = 0;
            for (Complaint c : resolvedList) {
                if (c.getCreatedAt() != null && c.getUpdatedAt() != null) {
                    long minutes = Duration.between(c.getCreatedAt(), c.getUpdatedAt()).toMinutes();
                    totalHours += Math.max(0.5, minutes / 60.0);
                    count++;
                }
            }
            double avg = count > 0 ? (totalHours / count) : 3.5;
            stats.setAverageResolutionTime(String.format("%.1f hrs", avg));
        } else {
            stats.setAverageResolutionTime("3.5 hrs");
        }

        return stats;
    }

    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional
    public Department createDepartment(DepartmentRequest request) {
        if (departmentRepository.findByDepartmentName(request.getDepartmentName().trim()).isPresent()) {
            throw new BadRequestException("Department with name '" + request.getDepartmentName() + "' already exists");
        }
        Department dept = new Department(request.getDepartmentName().trim(), request.getDescription());
        return departmentRepository.save(dept);
    }

    @Transactional
    public Department updateDepartment(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        dept.setDepartmentName(request.getDepartmentName().trim());
        dept.setDescription(request.getDescription());
        return departmentRepository.save(dept);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserSummaryDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserSummaryDto createStaffUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Account with email '" + request.getEmail() + "' already exists");
        }

        Role role = Role.STAFF;
        if (request.getRole() != null) {
            try {
                role = Role.valueOf(request.getRole().toUpperCase());
            } catch (Exception ignored) {}
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        String deptName = request.getDepartment() != null ? request.getDepartment().trim() : "Physical Plant & Facilities";
        user.setDepartmentName(deptName);
        departmentRepository.findByDepartmentName(deptName).ifPresent(user::setDepartment);
        user.setRole(role);

        User saved = userRepository.save(user);
        return new UserSummaryDto(saved);
    }

    @Transactional
    public UserSummaryDto updateUserRole(Long id, String roleStr) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        try {
            Role role = Role.valueOf(roleStr.trim().toUpperCase());
            user.setRole(role);
            User updated = userRepository.save(user);
            return new UserSummaryDto(updated);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role specified: " + roleStr);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics() {
        List<Complaint> allComplaints = complaintRepository.findAll();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalComplaints", allComplaints.size());
        analytics.put("studentsCount", userRepository.countByRole(Role.STUDENT));
        analytics.put("staffCount", userRepository.countByRole(Role.STAFF));

        // 1. Complaints by Category
        Map<String, Long> categoryCounts = allComplaints.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCategoryName() != null ? c.getCategoryName() : "Other",
                        Collectors.counting()
                ));
        List<Map<String, Object>> byCategory = categoryCounts.entrySet().stream()
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", e.getKey());
                    item.put("value", e.getValue());
                    item.put("count", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
        analytics.put("byCategory", byCategory);

        // 2. Complaints by Department
        Map<String, Long> deptCounts = allComplaints.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getAssignedDepartment() != null ? c.getAssignedDepartment().getDepartmentName() : "Unassigned",
                        Collectors.counting()
                ));
        List<Map<String, Object>> byDepartment = deptCounts.entrySet().stream()
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", e.getKey());
                    item.put("count", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
        analytics.put("byDepartment", byDepartment);

        // 3. Status Distribution
        Map<Status, Long> statusCounts = allComplaints.stream()
                .collect(Collectors.groupingBy(Complaint::getStatus, Collectors.counting()));
        List<Map<String, Object>> byStatus = Arrays.stream(Status.values())
                .map(st -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", st.name());
                    item.put("value", statusCounts.getOrDefault(st, 0L));
                    item.put("count", statusCounts.getOrDefault(st, 0L));
                    return item;
                })
                .collect(Collectors.toList());
        analytics.put("byStatus", byStatus);

        // 4. Priority Distribution
        Map<Priority, Long> priorityCounts = allComplaints.stream()
                .collect(Collectors.groupingBy(Complaint::getPriority, Collectors.counting()));
        List<Map<String, Object>> byPriority = Arrays.stream(Priority.values())
                .map(pr -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", pr.name());
                    item.put("count", priorityCounts.getOrDefault(pr, 0L));
                    return item;
                })
                .collect(Collectors.toList());
        analytics.put("byPriority", byPriority);

        // 5. Monthly Trends
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, List<Complaint>> monthlyGroups = allComplaints.stream()
                .filter(c -> c.getCreatedAt() != null)
                .collect(Collectors.groupingBy(c -> c.getCreatedAt().format(monthFmt)));

        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        if (monthlyGroups.isEmpty()) {
            monthlyTrends.add(Map.of("month", "Oct 2026", "total", allComplaints.size(), "resolved", complaintRepository.countByStatus(Status.RESOLVED)));
        } else {
            for (Map.Entry<String, List<Complaint>> entry : monthlyGroups.entrySet()) {
                long resolved = entry.getValue().stream().filter(c -> c.getStatus() == Status.RESOLVED).count();
                monthlyTrends.add(Map.of(
                        "month", entry.getKey(),
                        "total", entry.getValue().size(),
                        "resolved", resolved
                ));
            }
        }
        analytics.put("monthlyTrends", monthlyTrends);

        // 6. Average Resolution Time
        double avgHours = 3.8;
        List<Complaint> resolvedComplaints = allComplaints.stream()
                .filter(c -> c.getStatus() == Status.RESOLVED && c.getCreatedAt() != null && c.getUpdatedAt() != null)
                .collect(Collectors.toList());
        if (!resolvedComplaints.isEmpty()) {
            double totalHours = resolvedComplaints.stream()
                    .mapToDouble(c -> Math.max(0.5, Duration.between(c.getCreatedAt(), c.getUpdatedAt()).toMinutes() / 60.0))
                    .sum();
            avgHours = totalHours / resolvedComplaints.size();
        }
        analytics.put("averageResolutionHours", Math.round(avgHours * 10.0) / 10.0);

        return analytics;
    }
}
