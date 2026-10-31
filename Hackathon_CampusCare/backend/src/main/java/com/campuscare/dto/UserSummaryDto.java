package com.campuscare.dto;

import com.campuscare.entity.Role;
import com.campuscare.entity.User;
import java.time.LocalDateTime;

public class UserSummaryDto {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String departmentName;
    private String studentId;
    private LocalDateTime createdAt;

    public UserSummaryDto() {}

    public UserSummaryDto(User user) {
        if (user != null) {
            this.id = user.getId();
            this.fullName = user.getFullName();
            this.email = user.getEmail();
            this.role = user.getRole();
            this.departmentName = user.getDepartment() != null ? user.getDepartment().getDepartmentName() : user.getDepartmentName();
            this.studentId = user.getStudentId();
            this.createdAt = user.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
