import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import StudentLayout from './layouts/StudentLayout';
import LandingPage from './pages/LandingPage';
import ServicesDirectory from './pages/ServicesDirectory';
import TicketTracking from './pages/TicketTracking';
import SystemStatus from './pages/SystemStatus';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import RaiseComplaintPage from './pages/student/RaiseComplaintPage';
import MyComplaintsPage from './pages/student/MyComplaintsPage';
import ComplaintDetailsPage from './pages/student/ComplaintDetailsPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Institutional Portal Layout */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="services" element={<ServicesDirectory />} />
          <Route path="tracking" element={<TicketTracking />} />
          <Route path="status" element={<SystemStatus />} />
        </Route>

        {/* Staff Dedicated Enterprise Console */}
        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />

        {/* Admin Dedicated Enterprise Console */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Student Enterprise Portal Layout */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="complaints/new" element={<RaiseComplaintPage />} />
          <Route path="complaints" element={<MyComplaintsPage />} />
          <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="notifications" element={<StudentNotificationsPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
