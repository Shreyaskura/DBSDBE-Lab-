package com.campuscare.dto;

import com.campuscare.entity.Notification;
import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationResponse() {}

    public NotificationResponse(Notification notification) {
        if (notification != null) {
            this.id = notification.getId();
            this.message = notification.getMessage();
            this.isRead = notification.isRead();
            this.createdAt = notification.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
