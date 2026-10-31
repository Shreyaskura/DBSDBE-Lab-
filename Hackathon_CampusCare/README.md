# CampusCare – AI-Powered Smart Campus Service Management System

An institutional enterprise software platform designed to streamline campus operations, automate service desk dispatching, track infrastructure maintenance, and prioritize incidents across university departments.

---

## 🏛️ Project Directory Structure

```text
CampusCare/
├── frontend/             # React 19 + Vite + Tailwind CSS client application
│   ├── public/           # Static web assets
│   ├── src/
│   │   ├── assets/       # Media, logos, and campus visual imagery
│   │   ├── components/   # Reusable UI component modules
│   │   ├── context/      # Global state contexts
│   │   ├── layouts/      # RootLayout & StudentLayout with responsive sidebar
│   │   ├── pages/        # Route pages (Landing, Login, Register, Dashboards, Complaints)
│   │   ├── services/     # Axios REST client with JWT Bearer interceptor
│   │   ├── App.jsx       # React Router hierarchy
│   │   ├── main.jsx      # React DOM bootstrap
│   │   └── index.css     # Enterprise design system tokens
│   ├── package.json      # Dependencies and execution scripts
│   └── vite.config.js    # Vite configuration
├── backend/              # Java Spring Boot 3.3.5 REST Backend
│   ├── src/main/java/com/campuscare/
│   │   ├── config/       # SecurityConfig, CorsConfig, DataInitializer
│   │   ├── controller/   # Auth, Complaints, Admin, Staff, Feedback, Notifications
│   │   ├── dto/          # Request & Response Data Transfer Objects
│   │   ├── entity/       # JPA Entities (User, Complaint, Department, Category, etc.)
│   │   ├── exception/    # Custom exceptions & GlobalExceptionHandler
│   │   ├── repository/   # Spring Data JPA interfaces
│   │   ├── security/     # JWT Provider, AuthFilter, UserPrincipal
│   │   └── service/      # Business logic services
│   ├── src/main/resources/
│   │   └── application.properties # Spring Boot environment config
│   └── pom.xml           # Maven build configuration
├── database/             # MySQL 8+ initialization and migration scripts
│   └── init.sql          # Complete DDL schemas, indexes, and seed records
├── ai-service/           # [Future Stage] Python FastAPI automated ticket triage
└── documentation/        # Enterprise architecture, API specs, and deployment guides
```

---

## 💾 Database Schema (MySQL 8 - `campuscare_db`)

The database utilizes MySQL 8+ with foreign key referential integrity, indexes, and unique constraints. Initialized via `database/init.sql`.

### Relational Tables:

1. **`users`**
   - `id` (BIGINT, PK, Auto-Increment)
   - `full_name` (VARCHAR(150), NOT NULL)
   - `email` (VARCHAR(150), UNIQUE, NOT NULL)
   - `password` (VARCHAR(255), NOT NULL, BCrypt Encrypted)
   - `role` (ENUM: `STUDENT`, `STAFF`, `ADMIN`, NOT NULL)
   - `department` (VARCHAR(150))
   - `created_at` (TIMESTAMP)

2. **`departments`**
   - `id` (BIGINT, PK, Auto-Increment)
   - `department_name` (VARCHAR(100), UNIQUE, NOT NULL)
   - `description` (TEXT)
   - `created_at` (TIMESTAMP)

3. **`categories`**
   - `id` (BIGINT, PK, Auto-Increment)
   - `category_name` (VARCHAR(100), UNIQUE, NOT NULL)
   - `description` (TEXT)

