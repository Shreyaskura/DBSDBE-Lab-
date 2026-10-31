package com.campuscare.service;

import com.campuscare.dto.FeedbackRequest;
import com.campuscare.dto.FeedbackResponse;
import com.campuscare.entity.Complaint;
import com.campuscare.entity.Feedback;
import com.campuscare.entity.Role;
import com.campuscare.entity.User;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ComplaintRepository complaintRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, ComplaintRepository complaintRepository) {
        this.feedbackRepository = feedbackRepository;
        this.complaintRepository = complaintRepository;
    }

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(request.getComplaintId())
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + request.getComplaintId()));

        if (currentUser.getRole() == Role.STUDENT && !complaint.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only submit feedback for your own service requests.");
        }

        if (feedbackRepository.existsByComplaintId(complaint.getId())) {
            throw new BadRequestException("Feedback has already been submitted for this complaint.");
        }

        Feedback feedback = new Feedback(complaint, request.getRating(), request.getComments());
        Feedback saved = feedbackRepository.save(feedback);
        return new FeedbackResponse(saved);
    }

    @Transactional(readOnly = true)
    public FeedbackResponse getFeedbackByComplaintId(Long complaintId, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        if (currentUser.getRole() == Role.STUDENT && !complaint.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied to feedback for another student's complaint.");
        }

        Feedback feedback = feedbackRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("No feedback found for complaint ID: " + complaintId));
        return new FeedbackResponse(feedback);
    }
}
