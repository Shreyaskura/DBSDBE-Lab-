package com.campuscare.service;

import com.campuscare.dto.NotificationResponse;
import com.campuscare.entity.Notification;
import com.campuscare.entity.User;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(User currentUser) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, User currentUser) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Cannot modify notifications belonging to another user.");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return new NotificationResponse(updated);
    }
}
