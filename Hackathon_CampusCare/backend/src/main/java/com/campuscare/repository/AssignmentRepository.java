package com.campuscare.repository;

import com.campuscare.entity.Assignment;
import com.campuscare.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByComplaint(Complaint complaint);
    List<Assignment> findByAssignedStaffIdOrderByAssignedAtDesc(Long staffId);
    Optional<Assignment> findTopByComplaintOrderByAssignedAtDesc(Complaint complaint);
}
