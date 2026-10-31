# CampusCare – Technical Documentation & Deployment Manual

**AI-Powered Smart Campus Service Management System**

---

## 1. Project Overview
CampusCare is an institutional-grade, full-stack service management ecosystem engineered for university campuses. It automates ticket intake, employs machine learning for automated category triage and urgency-based priority estimation, eliminates redundant service orders through spatial-categorical cosine duplicate detection, and enforces end-to-end accountability through immutable audit logging and student feedback loops.

---

## 2. Technology Stack

| Layer | Technologies | Primary Purpose |
|---|---|---|
| **Frontend Web Client** | React 19, Vite, Tailwind CSS, Lucide Icons | Responsive SPA, role-tailored dashboards |
| **Enterprise Backend Core** | Java 21, Spring Boot 3.3.5, Spring Security, Spring Data JPA | Secure REST gateway, JWT session management, RBAC, business transactions |
| **Relational Database** | MySQL 8.0, InnoDB Storage Engine | Persistent ACID storage, referential constraints, indexing |
| **AI / Machine Learning** | Python 3.14, FastAPI, Scikit-learn, TF-IDF, MultinomialNB | Real-time classification, priority scoring, duplicate clustering |
| **Build & Test Systems** | Maven 3.9, JUnit 5, Mockito, Python unittest, Vite | CI/CD build automation, comprehensive automated test suites |

---

## 3. Documentation Index

The `documentation/` folder contains comprehensive architectural and evaluation manuals:

1. **[`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md):** Problem statement, legacy shortcomings, proposed solution, core objectives, persona feature breakdown, and institutional innovation.
2. **[`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md):** Architectural tiering, inter-component communication, failure mode sequence diagrams, and Mermaid system architecture diagram.
3. **[`DATABASE_DESIGN.md`](./DATABASE_DESIGN.md):** Complete MySQL 8 relational schema, 8 tables, indexes, constraints, and Mermaid Entity-Relationship (ER) diagram.
4. **[`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md):** Complete REST API specifications, HTTP methods, headers, request/response payloads, and role authorization matrices.
5. **[`HACKATHON_DEMO.md`](./HACKATHON_DEMO.md):** 5-minute timed demonstration script covering student submission, AI inference, admin dispatch, staff execution, and feedback verification.
6. **[`FACULTY_QA.md`](./FACULTY_QA.md):** 20 in-depth answers to faculty evaluation questions covering security, algorithms, MySQL, Spring Boot, Python, and multi-campus scaling.

---

## 4. Prerequisites

Before starting the application, ensure the following runtimes are installed on your system:
- **Node.js:** v18.0.0 or higher (`node -v`) and npm (`npm -v`)
- **Java Development Kit (JDK):** JDK 21 or higher (`java -version`)
- **Apache Maven:** 3.8+ (`mvn -version` or use project wrapper `mvn.cmd`)
- **Python:** 3.10+ with `pip` (`python --version`)
- **MySQL Server:** MySQL 8.0 running locally on port 3306 (`mysql -u root -p`)

---

## 5. Step-by-Step Installation & Startup Guide

### Step 5.1: Database Configuration
1. Start your local MySQL service (e.g. `MySQL80` service on Windows or `systemctl start mysql` on Linux).
2. Execute the database initialization script to create `campuscare_db`, configure tables, and seed initial departments and categories:
```bash
mysql -u root -p < database/init.sql
```
*(Enter your MySQL root password when prompted).*

### Step 5.2: Python AI Microservice Startup (Port 8000)
1. Open a terminal in the `ai-service/` directory.
2. Install required dependencies:
```bash
cd ai-service
pip install -r requirements.txt
```
*(Dependencies: `fastapi`, `uvicorn`, `scikit-learn`, `pydantic`)*

3. Run automated tests to verify model integrity:
```bash
python -m unittest test_ai_service.py -v
```
4. Start the FastAPI server on port 8000:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Verify microservice health at `http://127.0.0.1:8000/health`.*

### Step 5.3: Java Spring Boot Backend Startup (Port 8080)
1. Open a terminal in the `backend/` directory.
2. Configure database credentials in `backend/src/main/resources/application.properties` or set environment variables:
```bash
# Windows PowerShell:
$env:DB_URL="jdbc:mysql://localhost:3306/campuscare_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="c2VjdXJlX2NhbXB1c2NhcmVfaW5zdGl0dXRpb25hbF9qd3Rfc2VjcmV0X2tleV8yMDI2X2FubW9k"
$env:AI_SERVICE_URL="http://127.0.0.1:8000"
```
3. Run the automated backend test suite:
```bash
mvn.cmd test
```
4. Launch the Spring Boot application:
```bash
mvn.cmd spring-boot:run
```
*The Spring Boot gateway is active on `http://localhost:8080/api`.*

### Step 5.4: React Frontend Startup (Port 5173)
1. Open a terminal in the `frontend/` directory.
2. Install client dependencies:
```bash
cd frontend
npm.cmd install
```
3. Run the production build validation:
```bash
npm.cmd run build
```
4. Start the Vite development server:
```bash
npm.cmd run dev
```
*Access the application in your browser at `http://localhost:5173/`.*

---

## 6. Default Demo Credentials

Pre-seeded institutional accounts for hackathon evaluation:

| Persona | Email | Demo Password | Default Console |
|---|---|---|---|
| **Campus Administrator** | `admin@campuscare.edu` | `Admin@123` | `/admin/dashboard` |
| **Maintenance Technician** | `staff@campuscare.edu` | `Staff@123` | `/staff/dashboard` |
| **Enrolled Student** | `maya@campuscare.edu` | `Maya@123` | `/student/dashboard` |

*New student accounts can also be created via the self-service registration portal at `/register`.*

---

## 7. Security Notice
- Passwords stored in MySQL are hashed with BCrypt and cannot be decrypted in reverse.
- Production deployments must supply custom values for `${DB_PASSWORD}` and `${JWT_SECRET}` through secure environment variables or vault secret managers.
