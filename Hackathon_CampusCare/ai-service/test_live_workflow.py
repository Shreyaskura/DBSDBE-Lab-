"""
CampusCare End-to-End Integration Verification Script
Tests complete lifecycle against live running services:
- Python FastAPI AI Microservice (Port 8000)
- Spring Boot Gateway (Port 8080)
- MySQL 8.0 Persistence (Port 3306)
"""

import time
import requests
import sys

BASE_URL = "http://127.0.0.1:8080/api"
AI_URL = "http://127.0.0.1:8000"

def log(step, msg):
    print(f"\n[STEP {step}] {msg}")

def assert_true(condition, msg):
    if not condition:
        print(f"FAILED: {msg}")
        sys.exit(1)
    print(f"PASSED: {msg}")

def main():
    print("=" * 60)
    print("CAMPUSCARE END-TO-END LIVE INTEGRATION TEST SUITE")
    print("=" * 60)

    # 1. Verify AI Service Health
    log(1, "Verifying AI Service Health on :8000...")
    ai_health = requests.get(f"{AI_URL}/health", timeout=5)
    assert_true(ai_health.status_code == 200, f"AI Health status is 200 (Got {ai_health.status_code})")
    assert_true(ai_health.json().get("status") == "UP", "AI Health payload is UP")

    # 2. Verify Backend Public Health on :8080
    log(2, "Verifying Spring Boot Public Health on :8080...")
    backend_health = requests.get(f"{BASE_URL}/public/health", timeout=5)
    assert_true(backend_health.status_code == 200, f"Backend Health status is 200 (Got {backend_health.status_code})")
    data = backend_health.json()
    assert_true(data.get("status") == "UP", "Backend status is UP")
    assert_true("MySQL 8" in data.get("database", ""), "MySQL database connected")

    # 3. Register New Student
    timestamp = int(time.time())
    student_email = f"student_{timestamp}@campuscare.edu"
    student_pass = "StudentSecure@123"
    student_name = f"Test Student {timestamp}"
    
    log(3, f"Registering student: {student_email}...")
    reg_payload = {
        "fullName": student_name,
        "email": student_email,
        "password": student_pass,
        "studentId": f"STU-{timestamp}",
        "department": "Computer Science"
    }
    reg_res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload, timeout=5)
    assert_true(reg_res.status_code == 201, f"Student registration returned 201 (Got {reg_res.status_code})")
    reg_data = reg_res.json()
    assert_true("token" in reg_data, "JWT token returned upon registration")
    student_token = reg_data["token"]
    student_id = reg_data["user"]["id"]
    print(f"Student Registered ID: {student_id}, Token acquired.")

    # 4. Student Login
    log(4, "Testing Student Login with issued credentials...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={"email": student_email, "password": student_pass}, timeout=5)
    assert_true(login_res.status_code == 200, "Login successful with HTTP 200")
    login_data = login_res.json()
    assert_true(login_data["user"]["role"] == "STUDENT", "User role is STUDENT")
    student_token = login_data["token"]

    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 5. Submit Complaint with AI Priority Inference
    log(5, "Submitting complaint: 'Severe electrical sparking in lab 401'...")
    complaint_payload = {
        "title": "Severe electrical sparking in lab 401",
        "description": "Main circuit breaker smoking and sparking next to work benches",
        "location": "Science Block B, Room 401",
        "category": "Electrical"
    }
    comp_res = requests.post(f"{BASE_URL}/complaints", json=complaint_payload, headers=student_headers, timeout=10)
    assert_true(comp_res.status_code == 201, f"Complaint created with HTTP 201 (Got {comp_res.status_code})")
    comp_data = comp_res.json()
    complaint_id = comp_data["id"]
    priority = comp_data["priority"]
    status = comp_data["status"]
    print(f"Complaint Created ID: {complaint_id}, Priority: {priority}, Status: {status}")
    assert_true(priority in ["CRITICAL", "HIGH"], f"AI correctly inferred emergency priority: {priority}")
    assert_true(status == "SUBMITTED", "Initial status is SUBMITTED")

    # 6. Verify Complaint in My Complaints
    log(6, "Querying /api/complaints/my...")
    my_res = requests.get(f"{BASE_URL}/complaints/my", headers=student_headers, timeout=5)
    assert_true(my_res.status_code == 200, "My complaints returned 200")
    my_list = my_res.json()
    assert_true(any(c["id"] == complaint_id for c in my_list), f"Created ticket #{complaint_id} exists in student's list")

    # 7. Verify Student Privacy: Cannot Access Master Complaints Register
    log(7, "Verifying Student Privacy: Querying master /api/complaints as student...")
    forbidden_res = requests.get(f"{BASE_URL}/complaints", headers=student_headers, timeout=5)
    assert_true(forbidden_res.status_code == 403, f"Student is blocked with HTTP 403 (Got {forbidden_res.status_code})")

    # 8. Admin Login
    log(8, "Logging in as Administrator (admin@campuscare.edu)...")
    admin_login_res = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@campuscare.edu", "password": "Admin@123"}, timeout=5)
    assert_true(admin_login_res.status_code == 200, "Admin login successful with HTTP 200")
    admin_token = admin_login_res.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 9. Admin Dashboard Stats
    log(9, "Querying /api/admin/dashboard...")
    stats_res = requests.get(f"{BASE_URL}/admin/dashboard", headers=admin_headers, timeout=5)
    assert_true(stats_res.status_code == 200, "Admin dashboard stats returned 200")
    stats = stats_res.json()
    print(f"Dashboard Stats: Total={stats.get('totalComplaints')}, Pending={stats.get('pendingComplaints')}, Resolved={stats.get('resolvedComplaints')}")
    assert_true(stats.get("totalComplaints", 0) > 0, "Total complaints counter > 0")

    # 10. AI Duplicate Detection Query
    log(10, f"Testing AI Duplicate Detection for Ticket #{complaint_id}...")
    dups_res = requests.get(f"{BASE_URL}/complaints/{complaint_id}/duplicates", headers=admin_headers, timeout=10)
    assert_true(dups_res.status_code == 200, "Duplicate detection query returned 200")
    print(f"Duplicate scan completed. Matches found: {len(dups_res.json())}")

    # 11. Admin Assigns Complaint to Staff Technician
    log(11, f"Admin assigning Ticket #{complaint_id} to staff technician...")
    # Fetch staff user ID
    users_res = requests.get(f"{BASE_URL}/admin/users", headers=admin_headers, timeout=5)
    staff_user = next((u for u in users_res.json() if u.get("role") == "STAFF"), None)
    assert_true(staff_user is not None, "Staff user exists in database")
    staff_id = staff_user["id"]
    print(f"Assigning to Staff ID: {staff_id} ({staff_user.get('fullName')})...")

    assign_payload = {
        "staffId": staff_id,
        "remarks": "Dispatched for urgent electrical safety inspection."
    }
    assign_res = requests.post(f"{BASE_URL}/complaints/{complaint_id}/assign", json=assign_payload, headers=admin_headers, timeout=5)
    assert_true(assign_res.status_code == 200, f"Assignment returned HTTP 200 (Got {assign_res.status_code})")
    assert_true(assign_res.json().get("status") == "ASSIGNED", "Ticket status transitioned to ASSIGNED")

    # 12. Staff Technician Login & Queue Inspection
    log(12, "Logging in as Staff Technician (staff@campuscare.edu)...")
    staff_login_res = requests.post(f"{BASE_URL}/auth/login", json={"email": "staff@campuscare.edu", "password": "Staff@123"}, timeout=5)
    assert_true(staff_login_res.status_code == 200, "Staff login successful with HTTP 200")
    staff_token = staff_login_res.json()["token"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    log(13, "Staff inspecting assigned queue...")
    staff_comp_res = requests.get(f"{BASE_URL}/staff/complaints", headers=staff_headers, timeout=5)
    assert_true(staff_comp_res.status_code == 200, "Staff complaints returned 200")
    staff_tickets = staff_comp_res.json()
    assert_true(any(c["id"] == complaint_id for c in staff_tickets), f"Ticket #{complaint_id} present in staff queue")

    # 14. Staff Accepts Ticket
    log(14, f"Staff accepting Ticket #{complaint_id}...")
    accept_res = requests.put(f"{BASE_URL}/staff/complaints/{complaint_id}/accept", headers=staff_headers, timeout=5)
    assert_true(accept_res.status_code == 200, "Accept complaint returned 200")

    # 15. Staff Starts Work (IN_PROGRESS)
    log(15, f"Staff transitioning Ticket #{complaint_id} to IN_PROGRESS...")
    start_payload = {
        "status": "IN_PROGRESS",
        "remarks": "On-site at Science Block B Room 401. Main breaker isolated; repairing charred busbar."
    }
    in_prog_res = requests.put(f"{BASE_URL}/staff/complaints/{complaint_id}/status", json=start_payload, headers=staff_headers, timeout=5)
    assert_true(in_prog_res.status_code == 200, "Status update to IN_PROGRESS returned 200")
    assert_true(in_prog_res.json().get("status") == "IN_PROGRESS", "Status is IN_PROGRESS")

    # 16. Staff Resolves Ticket (RESOLVED)
    log(16, f"Staff resolving Ticket #{complaint_id}...")
    resolve_payload = {
        "status": "RESOLVED",
        "remarks": "Replaced burnt breaker unit with 32A MCB, tested insulation resistance to 50M ohm. Verified safe."
    }
    resolve_res = requests.put(f"{BASE_URL}/staff/complaints/{complaint_id}/status", json=resolve_payload, headers=staff_headers, timeout=5)
    assert_true(resolve_res.status_code == 200, "Status update to RESOLVED returned 200")
    assert_true(resolve_res.json().get("status") == "RESOLVED", "Status is RESOLVED")

    # 17. Verify Audit History
    log(17, f"Verifying complete immutable audit history for Ticket #{complaint_id}...")
    hist_res = requests.get(f"{BASE_URL}/complaints/{complaint_id}/history", headers=student_headers, timeout=5)
    assert_true(hist_res.status_code == 200, "History returned 200")
    history = hist_res.json()
    print(f"Total History Transitions Recorded: {len(history)}")
    for h in history:
        print(f"  -> [{h.get('previousStatus')} -> {h.get('newStatus')}] By {h.get('updatedBy')}: {h.get('remarks')}")
    assert_true(len(history) >= 3, "At least 3 state transitions recorded in MySQL")

    # 18. Student Submits Feedback
    log(18, f"Student submitting 5-Star Feedback for Ticket #{complaint_id}...")
    feedback_payload = {
        "complaintId": complaint_id,
        "rating": 5,
        "comments": "Immediate response from electrical staff. Classroom power restored safely before next class."
    }
    fb_res = requests.post(f"{BASE_URL}/feedback", json=feedback_payload, headers=student_headers, timeout=5)
    assert_true(fb_res.status_code == 201, f"Feedback submitted with HTTP 201 (Got {fb_res.status_code})")
    
    log(19, "Verifying feedback persistence...")
    fb_get = requests.get(f"{BASE_URL}/feedback/complaint/{complaint_id}", headers=student_headers, timeout=5)
    assert_true(fb_get.status_code == 200, "Feedback query returned 200")
    assert_true(fb_get.json().get("rating") == 5, "Rating is 5 stars")

    # 20. Verify Public Tracking Endpoint
    log(20, f"Testing Public Tracking for Ticket #{complaint_id}...")
    public_res = requests.get(f"{BASE_URL}/public/tickets/{complaint_id}", timeout=5)
    assert_true(public_res.status_code == 200, "Public ticket tracking returned 200")
    assert_true(public_res.json().get("status") == "RESOLVED", "Public status reflects RESOLVED")

    print("\n" + "=" * 60)
    print("ALL 20 END-TO-END INTEGRATION WORKFLOW STEPS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
