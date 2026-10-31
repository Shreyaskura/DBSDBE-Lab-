package com.campuscare.service;

import com.campuscare.dto.ComplaintResponse;
import com.campuscare.dto.StatusUpdateRequest;
import com.campuscare.entity.Complaint;
import com.campuscare.entity.User;
import com.campuscare.repository.AssignmentRepository;
import com.campuscare.repository.ComplaintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;
    private final AssignmentRepository assignmentRepository;

    public StaffService(
            ComplaintRepository complaintRepository,
            ComplaintService complaintService,
            AssignmentRepository assignmentRepository) {
        this.complaintRepository = complaintRepository;
        this.complaintService = complaintService;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getStaffComplaints(User staffUser) {
        List<Complaint> assigned = complaintRepository.findComplaintsAssignedToStaff(staffUser.getId());
        if (assigned.isEmpty() && staffUser.getDepartment() != null) {
            assigned = complaintRepository.findByAssignedDepartmentOrderByCreatedAtDesc(staffUser.getDepartment());
        }
        if (assigned.isEmpty()) {
            assigned = complaintRepository.findAllByOrderByCreatedAtDesc();
        }

        return assigned.stream()
                .map(c -> {
                    String staffName = assignmentRepository.findTopByComplaintOrderByAssignedAtDesc(c)
                            .map(a -> a.getAssignedStaff().getFullName())
                            .orElse(null);
                    return new ComplaintResponse(c, staffName);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse updateStaffComplaintStatus(Long id, StatusUpdateRequest request, User staffUser) {
        return complaintService.updateStatus(id, request, staffUser);
    }

    @Transactional
    public ComplaintResponse acceptComplaint(Long id, User staffUser) {
        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus("IN_PROGRESS");
        request.setRemarks("Technician " + staffUser.getFullName() + " accepted assignment and initiated field work.");
        return complaintService.updateStatus(id, request, staffUser);
    }
}
