package com.campuscare.dto;

import com.campuscare.entity.ComplaintHistory;
import java.time.LocalDateTime;

public class ComplaintHistoryDto {
    private Long id;
    private String previousStatus;
    private String newStatus;
    private String remarks;
    private String updatedBy;
    private LocalDateTime updatedAt;

    public ComplaintHistoryDto() {}

    public ComplaintHistoryDto(ComplaintHistory history) {
        if (history != null) {
            this.id = history.getId();
            this.previousStatus = history.getPreviousStatus();
            this.newStatus = history.getNewStatus();
            this.remarks = history.getRemarks();
            this.updatedBy = history.getUpdatedBy() != null ? history.getUpdatedBy().getFullName() : "System / AI";
            this.updatedAt = history.getUpdatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }
    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
