package com.campuscare.repository;

import com.campuscare.entity.Complaint;
import com.campuscare.entity.Department;
import com.campuscare.entity.Status;
import com.campuscare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByStatusOrderByCreatedAtDesc(Status status);
    List<Complaint> findByAssignedDepartmentOrderByCreatedAtDesc(Department department);
    long countByStatus(Status status);

    @Query("SELECT c FROM Complaint c JOIN Assignment a ON a.complaint = c WHERE a.assignedStaff.id = :staffId ORDER BY c.createdAt DESC")
    List<Complaint> findComplaintsAssignedToStaff(@Param("staffId") Long staffId);
}
