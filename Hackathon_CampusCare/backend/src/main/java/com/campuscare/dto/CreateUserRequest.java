package com.campuscare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateUserRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 150)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid institutional email required")
    private String email;

    @NotBlank(message = "Temporary password is required")
    @Size(min = 6)
    private String password;

    private String department;

    private String role; // STAFF, STUDENT, or ADMIN

    public CreateUserRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
