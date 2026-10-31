package com.campuscare.dto;

public class DashboardStatsDto {
    private long totalComplaints;
    private long pendingComplaints;
    private long inProgressComplaints;
    private long resolvedComplaints;
    private long rejectedComplaints;
    private long totalStudents;
    private long totalStaff;
    private long totalDepartments;
    private String averageResolutionTime = "3.8 hrs";

    public DashboardStatsDto() {}

    public String getAverageResolutionTime() { return averageResolutionTime; }
    public void setAverageResolutionTime(String averageResolutionTime) { this.averageResolutionTime = averageResolutionTime; }

    public long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }
    public long getPendingComplaints() { return pendingComplaints; }
    public void setPendingComplaints(long pendingComplaints) { this.pendingComplaints = pendingComplaints; }
    public long getInProgressComplaints() { return inProgressComplaints; }
    public void setInProgressComplaints(long inProgressComplaints) { this.inProgressComplaints = inProgressComplaints; }
    public long getResolvedComplaints() { return resolvedComplaints; }
    public void setResolvedComplaints(long resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }
    public long getRejectedComplaints() { return rejectedComplaints; }
    public void setRejectedComplaints(long rejectedComplaints) { this.rejectedComplaints = rejectedComplaints; }
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getTotalStaff() { return totalStaff; }
    public void setTotalStaff(long totalStaff) { this.totalStaff = totalStaff; }
    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }
}
