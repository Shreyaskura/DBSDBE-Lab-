# CampusCare - Backend Service (Spring Boot)

## Architecture Overview
This module will house the core backend microservices for the CampusCare platform.

## Planned Technology Stack
- **Framework:** Java 17+ / Spring Boot 3.x
- **Persistence:** Spring Data JPA / Hibernate
- **Security:** Spring Security with JWT (Role-Based Access Control: Student, Faculty, Staff, Admin)
- **APIs:** RESTful endpoints with OpenAPI / Swagger documentation
- **Database Connectivity:** HikariCP connection pool to `campuscare_db` (MySQL 8+)

## Service Responsibilities
- User & Role Management
- Ticket & Service Request Lifecycle Management
- Facility & Resource Allocation
- Notification Dispatcher
- Integration Gateway with `ai-service`
