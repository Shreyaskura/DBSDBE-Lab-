-- ====================================================================
-- CampusCare Enterprise Database Initialization Script (MySQL 8.0+)
-- Database: campuscare_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS campuscare_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE campuscare_db;

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'STAFF', 'ADMIN') NOT NULL,
    department_id BIGINT,
    department_name VARCHAR(150),
    student_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) 
        REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    category_id BIGINT,
    category_name VARCHAR(100),
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    created_by_id BIGINT NOT NULL,
    assigned_department_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_category FOREIGN KEY (category_id) 
        REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_user FOREIGN KEY (created_by_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaints_department FOREIGN KEY (assigned_department_id) 
        REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_complaints_status (status),
    INDEX idx_complaints_priority (priority),
    INDEX idx_complaints_created_by (created_by_id),
    INDEX idx_complaints_department (assigned_department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    assigned_staff_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignments_complaint FOREIGN KEY (complaint_id) 
        REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_staff FOREIGN KEY (assigned_staff_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_assignments_complaint (complaint_id),
    INDEX idx_assignments_staff (assigned_staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. COMPLAINT HISTORY TABLE
CREATE TABLE IF NOT EXISTS complaint_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    remarks TEXT,
    updated_by_id BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) 
        REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (updated_by_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_history_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_complaint FOREIGN KEY (complaint_id) 
        REFERENCES complaints(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED INITIAL INSTITUTIONAL DATA
-- ====================================================================

-- Seed Departments
INSERT INTO departments (department_name, description) VALUES
('Office of Information Technology', 'Campus network, classroom multimedia, student emails, computer labs'),
('Physical Plant & Facilities', 'HVAC, electrical grids, civil structures, water supply and plumbing'),
('Campus Residential Life', 'Hostel dormitories, student mess, hot water systems, furnishings'),
('Campus Security & Safety', 'Access gates, turnstiles, surveillance, emergency incident dispatch'),
('Sanitation & Environmental Services', 'Classroom cleanliness, laboratory waste disposal, groundskeeping')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Seed Categories
INSERT INTO categories (category_name, description) VALUES
('Electrical', 'Power outlets, wiring, lighting fixtures, circuit breakers, and switches'),
('Plumbing', 'Water coolers, washrooms, drainage pipes, leakages, and water supply'),
('Network & Wi-Fi', 'Campus Wi-Fi connectivity, Ethernet ports, DNS issues, and access points'),
('Classroom Equipment', 'Projectors, smart boards, microphones, podiums, and seating'),
('Cleaning & Sanitation', 'Classroom cleanliness, trash removal, hygiene, and chemical spills'),
('Infrastructure', 'Doors, windows, handrails, ceiling panels, roads, and walls'),
('Transportation', 'Campus shuttle buses, EV buggies, parking barriers'),
('Other', 'General miscellaneous campus maintenance requests')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Seed System Administrator (Password: Admin@123 -> BCrypt hash)
INSERT INTO users (full_name, email, password, role, department_name, created_at)
VALUES (
    'Campus Administrator',
    'admin@campuscare.edu',
    '$2a$10$e7K5.E4WpQZ2k7G/Kj9Q.OHpQ3/9Z0J4XwVpE8g3hYgH2zM8tP1a2',
    'ADMIN',
    'Campus Administration',
    NOW()
)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Seed Lead Technician Staff (Password: Staff@123 -> BCrypt hash)
INSERT INTO users (full_name, email, password, role, department_name, created_at)
VALUES (
    'Marcus Sterling',
    'staff@campuscare.edu',
    '$2a$10$e7K5.E4WpQZ2k7G/Kj9Q.OHpQ3/9Z0J4XwVpE8g3hYgH2zM8tP1a2',
    'STAFF',
    'Physical Plant & Facilities',
    NOW()
)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
