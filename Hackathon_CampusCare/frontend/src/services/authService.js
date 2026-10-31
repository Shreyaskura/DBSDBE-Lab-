import api from './api';

/**
 * Enterprise Authentication Service
 * Prepares the contract and data models for future Spring Boot 3.x + Spring Security JWT integration.
 * No mock data or fake database is used.
 */

export const ROLE_REDIRECT_MAP = {
  STUDENT: '/student/dashboard',
  STAFF: '/staff/dashboard',
  ADMIN: '/admin/dashboard',
};

/**
 * Returns the corresponding route for a given user role.
 * Normalizes input role strings to uppercase.
 */
export function getRoleDashboardPath(role) {
  if (!role) return '/student/dashboard';
  const normalized = role.toUpperCase();
  return ROLE_REDIRECT_MAP[normalized] || '/student/dashboard';
}

/**
 * Dispatches login request to the Spring Boot REST backend: POST /api/v1/auth/login
 * Payload: { email, password }
 * Expected Response: { token: string, user: { id, email, fullName, role, department } }
 */
export async function login(credentials) {
  const response = await api.post('/auth/login', {
    email: credentials.email.trim(),
    password: credentials.password,
  });
  return response.data;
}

/**
 * Dispatches student registration request: POST /api/v1/auth/register
 * Payload: { fullName, email, studentId, department, password, role: 'STUDENT' }
 * Expected Response: { message: string, userId: string, requiresVerification: boolean }
 */
export async function register(studentData) {
  const response = await api.post('/auth/register', {
    fullName: studentData.fullName.trim(),
    email: studentData.email.trim().toLowerCase(),
    studentId: studentData.studentId.trim(),
    department: studentData.department,
    password: studentData.password,
    role: 'STUDENT', // Public enrollment strictly restricted to Student role
  });
  return response.data;
}

/**
 * Persists JWT token and basic user identity upon valid Spring Boot authorization.
 */
export function saveAuthSession(token, user) {
  if (token) {
    localStorage.setItem('campuscare_auth_token', token);
  }
  if (user) {
    localStorage.setItem('campuscare_user', JSON.stringify(user));
  }
}

/**
 * Clears current session tokens.
 */
export function clearAuthSession() {
  localStorage.removeItem('campuscare_auth_token');
  localStorage.removeItem('campuscare_user');
}

/**
 * Retrieves persisted session user profile if available.
 */
export function getAuthSession() {
  const token = localStorage.getItem('campuscare_auth_token');
  const userJson = localStorage.getItem('campuscare_user');
  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch {
    user = null;
  }
  return { token, user };
}
