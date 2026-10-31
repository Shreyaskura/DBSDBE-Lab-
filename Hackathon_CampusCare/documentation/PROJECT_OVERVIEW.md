# CampusCare: Project Overview

**AI-Powered Smart Campus Service Management System**

---

## 1. Problem Statement
Higher education campuses and university complexes house thousands of students, faculty, and administrative personnel across distributed physical infrastructure—including academic lecture halls, laboratories, residential hostels, dining facilities, and athletic grounds. 

Managing maintenance requests, facility malfunctions, equipment breakdowns, and safety incidents across such expansive environments requires rapid communication, intelligent triage, transparent tracking, and verifiable accountability. Traditional methods fail to meet these demands, resulting in neglected hazards, prolonged downtime, administrative opacity, and student dissatisfaction.

---

## 2. Existing Problem & Shortcomings of Legacy Approaches

Before CampusCare, campuses typically relied on fragmented, informal channels:

1. **Informal Messaging Silos (WhatsApp / Telegram Groups):**
   - Maintenance requests get lost in high-volume chat streams.
   - Zero structured data capture (no categories, standardized locations, or priority ratings).
   - No data privacy: Personal student mobile numbers and incident details are exposed to entire groups.
   - No role-based access control, search indexing, or status tracking.

2. **Physical Registers & Paper Slips:**
   - Require physical visits to hostel wardens or facility offices.
   - Susceptible to loss, water damage, and handwriting illegibility.
   - Absolutely no analytics, performance metrics, or resolution verification.

3. **Generic Helpdesks / Static Email Inboxes:**
   - Flooded with duplicate tickets during major campus incidents (e.g., 50 students reporting the same library Wi-Fi outage).
   - Human administrators must manually read, categorize, and forward emails to technicians.
   - Urgent safety hazards (e.g., electrical sparking or water line bursts) sit in queues behind routine inquiries.
   - Lack of verifiable service level agreement (SLA) enforcement and audit logging.

---

## 3. Proposed Solution: CampusCare

**CampusCare** is a production-grade, enterprise-ready service management ecosystem that unifies students, facility technicians, and campus administrators into a cohesive, secure, and intelligent workflow.

### Core Architecture Pillars:
- **Responsive Web Portal (React 19 + Tailwind CSS):** A clean, enterprise SaaS user interface with role-tailored dashboards for Students, Staff, and Administrators.
- **Enterprise Core Gateway (Java Spring Boot 3.3.5):** Robust REST API handling authentication (Spring Security + JWT), business logic, role-based access control (RBAC), and relational persistence.
- **Persistent Storage (MySQL 8):** Normalized relational schema enforcing referential integrity, status progression, assignment histories, and student feedback.
- **Microservice AI Engine (Python FastAPI + Scikit-learn):** Natural language processing (NLP) models providing automated category classification, urgency-driven priority prediction, and cosine-similarity duplicate ticket clustering.

---

## 4. Project Objectives

1. **Accelerate Incident Triage:** Reduce the time from student submission to technician dispatch from days to seconds using AI-driven category and priority inference.
2. **Prevent Ticket Congestion:** Identify duplicate incident reports in real time, linking concurrent reports to the master service ticket.
3. **Enforce Institutional Accountability:** Maintain an immutable audit log (`complaint_history`) of every status change, technician note, and timestamp.
4. **Ensure Safety Compliance:** Automatically flag infrastructure emergencies (electrical hazards, gas leaks, structural issues) as `CRITICAL` for priority dispatch.
5. **Protect Student Privacy & FERPA Principles:** Enforce strict data boundaries where students can only view their own records, while administrators maintain campus-wide visibility.
6. **Data-Driven Capital Allocation:** Equip university leadership with real-time analytics to identify chronic failure zones, technician workloads, and student satisfaction ratings.

---

## 5. Main Features by Persona

### A. Student Portal
- **Secure Self-Registration & Login:** Authenticated via BCrypt password hashing and signed JWT bearer tokens.
- **Intelligent Complaint Submission:** Simple form capturing title, description, category, campus location, and optional media upload.
- **Real-Time Priority Feedback:** Displays AI-computed urgency scores and institutional SLA estimates upon creation.
- **Interactive Ticket Tracking:** Live lookup by reference ID displaying four-stage workflow progress (Submitted &rarr; Assigned &rarr; In Progress &rarr; Resolved).
- **Complaint History & Timeline:** Chronological record of technician remarks and state transitions.
- **In-App Notifications:** Real-time alerts when tickets are assigned, started, or resolved.
- **Resolution Feedback & Rating:** Post-resolution 1-to-5 star ratings and quality remarks stored permanently.

### B. Staff / Technician Portal
- **Role-Based Task Management:** View tickets assigned specifically to the logged-in technician or their department.
- **One-Click Ticket Acceptance:** Transition tickets from `ASSIGNED` to `IN_PROGRESS` with operational remarks.
- **Work Logs & Remarks:** Add diagnostic updates and technician field notes.
- **Resolution Submission:** Transition tickets to `RESOLVED` with final closure summaries.
- **Assignment History:** Complete personal performance and dispatch history.

### C. Administrator & Facilities Management Portal
- **Executive KPI Dashboard:** Real-time metrics including total volume, active tickets, pending dispatches, resolution rates, and average resolution times.
- **Complaint Dispatch Center:** Review triage queue, filter by department or priority, and assign specific technicians.
- **Duplicate Ticket Detection:** AI-powered comparison identifying redundant reports for identical locations.
- **Department & Staff Provisioning:** Manage institutional units (Electrical, Plumbing, IT, Facilities) and technician rosters.
- **User Management:** Audit registered student and staff accounts.
- **Campus Analytics:** Distribution charts analyzing issue categories, departmental response times, and recurring facility bottlenecks.

---

## 6. Target Users

| Persona | Primary Needs | Key CampusCare Benefits |
|---|---|---|
| **Undergraduate & Postgraduate Students** | Fast reporting, status visibility, issue resolution | No paperwork, instant status tracking, transparent communication |
| **Maintenance Technicians & Staff** | Clear work orders, location details, prioritization | Direct dispatch, organized task queue, verified closure logging |
| **Department Heads & Wardens** | Team workload oversight, resource management | Automated routing, SLA tracking, staff performance visibility |
| **Campus Operations & Executive Leadership** | Infrastructure health, budget justification, risk mitigation | Actionable analytics, chronic failure detection, compliance reporting |

---

## 7. Institutional Innovation

1. **Dual-Tier AI Triage with Graceful Fallback:**
   - Machine learning inference runs in an independent Python FastAPI microservice using TF-IDF vectorization and Multinomial Naive Bayes.
   - If the AI microservice is temporarily unreachable, the Spring Boot core seamlessly triggers built-in institutional rule heuristics, guaranteeing 100% operational uptime.

2. **Automated Duplicate Detection (TF-IDF + Cosine Similarity):**
   - Eliminates redundant technician dispatches by scanning unresolved tickets in the same location and category, flagging matches exceeding a 0.35 similarity threshold.

3. **Zero-Trust Role-Based Security:**
   - End-to-end authorization enforced at both HTTP gateway and service layers. Students cannot tamper with tickets, view peer records, or perform staff operations.

4. **Institutional Quality Aesthetics:**
   - Built to genuine enterprise SaaS standards with deep navy navigation (`#0f1c34`), subtle teal accents (`#0d9488`), responsive layouts, and zero distracting animations.
