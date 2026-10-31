# CampusCare: 5-Minute Hackathon Demonstration Script

**Title:** Autonomous Triage & Lifecycle Resolution with CampusCare  
**Target Duration:** Exactly 5 Minutes (300 Seconds)  
**Presenter Roles:** Student Requester, Campus Administrator, Staff Maintenance Technician

---

## Demonstration Timeline & Checklist

```
[0:00 - 0:30] Introduction & Value Proposition
[0:30 - 1:15] Student Login & AI-Powered Complaint Submission
[1:15 - 2:00] Admin Triage & Real-Time AI Duplicate Detection
[2:00 - 2:45] Technician Assignment & Dispatch Workflow
[2:45 - 3:45] Staff Technician Execution & Status Transition
[3:45 - 4:15] Student Verification & Feedback Rating
[4:15 - 5:00] Executive Analytics & Multi-Campus Scalability Wrap-up
```

---

## Step-by-Step Script & Actions

### 0:00 – 0:30 | Introduction & Problem Context
* **Screen State:** CampusCare Landing Page (`http://localhost:5173/`).
* **Speaker Script:**
  > "Distinguished evaluators and faculty, modern universities suffer from fragmented maintenance operations. A burst pipe or sparking electrical panel often sits in unread WhatsApp groups or physical logbooks for days. Today, we present **CampusCare**—an enterprise smart service management platform combining React 19, Spring Boot, MySQL 8, and Scikit-learn AI to automate incident triage, enforce accountability, and resolve campus issues in record time. Let's watch a real incident flow through the entire lifecycle."

---

### 0:30 – 1:15 | Student Login & Intelligent Complaint Intake
* **Screen State:** Login Page &rarr; Student Dashboard &rarr; New Complaint Modal.
* **Actions:**
  1. Click **Log In** and select or type student credentials (`maya@campuscare.edu` / `Maya@123`).
  2. Navigate to **Submit New Complaint**.
  3. Enter Title: `"Sparking electrical outlet and burning smell in Computer Lab 3"`.
  4. Enter Category: Select `"Electrical"`.
  5. Enter Location: `"Science Block A, Room 304"`.
  6. Enter Description: `"Outlet at workstation #12 is smoking and emitting sparks when plugging in lab PCs."`.
  7. Click **Submit Service Order**.
* **Highlight to Jury:**
  > "Notice what happens instantly upon submission. The Spring Boot backend dispatches the raw text to our Python FastAPI Scikit-learn inference engine. The model evaluates the urgency and immediately classifies this ticket as **CRITICAL Priority** with a 9.5 hazard rating, triggering an urgent 2-hour SLA timer."

---

### 1:15 – 2:00 | Admin Dashboard Triage & Duplicate Detection
* **Screen State:** Admin Dashboard (`http://localhost:5173/admin`).
* **Actions:**
  1. Open an incognito browser window or log in as Admin (`admin@campuscare.edu` / `Admin@123`).
  2. The Executive KPI dashboard automatically reflects the new ticket under **Critical Incidents**.
  3. Open the **Complaint Management** table; the Room 304 sparking outlet appears at the top highlighted with a red `CRITICAL` badge.
  4. Click the **AI Duplicate Detection** tab:
* **Speaker Script:**
  > "During campus crises, multiple students report the same problem. Our Scikit-learn TF-IDF engine runs cosine similarity calculations against open tickets in the same location. Instead of dispatching four different technicians to Science Block A, the admin can immediately see clustered duplicate reports and link them to the primary ticket."

---

### 2:00 – 2:45 | Admin Dispatches Technician
* **Screen State:** Admin Complaint Detail Modal.
* **Actions:**
  1. On Ticket #105, click **Assign Staff**.
  2. Select Technician: `"Marcus Sterling (Physical Plant & Facilities - Electrical)"`.
  3. Add Dispatch Note: `"Immediate safety hazard: Turn off sub-distribution board breaker before inspection."`.
  4. Click **Confirm Assignment**.
* **Highlight to Jury:**
  > "Under the hood, Spring Boot executes an ACID transaction: updating ticket status to `ASSIGNED`, recording an immutable entry into `complaint_history`, and dispatching an in-app alert notification to both technician Marcus Sterling and student Maya Lin."

---

### 2:45 – 3:45 | Staff Technician Accepts & Resolves Work Order
* **Screen State:** Staff Technician Dashboard (`http://localhost:5173/staff`).
* **Actions:**
  1. Switch to Staff technician account (`staff@campuscare.edu` / `Staff@123`).
  2. Under **My Assigned Tickets**, Marcus sees Ticket #105 at the top with its `CRITICAL` badge.
  3. Click **Accept & Start Work** &rarr; status updates to `IN_PROGRESS` with operational timestamp.
  4. Click **Add Field Remarks**: `"Isolated breaker 3A. Found loose neutral wire causing arcing. Replaced terminal block and tested voltage to 230V normal."`.
  5. Click **Mark Resolved**.
* **Speaker Script:**
  > "Technicians can only act on tickets assigned to their authorized roster. Every status transition demands verified remarks, ensuring that students and administration know exactly what maintenance action was executed on campus infrastructure."

---

### 3:45 – 4:15 | Student Verifies Resolution & Submits Feedback
* **Screen State:** Student Dashboard &rarr; Ticket History &rarr; Feedback Modal.
* **Actions:**
  1. Switch back to student Maya Lin's view.
  2. Notice the notification bell badge updates in real time: `"Your complaint #105 has been resolved."`.
  3. View the **Interactive Progress Stepper**: All 4 stages (Submitted &rarr; Assigned &rarr; In Progress &rarr; Resolved) are illuminated teal.
  4. Maya opens the **Feedback Modal**, rates the service **5 Stars**, and adds: `"Fast response! Lab was safe within 45 minutes."`.
  5. Click **Submit Feedback**.
* **Speaker Script:**
  > "The feedback loop is completed. The student provides verifiable rating data stored in MySQL, eliminating subjective guesswork regarding campus facility performance."

---

### 4:15 – 5:00 | Executive Analytics & Conclusion
* **Screen State:** Admin Analytics Tab (`http://localhost:5173/admin`).
* **Actions:**
  1. Display the dynamic category breakdown chart, department SLA averages, and resolution volume.
* **Speaker Script:**
  > "To conclude: CampusCare is not a mock concept. It is a fully functional, enterprise-grade platform running on Java Spring Boot, MySQL 8, and Python AI. It eliminates lost tickets, prevents duplicate dispatches, enforces institutional accountability, and transforms campus facility management into a modern, transparent service. Thank you, and we welcome your questions!"
