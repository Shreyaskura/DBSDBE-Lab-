import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  Settings, 
  ArrowRight,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  UserPlus,
  Send,
  AlertCircle,
  Eye,
  LogOut,
  X,
  Layers,
  Search,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  Copy,
  Check,
  PlusCircle,
  Edit2,
  Trash2,
  Bell,
  Shield,
  HelpCircle,
  Activity,
  Zap,
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

import { 
  getAdminDashboardStats, 
  getAdminDepartments, 
  getAdminUsers, 
  getAllComplaints, 
  assignComplaint,
  getComplaintDuplicates,
  getComplaintHistory,
  createDepartment,
  updateDepartment,
  createStaffUser,
  getAdminAnalytics,
  getNotifications,
  markNotificationAsRead
} from '../../services/complaintService';
import { getAuthSession, clearAuthSession } from '../../services/authService';

const CHART_COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];
const STATUS_COLORS = {
  SUBMITTED: '#94a3b8',
  ASSIGNED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#10b981',
  REJECTED: '#ef4444'
};
const PRIORITY_COLORS = {
  LOW: '#64748b',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444'
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = getAuthSession();

  // Sidebar navigation tabs:
  // overview | complaints | assignments | departments | users | analytics | notifications | settings
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Assignment Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // AI Duplicate Detection Modal
  const [duplicateTicket, setDuplicateTicket] = useState(null);
  const [duplicatesList, setDuplicatesList] = useState([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);

  // View Details Modal
  const [detailsTicket, setDetailsTicket] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Department Modals (Create / Edit)
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ departmentName: '', description: '' });
  const [submittingDept, setSubmittingDept] = useState(false);

  // Create Staff User Modal
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    password: 'StaffPassword@123',
    department: 'Physical Plant & Facilities',
    role: 'STAFF'
  });
  const [submittingStaff, setSubmittingStaff] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const [statsData, analyticsData, complaintsData, deptsData, usersData, notifsData] = await Promise.all([
        getAdminDashboardStats(),
        getAdminAnalytics().catch(() => null),
        getAllComplaints(),
        getAdminDepartments(),
        getAdminUsers(),
        getNotifications().catch(() => [])
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setComplaints(complaintsData || []);
      setDepartments(deptsData || []);
      setUsers(usersData || []);
      setNotifications(notifsData || []);
    } catch (err) {
      setErrorNotice(
        err.response?.data?.message || 'Unable to connect to Admin REST services. Verify you are logged in with ADMIN credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  // Open Assignment Modal
  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    const staffMembers = users.filter(u => u.role === 'STAFF');
    setSelectedStaffId(staffMembers[0]?.id ? String(staffMembers[0].id) : '');
    setSelectedDeptId(departments[0]?.id ? String(departments[0].id) : '');
    setAssignRemarks(`Assigned for technician inspection and resolution.`);
  };

  // Submit Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedStaffId) return;

    setSubmittingAssign(true);
    setErrorNotice(null);
    try {
      await assignComplaint(selectedComplaint.id, {
        staffId: Number(selectedStaffId),
        departmentId: selectedDeptId ? Number(selectedDeptId) : null,
        remarks: assignRemarks.trim()
      });
      setActionSuccess(`Ticket #${selectedComplaint.id} dispatched to technician successfully.`);
      setSelectedComplaint(null);
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  // Open AI Duplicate Check Modal
  const handleOpenDuplicateCheck = async (complaint) => {
    setDuplicateTicket(complaint);
    setLoadingDuplicates(true);
    try {
      const dups = await getComplaintDuplicates(complaint.id);
      setDuplicatesList(dups || []);
    } catch {
      setDuplicatesList([]);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  // Open Details Modal
  const handleOpenDetails = async (complaint) => {
    setDetailsTicket(complaint);
    setLoadingHistory(true);
    try {
      const history = await getComplaintHistory(complaint.id);
      setTicketHistory(history || []);
    } catch {
      setTicketHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle Department Submit
  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!deptForm.departmentName) return;

    setSubmittingDept(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, deptForm);
        setActionSuccess(`Department "${deptForm.departmentName}" updated successfully.`);
      } else {
        await createDepartment(deptForm);
        setActionSuccess(`New department "${deptForm.departmentName}" created successfully.`);
      }
      setShowDeptModal(false);
      setEditingDept(null);
      setDeptForm({ departmentName: '', description: '' });
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSubmittingDept(false);
    }
  };

  // Handle Create Staff Submit
  const handleCreateStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.fullName || !staffForm.email || !staffForm.password) return;

    setSubmittingStaff(true);
    try {
      await createStaffUser(staffForm);
      setActionSuccess(`Staff technician account for "${staffForm.fullName}" registered successfully.`);
      setShowStaffModal(false);
      setStaffForm({
        fullName: '',
        email: '',
        password: 'StaffPassword@123',
        department: departments[0]?.departmentName || 'Physical Plant & Facilities',
        role: 'STAFF'
      });
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setSubmittingStaff(false);
    }
  };

  const staffUsers = users.filter(u => u.role === 'STAFF');
  const studentUsers = users.filter(u => u.role === 'STUDENT');

  // Filter complaints list
  const filteredComplaints = complaints.filter((item) => {
    if (activeTab === 'assignments' && item.status !== 'SUBMITTED') {
      // Assignments tab focuses on unassigned/submitted tickets
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(item.id).includes(q);
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      const matchReq = (item.createdBy?.fullName || '').toLowerCase().includes(q);
      const matchStaff = (item.assignedStaff?.fullName || '').toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchDesc && !matchLoc && !matchCat && !matchReq && !matchStaff) {
        return false;
      }
    }

    if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
    if (filterPriority !== 'ALL' && item.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;

    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"><span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>Critical</span>;
      case 'HIGH':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">High</span>;
      case 'MEDIUM':
        return <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            SUBMITTED
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            ASSIGNED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            RESOLVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const navItems = [
    { id: 'overview', name: 'Overview', icon: ShieldCheck },
    { id: 'complaints', name: 'All Complaints', icon: ClipboardList, count: complaints.length },
    { id: 'assignments', name: 'Assignments', icon: UserCheck, count: complaints.filter(c => c.status === 'SUBMITTED').length },
    { id: 'departments', name: 'Departments', icon: Building2, count: departments.length },
    { id: 'users', name: 'User Management', icon: Users, count: users.length },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'notifications', name: 'Notifications', icon: Bell, count: notifications.filter(n => !n.isRead).length },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  // Recharts Data Adaptors
  const categoryChartData = analytics?.byCategory || [];
  const departmentChartData = analytics?.byDepartment || [];
  const monthlyTrendsData = analytics?.monthlyTrends || [
    { month: 'Oct 2026', total: complaints.length, resolved: complaints.filter(c => c.status === 'RESOLVED').length }
  ];
  const statusChartData = analytics?.byStatus || [
    { name: 'SUBMITTED', value: stats?.pendingComplaints || 0 },
    { name: 'ASSIGNED', value: complaints.filter(c => c.status === 'ASSIGNED').length },
    { name: 'IN_PROGRESS', value: stats?.inProgressComplaints || 0 },
    { name: 'RESOLVED', value: stats?.resolvedComplaints || 0 }
  ];
  const priorityChartData = analytics?.byPriority || [
    { name: 'LOW', count: complaints.filter(c => c.priority === 'LOW').length },
    { name: 'MEDIUM', count: complaints.filter(c => c.priority === 'MEDIUM').length },
    { name: 'HIGH', count: complaints.filter(c => c.priority === 'HIGH').length },
    { name: 'CRITICAL', count: complaints.filter(c => c.priority === 'CRITICAL').length }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800 font-sans">
      
      {/* ======================================================== */}
      {/* 1. DEEP NAVY ADMIN SIDEBAR                               */}
      {/* ======================================================== */}
      <aside className="w-full lg:w-64 bg-[#0f1c34] text-slate-200 flex flex-col shrink-0 border-r border-slate-800">
        
        {/* Branding */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">CampusCare</span>
              <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase font-semibold">
                University Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Admin Card */}
        <div className="p-4 mx-3 my-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/40">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Campus Administrator'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@campuscare.edu'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System Administration
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-teal-400 border border-slate-700'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN ADMIN WORKSPACE AREA                             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div>
            <h1 className="text-lg font-bold text-[#0f1c34]">
              {activeTab === 'overview' && 'Executive System Dashboard'}
              {activeTab === 'complaints' && 'Institutional Complaints Management'}
              {activeTab === 'assignments' && 'Technician Dispatch & Assignments'}
              {activeTab === 'departments' && 'University Departments Management'}
              {activeTab === 'users' && 'Enterprise User Directory & RBAC'}
              {activeTab === 'analytics' && 'Operational Analytics & Service Intelligence'}
              {activeTab === 'notifications' && 'System Notifications Log'}
              {activeTab === 'settings' && 'Platform Settings & Environment Configuration'}
            </h1>
            <p className="text-xs text-slate-500">
              Live Spring Boot REST API &bull; MySQL 8 (`campuscare_db`) &bull; Python FastAPI Scikit-Learn Engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAdminData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Alerts */}
          {actionSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
              <button type="button" onClick={() => setActionSuccess(null)} className="text-emerald-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {errorNotice && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorNotice}</span>
              </div>
              <button type="button" onClick={loadAdminData} className="text-rose-700 font-semibold underline text-xs">
                Retry
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5 DASHBOARD STATS CARDS                                  */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* 1. Total Complaints */}
            <div 
              onClick={() => setActiveTab('complaints')}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>Total Complaints</span>
                <ClipboardList className="w-4 h-4 text-teal-600" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-[#0f1c34]">{stats?.totalComplaints ?? '--'}</div>
              <p className="mt-1 text-[10px] text-slate-500">All registered service tickets</p>
            </div>

            {/* 2. Pending Complaints */}
            <div 
              onClick={() => setActiveTab('assignments')}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>Pending Action</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-amber-700">{stats?.pendingComplaints ?? '--'}</div>
              <p className="mt-1 text-[10px] text-slate-500">Awaiting technician assignment</p>
            </div>

            {/* 3. In Progress */}
            <div 
              onClick={() => setActiveTab('complaints')}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>In Progress</span>
                <Wrench className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-blue-700">{stats?.inProgressComplaints ?? '--'}</div>
              <p className="mt-1 text-[10px] text-slate-500">Technicians active on-site</p>
            </div>

            {/* 4. Resolved Complaints */}
            <div 
              onClick={() => setActiveTab('complaints')}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-emerald-700">{stats?.resolvedComplaints ?? '--'}</div>
              <p className="mt-1 text-[10px] text-slate-500">Closed &amp; verified orders</p>
            </div>

            {/* 5. Average Resolution Time */}
            <div 
              onClick={() => setActiveTab('analytics')}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>Avg Resolution Time</span>
                <Zap className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-indigo-700">{stats?.averageResolutionTime || '0.5 hrs'}</div>
              <p className="mt-1 text-[10px] text-slate-500">Live SLA performance cycle</p>
            </div>

          </div>

          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW & LIVE MASTER QUEUE                      */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Quick Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Registered Students</span>
                    <div className="text-xl font-bold text-[#0f1c34] mt-1">{stats?.totalStudents || studentUsers.length} Users</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Enrolled requesters</p>
                  </div>
                  <div className="p-3 bg-teal-50 text-teal-700 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Staff Technicians</span>
                    <div className="text-xl font-bold text-[#0f1c34] mt-1">{stats?.totalStaff || staffUsers.length} Specialists</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Active field responders</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Active Departments</span>
                    <div className="text-xl font-bold text-[#0f1c34] mt-1">{stats?.totalDepartments || departments.length} Divisions</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Campus maintenance units</p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Recent Complaints Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#0f1c34]">Recent University Complaints</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Latest service orders requiring administrative triage and dispatch.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('complaints')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                  >
                    View All {complaints.length} Tickets &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="px-5 py-3.5">ID</th>
                        <th className="px-5 py-3.5">Title</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Requester</th>
                        <th className="px-5 py-3.5">Priority</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Assigned Staff</th>
                        <th className="px-5 py-3.5 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {complaints.slice(0, 6).map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-teal-800 whitespace-nowrap">#{ticket.id}</td>
                          <td className="px-5 py-4 font-semibold text-slate-900 max-w-xs truncate">{ticket.title}</td>
                          <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{ticket.category}</td>
                          <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{ticket.createdBy?.fullName || 'Student'}</td>
                          <td className="px-5 py-4 whitespace-nowrap">{getPriorityBadge(ticket.priority)}</td>
                          <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(ticket.status)}</td>
                          <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                            {ticket.assignedStaff ? (
                              <span className="font-medium text-slate-900 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                                {ticket.assignedStaff}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openAssignModal(ticket)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors"
                              >
                                Dispatch
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDuplicateCheck(ticket)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
                                title="Run Scikit-learn AI duplicate correlation check"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                AI Match
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2 & 3: COMPLAINTS & ASSIGNMENTS                      */}
          {/* ======================================================== */}
          {(activeTab === 'complaints' || activeTab === 'assignments') && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#0f1c34]">
                    {activeTab === 'assignments' ? 'Technician Dispatch Queue (Unassigned Tickets)' : 'University Master Complaints Directory'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Filter across categories, inspect AI duplicate alerts, and dispatch department staff.
                  </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, ID, room, staff..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 w-48 sm:w-56"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Network & Wi-Fi">Network &amp; Wi-Fi</option>
                    <option value="Classroom Equipment">Classroom Equipment</option>
                    <option value="Cleaning & Sanitation">Cleaning &amp; Sanitation</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Other">Other</option>
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>

                  {activeTab === 'complaints' && (
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  )}
                </div>
              </div>

              {filteredComplaints.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="px-5 py-3.5">ID</th>
                        <th className="px-5 py-3.5">Title &amp; Category</th>
                        <th className="px-5 py-3.5">Requester</th>
                        <th className="px-5 py-3.5">Location</th>
                        <th className="px-5 py-3.5">Priority</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Assigned Staff</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {filteredComplaints.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-teal-800 whitespace-nowrap">
                            #{item.id}
                          </td>

                          <td className="px-5 py-4 max-w-xs">
                            <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-500">{item.category}</p>
                          </td>

                          <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                            <p className="font-medium">{item.createdBy?.fullName || 'Student'}</p>
                            <p className="text-[10px] text-slate-400">{item.createdBy?.email}</p>
                          </td>

                          <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                            {item.location}
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            {getPriorityBadge(item.priority)}
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                          </td>

                          <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                            {item.assignedStaff ? (
                              <span className="font-medium text-slate-900 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                                {item.assignedStaff}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              
                              {/* Assign / Reassign Button */}
                              <button
                                type="button"
                                onClick={() => openAssignModal(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors"
                              >
                                <UserPlus className="w-3 h-3" />
                                {item.assignedStaff ? 'Reassign' : 'Assign'}
                              </button>

                              {/* AI Duplicate Detection Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenDuplicateCheck(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
                                title="Check for duplicate or correlated campus complaints"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                AI Dups
                              </button>

                              {/* Details Modal */}
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center space-y-3">
                  <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No Complaints Match Your Criteria</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing or adjusting search filters.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: DEPARTMENTS MANAGEMENT                            */}
          {/* ======================================================== */}
          {activeTab === 'departments' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0f1c34]">University Service Departments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Operational divisions mapped to technician dispatch queues and stored in MySQL `departments` table.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDept(null);
                    setDeptForm({ departmentName: '', description: '' });
                    setShowDeptModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-2xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Department
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <div key={dept.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#0f1c34]">{dept.departmentName}</h3>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            ID #{dept.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{dept.description || 'No division description provided.'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDept(dept);
                          setDeptForm({ departmentName: dept.departmentName, description: dept.description || '' });
                          setShowDeptModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: USER MANAGEMENT & RBAC                            */}
          {/* ======================================================== */}
          {activeTab === 'users' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0f1c34]">Enterprise User Directory &amp; RBAC</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    BCrypt-hashed user credentials managed with role-based access control (Student, Staff, Admin).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStaffModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-2xs"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Staff Account
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="px-5 py-3.5">User</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Department</th>
                      <th className="px-5 py-3.5">Identifier</th>
                      <th className="px-5 py-3.5">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-900 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0f1c34] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                          <span>{u.fullName}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            u.role === 'STAFF' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{u.department || 'General University'}</td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-500">{u.studentId || `STAFF-${u.id}`}</td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : 'Seeded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: ANALYTICS TAB (5 RECHARTS CHARTS)                 */}
          {/* ======================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#0f1c34] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    Enterprise Operational Analytics &amp; Service Intelligence
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time telemetry aggregated from MySQL 8 persistence store and FastAPI classifier metrics.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded">
                    Avg Resolution: <strong>{stats?.averageResolutionTime || '0.5 hrs'}</strong>
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                    Total Records: <strong>{complaints.length}</strong>
                  </span>
                </div>
              </div>

              {/* Chart Grid: 5 Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Complaints by Category */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#0f1c34]">1. Complaints by Category</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Bar Distribution</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Complaints by Department */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#0f1c34]">2. Complaints by Department</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Division Workload</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Monthly Complaint Trends */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#0f1c34]">3. Monthly Complaint Trends</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Velocity Over Time</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Area type="monotone" dataKey="total" stroke="#0f1c34" fill="#cbd5e1" name="Received Tickets" />
                        <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#a7f3d0" name="Resolved Tickets" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. Complaint Status Distribution */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#0f1c34]">4. Complaint Status Distribution</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Donut Ratio</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Pie
                          data={statusChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Priority Distribution */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#0f1c34]">5. Priority Distribution</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Severity Triage Levels</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {priorityChartData.map((entry, index) => (
                            <Cell key={`cell-pri-${index}`} fill={PRIORITY_COLORS[entry.name] || '#0d9488'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: NOTIFICATIONS LOG                                 */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0f1c34]">System-Wide Operational Notifications</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Automated ticket dispatch and audit log events.</p>
                </div>
                <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {notifications.length} Total Logs
                </span>
              </div>

              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-teal-50 text-teal-800">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-GB') : 'Recorded'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-500">
                  No notifications recorded.
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: SETTINGS TAB                                      */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 max-w-3xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0f1c34]">Platform Architecture &amp; System Configuration</h2>
                <p className="text-xs text-slate-500 mt-0.5">Underlying enterprise infrastructure settings for CampusCare.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-800">Java Spring Boot 3.3.5 Backend</h3>
                  <p className="text-slate-600">Runtime Port: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">8080</code></p>
                  <p className="text-slate-600">Security: Spring Security 6 with Stateless JWT Authentication &amp; BCrypt Password Hashing</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-800">MySQL 8 Database Persistence</h3>
                  <p className="text-slate-600">Database Name: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">campuscare_db</code></p>
                  <p className="text-slate-600">Tables: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">users, complaints, departments, categories, assignments, complaint_history, notifications, feedback</code></p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-800">Python FastAPI AI Microservice</h3>
                  <p className="text-slate-600">Microservice Port: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">8000</code></p>
                  <p className="text-slate-600">ML Engine: Scikit-learn TF-IDF Vectorizer + Multinomial Naive Bayes + Cosine Similarity Duplicate Matcher</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ======================================================== */}
      {/* 3. ASSIGNMENT MODAL                                      */}
      {/* ======================================================== */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0f1c34]">
                Dispatch Technician for Ticket #{selectedComplaint.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
              <p className="font-semibold text-slate-800">{selectedComplaint.title}</p>
              <p className="text-[11px] text-slate-500">{selectedComplaint.category} &bull; {selectedComplaint.location}</p>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsible Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designated Staff Technician
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                >
                  <option value="" disabled>Select Technician</option>
                  {staffUsers.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.fullName} ({tech.department || 'Maintenance'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignment Remarks / Dispatch Instructions
                </label>
                <textarea
                  rows={3}
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  placeholder="Dispatch instructions for the technician..."
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign || !selectedStaffId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
                >
                  {submittingAssign ? 'Assigning...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. AI DUPLICATE DETECTION MODAL                          */}
      {/* ======================================================== */}
      {duplicateTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f1c34]">
                    AI Duplicate Correlation Analysis
                  </h3>
                  <p className="text-[11px] text-slate-500">Checking Ticket #{duplicateTicket.id} against all database tickets</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDuplicateTicket(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Candidate Ticket Info */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold uppercase text-[10px] block">Analyzing Candidate</span>
              <p className="font-semibold text-slate-900 mt-0.5">{duplicateTicket.title}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">{duplicateTicket.category} &bull; {duplicateTicket.location}</p>
            </div>

            {/* Results */}
            {loadingDuplicates ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-600 mx-auto" />
                <p>Computing TF-IDF cosine similarity via Python AI microservice...</p>
              </div>
            ) : duplicatesList.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{duplicatesList.length} potential duplicate/correlated complaint(s)</strong> detected!
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {duplicatesList.map((dup, i) => (
                    <div key={i} className="py-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Matched Ticket #{dup.id}: {dup.title}
                        </span>
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-200">
                          {dup.confidencePercentage} Match
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{dup.reason}</p>
                      <p className="text-[10px] text-slate-400">{dup.category} &bull; {dup.location} &bull; Status: {dup.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-2 text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-700">No Duplicate Tickets Found</p>
                <p className="text-slate-400">
                  Cosine similarity score with existing tickets is below duplicate threshold. This complaint appears unique.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDuplicateTicket(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. VIEW COMPLAINT DETAILS & AUDIT TRAIL MODAL            */}
      {/* ======================================================== */}
      {detailsTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded border border-teal-200">
                  Ticket #{detailsTicket.id}
                </span>
                <h3 className="text-sm font-bold text-[#0f1c34] truncate max-w-md">
                  {detailsTicket.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsTicket(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block uppercase text-[10px]">Description</span>
                <p className="text-slate-800 mt-0.5 leading-relaxed">{detailsTicket.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-500 font-semibold block uppercase text-[10px]">Location</span>
                  <span className="text-slate-800 font-medium">{detailsTicket.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block uppercase text-[10px]">Category</span>
                  <span className="text-slate-800 font-medium">{detailsTicket.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block uppercase text-[10px]">Assigned Staff</span>
                  <span className="text-slate-800 font-medium">{detailsTicket.assignedStaff || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Service Audit Trail
              </h4>

              {loadingHistory ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-600 mx-auto mb-1.5" />
                  Loading history...
                </div>
              ) : ticketHistory.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-1">
                  {ticketHistory.map((h, idx) => (
                    <div key={idx} className="relative pl-5">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-teal-600 border-2 border-white ring-1 ring-teal-500"></div>
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {h.previousStatus} &rarr; {h.newStatus}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {h.updatedAt ? new Date(h.updatedAt).toLocaleString('en-GB') : 'Recorded'}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{h.remarks || 'Status update recorded.'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">By: {h.updatedBy?.fullName || 'Dispatcher'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No historical status transitions recorded yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailsTicket(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. CREATE / EDIT DEPARTMENT MODAL                        */}
      {/* ======================================================== */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0f1c34]">
                {editingDept ? `Edit Department #${editingDept.id}` : 'Create University Department'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.departmentName}
                  onChange={(e) => setDeptForm({ ...deptForm, departmentName: e.target.value })}
                  placeholder="e.g. Energy Management & HVAC"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Operational Scope
                </label>
                <textarea
                  rows={3}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Division operational remit, buildings handled, SLA targets..."
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDept || !deptForm.departmentName}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
                >
                  {submittingDept ? 'Saving...' : (editingDept ? 'Update Department' : 'Create Department')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. CREATE STAFF USER MODAL                               */}
      {/* ======================================================== */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0f1c34]">
                Register Staff Technician Account
              </h3>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaffSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technician Full Name
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.fullName}
                  onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                  placeholder="e.g. David Vance"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  University Staff Email
                </label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="d.vance@campuscare.edu"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Password (BCrypt Encrypted)
                </label>
                <input
                  type="password"
                  required
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Department Division
                </label>
                <select
                  value={staffForm.department}
                  onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.departmentName}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStaff || !staffForm.fullName || !staffForm.email}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
                >
                  {submittingStaff ? 'Registering...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
