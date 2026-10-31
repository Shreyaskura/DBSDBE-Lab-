# CampusCare: RESTful API Specification

---

## 1. Authentication & Security Architecture

All protected endpoints require a valid JSON Web Token (JWT) transmitted via the standard HTTP Authorization header:
```http
Authorization: Bearer <jwt_token>
```

Tokens are signed using HMAC-SHA256 and encapsulate the user's email, permissions, and role claim (`role: "STUDENT" | "STAFF" | "ADMIN"`).

---

## 2. API Endpoint Matrix

| Method | Endpoint | Description | Auth Required | Allowed Roles |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student account | None | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | None | Public |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes | All Roles |
| `GET` | `/api/public/health` | Subsystem telemetry & DB health | None | Public |
| `GET` | `/api/public/tickets/{id}`| Public ticket tracker summary | None | Public |
| `GET` | `/api/categories` | List standardized issue categories | None | Public |
| `GET` | `/api/departments` | List campus maintenance departments | None | Public |
| `POST` | `/api/complaints` | Submit maintenance ticket | Yes | STUDENT |
| `GET` | `/api/complaints/my` | List student's own tickets | Yes | STUDENT |
| `GET` | `/api/complaints/{id}` | Detailed ticket view with history | Yes | Owner / STAFF / ADMIN |
| `GET` | `/api/complaints` | Filter and query all campus tickets | Yes | STAFF / ADMIN |
| `PUT` | `/api/complaints/{id}/status`| Update ticket status & remarks | Yes | STAFF / ADMIN |
| `POST` | `/api/complaints/{id}/assign`| Dispatch ticket to technician | Yes | ADMIN |
| `GET` | `/api/complaints/{id}/history`| Retrieve chronological audit trail| Yes | Owner / STAFF / ADMIN |
| `GET` | `/api/staff/assigned` | List technician's active assignments| Yes | STAFF |
| `PUT` | `/api/staff/{id}/accept` | Technician accepts ticket | Yes | STAFF |
| `PUT` | `/api/staff/{id}/resolve`| Technician submits resolution | Yes | STAFF |
| `POST` | `/api/feedback` | Submit 1-5 star post-resolution rating| Yes | STUDENT |
| `GET` | `/api/feedback/complaint/{id}`| View rating for specific ticket | Yes | Owner / ADMIN |
| `GET` | `/api/admin/dashboard` | Aggregated executive KPIs | Yes | ADMIN |
| `GET` | `/api/admin/users` | List registered campus users | Yes | ADMIN |
| `POST` | `/api/admin/users/staff`| Provision new staff technician | Yes | ADMIN |
| `POST` | `/api/admin/departments`| Create new department | Yes | ADMIN |
| `POST` | `/api/admin/categories` | Create new issue category | Yes | ADMIN |
| `GET` | `/api/admin/duplicates` | AI-assisted duplicate detection | Yes | ADMIN |
| `GET` | `/api/notifications` | Fetch user alert notifications | Yes | All Roles |
| `PUT` | `/api/notifications/{id}/read`| Mark notification as read | Yes | All Roles |
| `POST` | `http://127.0.0.1:8000/ai/classify`| NLP category classification | No | Internal Microservice |
| `POST` | `http://127.0.0.1:8000/ai/predict-priority`| Urgency & SLA score prediction | No | Internal Microservice |
| `POST` | `http://127.0.0.1:8000/ai/detect-duplicates`| Cosine duplicate clustering | No | Internal Microservice |

---

## 3. Request & Response Payload Specifications

### 3.1 Authentication

#### `POST /api/auth/register`
Creates a student account. Restricts role escalation (cannot register as `ADMIN` or `STAFF`).
```json
// Request
{
  "fullName": "Maya Lin",
  "email": "maya@campuscare.edu",
  "password": "MayaSecurePassword@123",
  "studentId": "STU-2026-8910",
  "department": "Computer Science"
}

// Response: 201 Created
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXlhQGNhbXB1c2NhcmUuZWR1Iiwicm9sZSI6IlNUVURFTlQifQ...",
  "tokenType": "Bearer",
  "user": {
    "id": 14,
    "fullName": "Maya Lin",
    "email": "maya@campuscare.edu",
    "role": "STUDENT",
    "studentId": "STU-2026-8910",
    "departmentName": "Computer Science"
  }
}
```

