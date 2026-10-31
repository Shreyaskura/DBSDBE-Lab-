# CampusCare - Database Layer (MySQL 8+)

## Configuration
- **Database Engine:** MySQL 8.0+
- **Database Name:** `campuscare_db`
- **Default Port:** `3306`
- **Character Set:** `utf8mb4`
- **Collation:** `utf8mb4_unicode_ci`

## Planned Schema Entities
- `users`: ID, University ID, email, password_hash, full_name, role, department, phone, status, created_at
- `service_requests`: ID, tracking_number, title, description, category, priority, status, requester_id, assigned_technician_id, location, created_at, resolved_at
- `request_comments`: ID, request_id, author_id, comment_text, is_internal, created_at
- `departments`: ID, name, code, contact_email, head_user_id
- `ai_analyses`: ID, request_id, predicted_category, sentiment_score, urgency_score, confidence_score, analyzed_at
- `audit_logs`: ID, entity_name, entity_id, action, actor_id, timestamp, details
