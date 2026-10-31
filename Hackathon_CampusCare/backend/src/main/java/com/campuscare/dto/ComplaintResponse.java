package com.campuscare.dto;

import com.campuscare.entity.Complaint;
import com.campuscare.entity.Priority;
import com.campuscare.entity.Status;
import java.time.LocalDateTime;

public class ComplaintResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String imageUrl;
    private String category;
    private Priority priority;
    private Status status;
    private UserSummaryDto createdBy;
    private String assignedDepartment;
    private String assignedStaff;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private java.util.Map<String, Object> aiAnalysis;

    public ComplaintResponse() {}

    public ComplaintResponse(Complaint complaint, String assignedStaffName) {
        if (complaint != null) {
            this.id = complaint.getId();
            this.title = complaint.getTitle();
            this.description = complaint.getDescription();
            this.location = complaint.getLocation();
            this.imageUrl = complaint.getImageUrl();
            this.category = complaint.getCategory() != null ? complaint.getCategory().getCategoryName() : complaint.getCategoryName();
            this.priority = complaint.getPriority();
            this.status = complaint.getStatus();
            this.createdBy = new UserSummaryDto(complaint.getCreatedBy());
            this.assignedDepartment = complaint.getAssignedDepartment() != null ? complaint.getAssignedDepartment().getDepartmentName() : null;
            this.assignedStaff = assignedStaffName;
            this.createdAt = complaint.getCreatedAt();
            this.updatedAt = complaint.getUpdatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public UserSummaryDto getCreatedBy() { return createdBy; }
    public void setCreatedBy(UserSummaryDto createdBy) { this.createdBy = createdBy; }
    public String getAssignedDepartment() { return assignedDepartment; }
    public void setAssignedDepartment(String assignedDepartment) { this.assignedDepartment = assignedDepartment; }
    public String getAssignedStaff() { return assignedStaff; }
    public void setAssignedStaff(String assignedStaff) { this.assignedStaff = assignedStaff; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public java.util.Map<String, Object> getAiAnalysis() { return aiAnalysis; }
    public void setAiAnalysis(java.util.Map<String, Object> aiAnalysis) { this.aiAnalysis = aiAnalysis; }
}
