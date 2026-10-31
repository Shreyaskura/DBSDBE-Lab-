package com.campuscare.repository;

import com.campuscare.entity.Complaint;
import com.campuscare.entity.ComplaintHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, Long> {
    List<ComplaintHistory> findByComplaintIdOrderByUpdatedAtAsc(Long complaintId);
    List<ComplaintHistory> findByComplaintOrderByUpdatedAtAsc(Complaint complaint);
}
