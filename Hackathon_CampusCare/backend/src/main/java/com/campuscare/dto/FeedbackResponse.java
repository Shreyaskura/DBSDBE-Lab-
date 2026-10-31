package com.campuscare.dto;

import com.campuscare.entity.Feedback;
import java.time.LocalDateTime;

public class FeedbackResponse {
    private Long id;
    private Long complaintId;
    private Integer rating;
    private String comments;
    private LocalDateTime createdAt;

    public FeedbackResponse() {}

    public FeedbackResponse(Feedback feedback) {
        if (feedback != null) {
            this.id = feedback.getId();
            this.complaintId = feedback.getComplaint() != null ? feedback.getComplaint().getId() : null;
            this.rating = feedback.getRating();
            this.comments = feedback.getComments();
            this.createdAt = feedback.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