4. **`complaints`**
   - `id` (BIGINT, PK, Auto-Increment)
   - `title` (VARCHAR(200), NOT NULL)
   - `description` (TEXT, NOT NULL)
   - `location` (VARCHAR(255), NOT NULL)
   - `image_url` (VARCHAR(500))
   - `category_id` (BIGINT, FK -> `categories.id`)
   - `category_name` (VARCHAR(100))
   - `priority` (ENUM: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, NOT NULL)
   - `status` (ENUM: `SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, NOT NULL)
   - `created_by_id` (BIGINT, FK -> `users.id`, NOT NULL)
   - `assigned_department_id` (BIGINT, FK -> `departments.id`)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

5. **`assignments`**
   - `id` (BIGINT, PK, Auto-Increment)
   - `complaint_id` (BIGINT, FK -> `complaints.id`, NOT NULL)
   - `assigned_staff_id` (BIGINT, FK -> `users.id`, NOT NULL)
   - `assigned_at` (TIMESTAMP)

6. **`complaint_history`**
   - `id` (BIGINT, PK, Auto-Increment)
   - `complaint_id` (BIGINT, FK -> `complaints.id`, NOT NULL)
   - `previous_status` (VARCHAR(50), NOT NULL)
   - `new_status` (VARCHAR(50), NOT NULL)
   - `remarks` (TEXT)
   - `updated_by` (VARCHAR(150), NOT NULL)
   - `updated_at` (TIMESTAMP)

7. **`feedback`**
   - `id` (BIGINT, PK, Auto-Increment)
   - `complaint_id` (BIGINT, FK -> `complaints.id`, NOT NULL)
   - `user_id` (BIGINT, FK -> `users.id`, NOT NULL)
   - `rating` (INT, CHECK 1-5, NOT NULL)
   - `comments` (TEXT)
   - `created_at` (TIMESTAMP)

8. **`notifications`**
   - `id` (BIGINT, PK, Auto-Increment)
   - `user_id` (BIGINT, FK -> `users.id`, NOT NULL)
   - `complaint_id` (BIGINT, FK -> `complaints.id`)
   - `message` (TEXT, NOT NULL)
   - `is_read` (BOOLEAN, DEFAULT FALSE)
   - `created_at` (TIMESTAMP)

---

## 🌐 Complete REST API Endpoint Catalog

All protected endpoints require `Authorization: Bearer <JWT_TOKEN>`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register student accounts only (`STUDENT` role) |
| `POST` | `/api/auth/login` | Public | Authenticate user, return JWT and profile |

### Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/complaints` | `STUDENT`, `ADMIN` | File a new complaint with AI priority inference |
| `GET` | `/api/complaints/my` | `STUDENT` | Fetch authenticated student's complaints |
| `GET` | `/api/complaints/{id}` | Authenticated | Fetch specific complaint with ownership/role check |
| `GET` | `/api/complaints` | `ADMIN` | Master complaints register across campus |
| `PUT` | `/api/complaints/{id}/status` | `STAFF`, `ADMIN` | Update ticket status and append audit history |
| `POST` | `/api/complaints/{id}/assign` | `ADMIN` | Assign technician and department to ticket |
| `GET` | `/api/complaints/{id}/history` | Authenticated | Retrieve immutable lifecycle history audit log |
| `GET` | `/api/complaints/{id}/duplicates`| Authenticated | Scikit-learn AI duplicate correlation detection |

### Staff Console (`/api/staff`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/staff/complaints` | `STAFF` | Fetch work orders assigned to authenticated technician |
| `PUT` | `/api/staff/complaints/{id}/accept` | `STAFF` | Accept assigned ticket to designate lead technician |
| `PUT` | `/api/staff/complaints/{id}/status` | `STAFF` | Technician status update (`IN_PROGRESS`, `RESOLVED`) |

### Admin Console (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | `ADMIN` | Live database statistics (complaints, users, staff, SLA) |
| `GET` | `/api/admin/departments`| `ADMIN` | List all maintenance departments |
| `POST` | `/api/admin/departments`| `ADMIN` | Create new university maintenance department |
| `PUT` | `/api/admin/departments/{id}`| `ADMIN`| Update department name and scope |
| `GET` | `/api/admin/users` | `ADMIN` | List all registered user accounts & RBAC roles |
| `POST` | `/api/admin/users` | `ADMIN` | Register new staff technician with BCrypt hashing |
| `GET` | `/api/admin/analytics` | `ADMIN` | Category, Department, Status, Priority & Trends |

### Python AI Microservice (`http://127.0.0.1:8000`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Microservice status and NLP engine version |
| `POST` | `/ai/classify` | NLP category classification (MultinomialNB + TF-IDF) |
| `POST` | `/ai/predict-priority` | Priority recommendation with urgency score & explanation |
| `POST` | `/ai/detect-duplicates` | Cosine similarity correlation with existing MySQL complaints |

---

## 🔐 Default Institutional Credentials

| Role | Email | Password | Console Route |
|---|---|---|---|
| **System Admin** | `admin@campuscare.edu` | `Admin@123` | `/admin/dashboard` |
| **Staff Technician**| `staff@campuscare.edu` | `Staff@123` | `/staff/dashboard` |
| **Student (Demo)** | `maya@campuscare.edu` | `Maya@123` | `/student/dashboard` |

*New students can also register directly at `/register`.*

---

## 🚀 How to Run the Complete 3-Tier Enterprise Stack

### Prerequisites:
- Java JDK 21+ (`java -version`)
- Maven 3.8+ (`mvn -version`)
- Python 3.10+ with FastAPI, Uvicorn, and Scikit-learn
- MySQL 8+ Server active on port 3306 (`campuscare_db`)
- Node.js 18+ and npm (`npm -v`)

### 1. Database Initialization
```bash
mysql -u root -p campuscare_db < database/init.sql
```

### 2. Run Python FastAPI AI Microservice (Port 8000)
```bash
cd ai-service
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
*Health check at `http://127.0.0.1:8000/health`.*

### 3. Run Java Spring Boot Backend (Port 8080)
```bash
cd backend

# On Windows PowerShell:
$env:DB_URL="jdbc:mysql://localhost:3306/campuscare_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
$env:AI_SERVICE_URL="http://127.0.0.1:8000"

mvn.cmd package -DskipTests
java -jar target/campuscare-backend-1.0.0-SNAPSHOT.jar
```
*REST endpoints active on `http://localhost:8080/api`.*

### 4. Run React + Vite Frontend (Port 5173)
```bash
cd frontend
npm.cmd run dev
```
*Client application active on `http://localhost:5173/`.*

