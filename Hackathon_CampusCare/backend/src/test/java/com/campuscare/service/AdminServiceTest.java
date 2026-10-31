package com.campuscare.service;

import com.campuscare.dto.CreateUserRequest;
import com.campuscare.dto.DashboardStatsDto;
import com.campuscare.dto.DepartmentRequest;
import com.campuscare.dto.UserSummaryDto;
import com.campuscare.entity.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.DepartmentRepository;
import com.campuscare.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    private PasswordEncoder passwordEncoder;
    private AdminService adminService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        adminService = new AdminService(complaintRepository, userRepository, departmentRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Should aggregate live dashboard statistics from database repositories")
    void testGetDashboardStats() {
        when(complaintRepository.count()).thenReturn(25L);
        when(complaintRepository.countByStatus(Status.SUBMITTED)).thenReturn(5L);
        when(complaintRepository.countByStatus(Status.ASSIGNED)).thenReturn(3L);
        when(complaintRepository.countByStatus(Status.IN_PROGRESS)).thenReturn(7L);
        when(complaintRepository.countByStatus(Status.RESOLVED)).thenReturn(9L);
        when(complaintRepository.countByStatus(Status.REJECTED)).thenReturn(1L);
        when(userRepository.countByRole(Role.STUDENT)).thenReturn(120L);
        when(userRepository.countByRole(Role.STAFF)).thenReturn(14L);
        when(departmentRepository.count()).thenReturn(5L);

        Complaint resolvedComplaint = new Complaint();
        resolvedComplaint.setCreatedAt(LocalDateTime.now().minusHours(4));
        resolvedComplaint.setUpdatedAt(LocalDateTime.now());
        when(complaintRepository.findByStatusOrderByCreatedAtDesc(Status.RESOLVED))
                .thenReturn(List.of(resolvedComplaint));

        DashboardStatsDto stats = adminService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(25L, stats.getTotalComplaints());
        assertEquals(8L, stats.getPendingComplaints()); // 5 SUBMITTED + 3 ASSIGNED
        assertEquals(7L, stats.getInProgressComplaints());
        assertEquals(9L, stats.getResolvedComplaints());
        assertEquals(120L, stats.getTotalStudents());
        assertEquals(14L, stats.getTotalStaff());
        assertEquals(5L, stats.getTotalDepartments());
        assertTrue(stats.getAverageResolutionTime().contains("hrs"));
    }

    @Test
    @DisplayName("Should create department and reject duplicates")
    void testCreateDepartment() {
        DepartmentRequest req = new DepartmentRequest();
        req.setDepartmentName("Campus Transportation Logistics");
        req.setDescription("EV shuttles and campus fleet");

        when(departmentRepository.findByDepartmentName("Campus Transportation Logistics")).thenReturn(Optional.empty());
        when(departmentRepository.save(any(Department.class))).thenAnswer(inv -> inv.getArgument(0));

        Department created = adminService.createDepartment(req);
        assertNotNull(created);
        assertEquals("Campus Transportation Logistics", created.getDepartmentName());

        // Test duplicate rejection
        when(departmentRepository.findByDepartmentName("Campus Transportation Logistics"))
                .thenReturn(Optional.of(created));

        assertThrows(BadRequestException.class, () -> adminService.createDepartment(req));
    }

    @Test
    @DisplayName("Should create staff technician account")
    void testCreateStaffUser() {
        CreateUserRequest req = new CreateUserRequest();
        req.setFullName("David Miller");
        req.setEmail("d.miller@campuscare.edu");
        req.setDepartment("Physical Plant & Facilities");
        req.setRole("STAFF");

        when(userRepository.existsByEmail("d.miller@campuscare.edu")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(77L);
            return u;
        });

        UserSummaryDto staff = adminService.createStaffUser(req);
        assertNotNull(staff);
        assertEquals("d.miller@campuscare.edu", staff.getEmail());
        assertEquals(Role.STAFF, staff.getRole());
    }
}
