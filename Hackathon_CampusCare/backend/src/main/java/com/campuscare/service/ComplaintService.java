package com.campuscare.service;

import com.campuscare.dto.*;
import com.campuscare.entity.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final ComplaintHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final AiService aiService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            CategoryRepository categoryRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            AssignmentRepository assignmentRepository,
            ComplaintHistoryRepository historyRepository,
            NotificationRepository notificationRepository,
            AiService aiService) {
        this.complaintRepository = complaintRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.historyRepository = historyRepository;
        this.notificationRepository = notificationRepository;
        this.aiService = aiService;
    }

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, User currentUser) {
        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());

        // Construct composite location if individual fields provided
        String loc = request.getLocation();
        if ((loc == null || loc.trim().isEmpty()) && request.getCampusBlock() != null) {
            loc = String.format("%s, %s, %s", request.getCampusBlock(), request.getBuilding(), request.getRoom());
        }
        complaint.setLocation(loc != null ? loc.trim() : "Campus Location");
        complaint.setImageUrl(request.getImageUrl());

        // Category linking
        Category category = categoryRepository.findByCategoryName(request.getCategory())
                .orElseGet(() -> categoryRepository.save(new Category(request.getCategory(), "Campus category")));
        complaint.setCategory(category);
        complaint.setCategoryName(category.getCategoryName());

        // AI triage: determine recommended priority
        Priority determinedPriority = Priority.MEDIUM;
        try {
            AiPriorityResponse aiResp = aiService.predictPriority(complaint.getTitle(), complaint.getDescription(), complaint.getCategoryName());
            if (aiResp != null && aiResp.getPriority() != null) {
                determinedPriority = Priority.valueOf(aiResp.getPriority().toUpperCase());
            }
        } catch (Exception e) {
            determinedPriority = Priority.MEDIUM;
        }

        complaint.setPriority(determinedPriority);
        complaint.setStatus(Status.SUBMITTED);
        complaint.setCreatedBy(currentUser);

        // Auto-assign department based on category
        Department department = resolveDepartmentByCategory(category.getCategoryName());
        complaint.setAssignedDepartment(department);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Record initial history
        ComplaintHistory history = new ComplaintHistory(
                savedComplaint,
                null,
                Status.SUBMITTED.name(),
                "Complaint filed by student. Awaiting technician assignment.",
                currentUser
        );
        historyRepository.save(history);

        // Dispatch notification
        notificationRepository.save(new Notification(
                currentUser,
                "Your complaint #" + savedComplaint.getId() + " (" + savedComplaint.getTitle() + ") has been submitted."
        ));

        return buildComplaintResponse(savedComplaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints(User currentUser) {
        return complaintRepository.findByCreatedByIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::buildComplaintResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        // Ownership check: Students may only view their own complaints
        if (currentUser.getRole() == Role.STUDENT && !complaint.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied: You do not have permission to view this complaint.");
        }

        return buildComplaintResponse(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints(String statusStr, String categoryStr) {
        List<Complaint> complaints;
        if (statusStr != null && !statusStr.equalsIgnoreCase("ALL")) {
            try {
                Status status = Status.valueOf(statusStr.toUpperCase());
                complaints = complaintRepository.findByStatusOrderByCreatedAtDesc(status);
            } catch (IllegalArgumentException e) {
                complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        }

        if (categoryStr != null && !categoryStr.equalsIgnoreCase("ALL")) {
            complaints = complaints.stream()
                    .filter(c -> c.getCategoryName() != null && c.getCategoryName().equalsIgnoreCase(categoryStr))
                    .collect(Collectors.toList());
        }

        return complaints.stream()
                .map(this::buildComplaintResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, StatusUpdateRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        // Authorization check: Only Staff or Admin can update status
        if (currentUser.getRole() == Role.STUDENT) {
            throw new UnauthorizedException("Students are not authorized to update complaint statuses.");
        }

        Status newStatus;
        try {
            newStatus = Status.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + request.getStatus());
        }

        String previousStatus = complaint.getStatus().name();
        complaint.setStatus(newStatus);
        Complaint updatedComplaint = complaintRepository.save(complaint);

        // Record history
        String remarks = request.getRemarks() != null && !request.getRemarks().trim().isEmpty() 
                ? request.getRemarks().trim() 
                : "Status transitioned from " + previousStatus + " to " + newStatus.name();

        ComplaintHistory history = new ComplaintHistory(
                updatedComplaint,
                previousStatus,
                newStatus.name(),
                remarks,
                currentUser
        );
        historyRepository.save(history);

        // Notify student requester
        notificationRepository.save(new Notification(
                complaint.getCreatedBy(),
                "Your complaint #" + complaint.getId() + " status has updated to: " + newStatus.name()
        ));

        return buildComplaintResponse(updatedComplaint);
    }

    @Transactional
    public ComplaintResponse assignComplaint(Long id, AssignRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only administrators can assign complaints to staff technicians.");
        }

        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found with ID: " + request.getStaffId()));

        if (staff.getRole() == Role.STUDENT) {
            throw new BadRequestException("Cannot assign complaint to a Student account.");
        }

        // Update assigned department if provided
        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                    .ifPresent(complaint::setAssignedDepartment);
        }

        // Create assignment record
        Assignment assignment = new Assignment(complaint, staff);
        assignmentRepository.save(assignment);

        String previousStatus = complaint.getStatus().name();
        if (complaint.getStatus() == Status.SUBMITTED) {
            complaint.setStatus(Status.ASSIGNED);
        }
        Complaint updatedComplaint = complaintRepository.save(complaint);

        // Log history
        String remarks = request.getRemarks() != null && !request.getRemarks().trim().isEmpty()
                ? request.getRemarks().trim()
                : "Assigned to staff technician: " + staff.getFullName();

        ComplaintHistory history = new ComplaintHistory(
                updatedComplaint,
                previousStatus,
                complaint.getStatus().name(),
                remarks,
                currentUser
        );
        historyRepository.save(history);

        // Notify staff & student
        notificationRepository.save(new Notification(
                staff,
                "New ticket assignment: #" + complaint.getId() + " (" + complaint.getTitle() + ")"
        ));
        notificationRepository.save(new Notification(
                complaint.getCreatedBy(),
                "Your complaint #" + complaint.getId() + " has been assigned to technician: " + staff.getFullName()
        ));

        return buildComplaintResponse(updatedComplaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintHistoryDto> getComplaintHistory(Long id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (currentUser.getRole() == Role.STUDENT && !complaint.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied to view this complaint history.");
        }

        return historyRepository.findByComplaintIdOrderByUpdatedAtAsc(id)
                .stream()
                .map(ComplaintHistoryDto::new)
                .collect(Collectors.toList());
    }

    private Department resolveDepartmentByCategory(String categoryName) {
        String deptName;
        if (categoryName == null) deptName = "Physical Plant & Facilities";
        else {
            switch (categoryName.toUpperCase()) {
                case "NETWORK & WI-FI":
                case "CLASSROOM EQUIPMENT":
                    deptName = "Office of Information Technology";
                    break;
                case "HOSTEL":
                case "ELECTRICAL":
                case "PLUMBING":
                case "INFRASTRUCTURE":
                    deptName = "Physical Plant & Facilities";
                    break;
                case "CLEANING & SANITATION":
                    deptName = "Sanitation & Environmental Services";
                    break;
                case "SAFETY":
                case "SECURITY":
                    deptName = "Campus Security & Safety";
                    break;
                default:
                    deptName = "Physical Plant & Facilities";
            }
        }

        return departmentRepository.findByDepartmentName(deptName).orElse(null);
    }

    private ComplaintResponse buildComplaintResponse(Complaint complaint) {
        String assignedStaffName = assignmentRepository.findTopByComplaintOrderByAssignedAtDesc(complaint)
                .map(a -> a.getAssignedStaff().getFullName())
                .orElse(null);
        ComplaintResponse resp = new ComplaintResponse(complaint, assignedStaffName);
        try {
            AiPriorityResponse p = aiService.predictPriority(complaint.getTitle(), complaint.getDescription(), complaint.getCategoryName());
            java.util.Map<String, Object> aiMap = new java.util.HashMap<>();
            aiMap.put("recommendedPriority", p.getPriority());
            aiMap.put("urgencyScore", p.getUrgencyScore());
            aiMap.put("explanation", p.getExplanation());
            aiMap.put("engine", "Scikit-Learn TF-IDF + FastAPI");
            resp.setAiAnalysis(aiMap);
        } catch (Exception ignored) {}
        return resp;
    }

    @Transactional(readOnly = true)
    public List<DuplicateMatchDto> getDuplicates(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));
        List<Complaint> existing = complaintRepository.findAll();
        return aiService.detectDuplicates(complaint, existing);
    }
}
