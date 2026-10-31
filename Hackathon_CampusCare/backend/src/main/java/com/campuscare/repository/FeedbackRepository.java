package com.campuscare.repository;

import com.campuscare.entity.Complaint;
import com.campuscare.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByComplaintId(Long complaintId);
    boolean existsByComplaintId(Long complaintId);
}
