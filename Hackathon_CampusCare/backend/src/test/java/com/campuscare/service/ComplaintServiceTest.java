package com.campuscare.service;

import com.campuscare.dto.*;
import com.campuscare.entity.*;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private ComplaintHistoryRepository historyRepository;

    @Mock
    private NotificationRepository notificationRepository;

    private AiService aiService;

    private ComplaintService complaintService;

    private User student1;
    private User student2;
    private User staffUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        aiService = new AiService() {
            @Override
            public AiPriorityResponse predictPriority(String title, String description, String category) {
                return new AiPriorityResponse("HIGH", 8.0, "High operational disruption");
            }
        };

        complaintService = new ComplaintService(
                complaintRepository,
                categoryRepository,
                departmentRepository,
                userRepository,
                assignmentRepository,
                historyRepository,
                notificationRepository,
                aiService
        );

        student1 = new User();
        student1.setId(101L);
        student1.setEmail("student1@campuscare.edu");
        student1.setFullName("Student One");
        student1.setRole(Role.STUDENT);

        student2 = new User();
        student2.setId(102L);
        student2.setEmail("student2@campuscare.edu");
        student2.setFullName("Student Two");
        student2.setRole(Role.STUDENT);

        staffUser = new User();
        staffUser.setId(201L);
        staffUser.setEmail("staff@campuscare.edu");
        staffUser.setFullName("Marcus Sterling");
        staffUser.setRole(Role.STAFF);

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@campuscare.edu");
        adminUser.setFullName("Campus Admin");
        adminUser.setRole(Role.ADMIN);
    }

    @Test
    @DisplayName("Should create complaint and auto-infer priority via AI service")
    void testCreateComplaintSuccess() {
        ComplaintRequest req = new ComplaintRequest();
        req.setTitle("Projector screen broken");
        req.setDescription("Flickering in classroom 101 during lecture");
        req.setCategory("Classroom Equipment");
        req.setLocation("Academic Block B, Room 101");

        Category category = new Category("Classroom Equipment", "AV items");
        when(categoryRepository.findByCategoryName("Classroom Equipment")).thenReturn(Optional.of(category));

        when(complaintRepository.save(any(Complaint.class))).thenAnswer(inv -> {
            Complaint c = inv.getArgument(0);
            c.setId(500L);
            return c;
        });

        ComplaintResponse response = complaintService.createComplaint(req, student1);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals(Priority.HIGH, response.getPriority());
        assertEquals(Status.SUBMITTED, response.getStatus());

        verify(complaintRepository).save(any(Complaint.class));
        verify(historyRepository).save(any(ComplaintHistory.class));
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("Student complaint ownership: Student B cannot view Student A's complaint")
    void testStudentCannotViewOtherStudentComplaint() {
        Complaint complaint = new Complaint();
        complaint.setId(301L);
        complaint.setTitle("Private Student Complaint");
        complaint.setCreatedBy(student1); // Owned by student1

        when(complaintRepository.findById(301L)).thenReturn(Optional.of(complaint));

        // student2 tries to access complaint owned by student1
        UnauthorizedException ex = assertThrows(
                UnauthorizedException.class,
                () -> complaintService.getComplaintById(301L, student2)
        );

        assertTrue(ex.getMessage().contains("Access denied"));
    }

    @Test
    @DisplayName("Owner student can view their own complaint")
    void testOwnerStudentCanViewOwnComplaint() {
        Complaint complaint = new Complaint();
        complaint.setId(301L);
        complaint.setTitle("Student 1 Complaint");
        complaint.setCreatedBy(student1);
        complaint.setStatus(Status.SUBMITTED);
        complaint.setPriority(Priority.MEDIUM);

        when(complaintRepository.findById(301L)).thenReturn(Optional.of(complaint));

        ComplaintResponse resp = complaintService.getComplaintById(301L, student1);
        assertNotNull(resp);
        assertEquals(301L, resp.getId());
    }

    @Test
    @DisplayName("Students cannot update complaint status")
    void testStudentCannotUpdateStatus() {
        Complaint complaint = new Complaint();
        complaint.setId(401L);
        complaint.setStatus(Status.SUBMITTED);

        when(complaintRepository.findById(401L)).thenReturn(Optional.of(complaint));

        StatusUpdateRequest req = new StatusUpdateRequest();
        req.setStatus("RESOLVED");
        req.setRemarks("Student trying to resolve");

        assertThrows(UnauthorizedException.class, () -> complaintService.updateStatus(401L, req, student1));
        verify(complaintRepository, never()).save(any(Complaint.class));
    }

    @Test
    @DisplayName("Only administrators can assign complaints to staff technicians")
    void testNonAdminCannotAssignComplaint() {
        Complaint complaint = new Complaint();
        complaint.setId(401L);

        when(complaintRepository.findById(401L)).thenReturn(Optional.of(complaint));

        AssignRequest req = new AssignRequest();
        req.setStaffId(staffUser.getId());

        // Student tries to assign
        assertThrows(UnauthorizedException.class, () -> complaintService.assignComplaint(401L, req, student1));

        // Staff tries to assign
        assertThrows(UnauthorizedException.class, () -> complaintService.assignComplaint(401L, req, staffUser));

        verify(assignmentRepository, never()).save(any(Assignment.class));
    }

    @Test
    @DisplayName("Admin can assign complaint to staff technician")
    void testAdminCanAssignComplaintToStaff() {
        Complaint complaint = new Complaint();
        complaint.setId(401L);
        complaint.setTitle("Broken pipe");
        complaint.setStatus(Status.SUBMITTED);
        complaint.setPriority(Priority.HIGH);
        complaint.setCreatedBy(student1);

        when(complaintRepository.findById(401L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(staffUser.getId())).thenReturn(Optional.of(staffUser));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

        AssignRequest req = new AssignRequest();
        req.setStaffId(staffUser.getId());
        req.setRemarks("Dispatched to Marcus Sterling");

        ComplaintResponse response = complaintService.assignComplaint(401L, req, adminUser);

        assertNotNull(response);
        assertEquals(Status.ASSIGNED, complaint.getStatus());
        verify(assignmentRepository).save(any(Assignment.class));
        verify(historyRepository).save(any(ComplaintHistory.class));
        // Verify notifications sent to both staff and student requester
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }
}