#### `POST /api/auth/login`
```json
// Request
{
  "email": "admin@campuscare.edu",
  "password": "AdminPassword@123"
}

// Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "fullName": "Campus Administrator",
    "email": "admin@campuscare.edu",
    "role": "ADMIN"
  }
}
```

---

### 3.2 Complaint Operations

#### `POST /api/complaints`
Student submits a campus service request. The Spring Boot backend invokes the Python AI engine in the background to automatically predict priority and calculate institutional urgency.
```json
// Request
{
  "title": "Severe water leakage in 2nd floor restroom",
  "description": "Main supply pipe ruptured under wash basin, flooding corridor near Room 204.",
  "location": "Academic Block C, 2nd Floor West Wing",
  "category": "Plumbing",
  "imageUrl": "https://storage.campuscare.edu/uploads/pipe_leak_204.jpg"
}

// Response: 201 Created
{
  "id": 105,
  "title": "Severe water leakage in 2nd floor restroom",
  "description": "Main supply pipe ruptured under wash basin, flooding corridor near Room 204.",
  "location": "Academic Block C, 2nd Floor West Wing",
  "category": "Plumbing",
  "priority": "CRITICAL",
  "status": "SUBMITTED",
  "createdBy": {
    "id": 14,
    "fullName": "Maya Lin",
    "email": "maya@campuscare.edu",
    "role": "STUDENT"
  },
  "assignedDepartment": "Physical Plant & Facilities",
  "assignedStaff": null,
  "createdAt": "2026-10-31T09:15:00",
  "aiAnalysis": {
    "inferredCategory": "Plumbing",
    "priorityScore": 9.5,
    "reasoning": "Critical infrastructure flooding hazard detected. Immediate dispatch required."
  }
}
```

#### `PUT /api/complaints/{id}/status`
Transitions complaint state. Accessible to `STAFF` and `ADMIN`.
```json
// Request
{
  "status": "IN_PROGRESS",
  "remarks": "Technician on-site. Shut off main riser isolation valve; preparing replacement fitting."
}

// Response: 200 OK
{
  "id": 105,
  "status": "IN_PROGRESS",
  "updatedAt": "2026-10-31T09:40:00"
}
```

#### `POST /api/complaints/{id}/assign`
Administrator assigns complaint to a maintenance technician. Accessible only to `ADMIN`.
```json
// Request
{
  "staffId": 4,
  "departmentId": 2,
  "remarks": "Dispatched to senior plumbing technician Marcus Sterling for emergency containment."
}

// Response: 200 OK
{
  "id": 105,
  "status": "ASSIGNED",
  "assignedStaff": "Marcus Sterling",
  "assignedDepartment": "Physical Plant & Facilities"
}
```

---

### 3.3 Administrative Analytics & Duplicate Detection

#### `GET /api/admin/dashboard`
Returns executive facility metrics.
```json
// Response: 200 OK
{
  "totalComplaints": 128,
  "pendingComplaints": 34,
  "inProgressComplaints": 22,
  "resolvedComplaints": 72,
  "criticalComplaints": 6,
  "totalStaff": 18,
  "totalStudents": 1420,
  "averageResolutionHours": 4.8,
  "categoryDistribution": {
    "Electrical": 42,
    "Plumbing": 31,
    "Network & Wi-Fi": 28,
    "Classroom Equipment": 19,
    "Other": 8
  }
}
```

#### `GET /api/admin/duplicates`
Returns ticket clusters sharing high textual and spatial similarity.
```json
// Response: 200 OK
[
  {
    "masterComplaintId": 105,
    "location": "Academic Block C, 2nd Floor West Wing",
    "category": "Plumbing",
    "duplicateCount": 3,
    "duplicateTicketIds": [107, 109, 112],
    "similarityScores": [0.89, 0.76, 0.82]
  }
]
```

---

### 3.4 AI Microservice Endpoints (Port 8000)

#### `POST /ai/predict-priority`
```json
// Request
{
  "title": "Sparking wires near chemical storage",
  "description": "Exposed cable sparking intermittently next to flammable storage cabinet.",
  "category": "Electrical"
}

// Response: 200 OK
{
  "priority": "CRITICAL",
  "score": 9.8,
  "reasoning": "Urgent safety hazard: Electrical sparking hazard detected near chemical zone."
}
```
