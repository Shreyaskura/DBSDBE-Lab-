package com.campuscare.dto;

import jakarta.validation.constraints.NotNull;

public class AssignRequest {

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    private Long departmentId;

    private String remarks;

    public AssignRequest() {}

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
