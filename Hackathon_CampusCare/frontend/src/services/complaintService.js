import api from './api';

/**
 * Enterprise Complaint & Operations Service
 * Directly integrates with Java Spring Boot REST backend endpoints.
 * Permanent data persistence is provided by MySQL 8 (campuscare_db).
 */

// ==========================================
// STUDENT & GENERAL COMPLAINT APIs
// ==========================================

export async function createComplaint(complaintData) {
  const response = await api.post('/complaints', complaintData);
  return response.data;
}

export async function getMyComplaints() {
  const response = await api.get('/complaints/my');
  return response.data;
}

export async function getComplaintById(id) {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
}

export async function getAllComplaints(params = {}) {
  const response = await api.get('/complaints', { params });
  return response.data;
}

export async function getComplaintHistory(id) {
  const response = await api.get(`/complaints/${id}/history`);
  return response.data;
}

export async function updateComplaintStatus(id, statusData) {
  const response = await api.put(`/complaints/${id}/status`, statusData);
  return response.data;
}

export async function assignComplaint(id, assignData) {
  const response = await api.post(`/complaints/${id}/assign`, assignData);
  return response.data;
}

// ==========================================
// FEEDBACK & NOTIFICATION APIs
// ==========================================

export async function submitFeedback(feedbackData) {
  const response = await api.post('/feedback', feedbackData);
  return response.data;
}

export async function getNotifications() {
  const response = await api.get('/notifications');
  return response.data;
}

export async function markNotificationAsRead(id) {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
}

// ==========================================
// STAFF APIs
// ==========================================

export async function getStaffComplaints() {
  const response = await api.get('/staff/complaints');
  return response.data;
}

export async function acceptStaffComplaint(id) {
  const response = await api.put(`/staff/complaints/${id}/accept`);
  return response.data;
}

export async function updateStaffComplaintStatus(id, statusData) {
  const response = await api.put(`/staff/complaints/${id}/status`, statusData);
  return response.data;
}

// ==========================================
// AI & DUPLICATE DETECTION APIs
// ==========================================

export async function getComplaintDuplicates(id) {
  const response = await api.get(`/complaints/${id}/duplicates`);
  return response.data;
}

// ==========================================
// ADMIN APIs
// ==========================================

export async function getAdminDashboardStats() {
  const response = await api.get('/admin/dashboard');
  return response.data;
}

export async function getAdminDepartments() {
  const response = await api.get('/admin/departments');
  return response.data;
}

export async function createDepartment(deptData) {
  const response = await api.post('/admin/departments', deptData);
  return response.data;
}

export async function updateDepartment(id, deptData) {
  const response = await api.put(`/admin/departments/${id}`, deptData);
  return response.data;
}

export async function getAdminUsers() {
  const response = await api.get('/admin/users');
  return response.data;
}

export async function createStaffUser(userData) {
  const response = await api.post('/admin/users', userData);
  return response.data;
}

export async function updateUserRole(id, role) {
  const response = await api.put(`/admin/users/${id}/role`, null, { params: { role } });
  return response.data;
}

export async function getAdminAnalytics() {
  const response = await api.get('/admin/analytics');
  return response.data;
}

