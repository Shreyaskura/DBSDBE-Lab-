import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Briefcase, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ClipboardList,
  RefreshCw,
  Clock,
  Play,
  Check,
  AlertCircle,
  MapPin,
  Calendar,
  LogOut,
  X,
  Search,
  Filter,
  Eye,
  Bell,
  User,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Layers,
  Inbox,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getStaffComplaints, 
  updateStaffComplaintStatus, 
  acceptStaffComplaint,
  getComplaintHistory,
  getNotifications,
  markNotificationAsRead
} from '../../services/complaintService';
import { getAuthSession, clearAuthSession } from '../../services/authService';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = getAuthSession();

  const [activeTab, setActiveTab] = useState('overview'); // overview | assigned | in_progress | resolved | notifications | profile
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Status & Remark Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Ticket Detail & History Modal State
  const [detailsTicket, setDetailsTicket] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchStaffData = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const [complaintsData, notifsData] = await Promise.all([
        getStaffComplaints(),
        getNotifications().catch(() => [])
      ]);
      setComplaints(complaintsData || []);
      setNotifications(notifsData || []);
    } catch (err) {
      setErrorNotice(
        err.response?.data?.message || 'Unable to fetch staff assignments. Ensure you are authenticated with STAFF role.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  // Open status modal
  const openStatusModal = (ticket, nextStatus) => {
    setSelectedTicket(ticket);
    setTargetStatus(nextStatus);
    setRemarks(
      nextStatus === 'IN_PROGRESS' 
        ? 'Technician arrived on-site. Inspection & service underway.' 
        : nextStatus === 'RESOLVED'
        ? 'Maintenance and repairs successfully executed and tested.'
        : 'Status updated by technician.'
    );
  };

  // Submit status update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !targetStatus) return;

    setSubmittingStatus(true);
    setErrorNotice(null);
    try {
      await updateStaffComplaintStatus(selectedTicket.id, {
        status: targetStatus,
        remarks: remarks.trim()
      });
      setActionSuccess(`Ticket #${selectedTicket.id} status successfully transitioned to ${targetStatus}.`);
      setSelectedTicket(null);
      await fetchStaffData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to update ticket status.');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Accept Ticket
  const handleAcceptTicket = async (ticketId) => {
    setErrorNotice(null);
    try {
      await acceptStaffComplaint(ticketId);
      setActionSuccess(`Ticket #${ticketId} accepted. You are now designated lead technician on this ticket.`);
      await fetchStaffData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to accept ticket.');
    }
  };

  // Open Details Modal and fetch live chronological history
  const handleOpenDetails = async (ticket) => {
    setDetailsTicket(ticket);
    setLoadingHistory(true);
    try {
      const history = await getComplaintHistory(ticket.id);
      setTicketHistory(history || []);
    } catch {
      setTicketHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Metrics computed live from MySQL staff complaints
  const totalAssigned = complaints.length;
  const pendingAcceptance = complaints.filter(c => c.status === 'ASSIGNED').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

  // Filter complaints list based on active tab, search, priority, status
  const filteredComplaints = complaints.filter((item) => {
    // Tab level filtering
    if (activeTab === 'assigned' && item.status !== 'ASSIGNED') return false;
    if (activeTab === 'in_progress' && item.status !== 'IN_PROGRESS') return false;
    if (activeTab === 'resolved' && item.status !== 'RESOLVED') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(item.id).includes(q);
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      const matchReq = (item.createdBy?.fullName || '').toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchDesc && !matchLoc && !matchCat && !matchReq) {
        return false;
      }
    }

    // Priority filter
    if (filterPriority !== 'ALL' && item.priority !== filterPriority) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'ALL' && item.status !== filterStatus) {
      return false;
    }

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
    { id: 'overview', name: 'Overview', icon: ClipboardList, count: totalAssigned },
    { id: 'assigned', name: 'Assigned Complaints', icon: Briefcase, count: pendingAcceptance },
    { id: 'in_progress', name: 'In Progress', icon: Clock, count: inProgress },
    { id: 'resolved', name: 'Resolved Complaints', icon: CheckCircle2, count: resolved },
    { id: 'notifications', name: 'Notifications', icon: Bell, count: notifications.filter(n => !n.isRead).length },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800 font-sans">
      
      {/* ======================================================== */}
      {/* 1. DEEP NAVY STAFF SIDEBAR                              */}
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
                Staff Service Console
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-teal-500/40">
            {user?.fullName?.charAt(0) || 'M'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Marcus Sterling'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.department || 'Physical Plant & Facilities'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Field Operations
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

        {/* Logout Bottom */}
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
      {/* 2. MAIN WORKSPACE AREA                                  */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div>
            <h1 className="text-lg font-bold text-[#0f1c34]">
              {activeTab === 'overview' && 'Technician Operations Overview'}
              {activeTab === 'assigned' && 'Assigned Work Orders'}
              {activeTab === 'in_progress' && 'In Progress Maintenance'}
              {activeTab === 'resolved' && 'Resolved Service Orders'}
              {activeTab === 'notifications' && 'Operational Notifications'}
              {activeTab === 'profile' && 'Technician Profile'}
            </h1>
            <p className="text-xs text-slate-500">
              Department: <strong className="text-slate-700">{user?.department || 'Physical Plant & Facilities'}</strong> &bull; Authenticated via Spring Security JWT &bull; MySQL 8
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchStaffData}
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
              <button type="button" onClick={fetchStaffData} className="text-rose-700 font-semibold underline text-xs">
                Retry
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4 DASHBOARD STATS CARDS                                  */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Total Assigned */}
            <div 
              onClick={() => setActiveTab('overview')}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Total Assigned</span>
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-[#0f1c34]">{totalAssigned}</div>
              <p className="mt-1 text-xs text-slate-500">Lifetime work orders assigned to you</p>
            </div>

            {/* 2. Pending Acceptance */}
            <div 
              onClick={() => setActiveTab('assigned')}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Pending Acceptance</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <ClipboardList className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-blue-700">{pendingAcceptance}</div>
              <p className="mt-1 text-xs text-slate-500">Tickets awaiting technician acceptance</p>
            </div>

            {/* 3. In Progress */}
            <div 
              onClick={() => setActiveTab('in_progress')}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>In Progress</span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-amber-700">{inProgress}</div>
              <p className="mt-1 text-xs text-slate-500">Currently active on-site service orders</p>
            </div>

            {/* 4. Resolved */}
            <div 
              onClick={() => setActiveTab('resolved')}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Resolved</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-emerald-700">{resolved}</div>
              <p className="mt-1 text-xs text-slate-500">Repairs completed and validated</p>
            </div>

          </div>

          {/* ======================================================== */}
          {/* TAB CONTENT 1: COMPLAINTS TABLE (Overview / Assigned / etc)*/}
          {/* ======================================================== */}
          {['overview', 'assigned', 'in_progress', 'resolved'].includes(activeTab) && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              
              {/* Header and Controls */}
              <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#0f1c34]">
                    {activeTab === 'overview' && 'All Assigned Service Orders'}
                    {activeTab === 'assigned' && 'Complaints Awaiting Acceptance'}
                    {activeTab === 'in_progress' && 'Complaints In Progress'}
                    {activeTab === 'resolved' && 'Completed & Resolved Complaints'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live database queue for technician dispatch. Accept tickets, add progress remarks, and mark complete.
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search ticket #, title, room..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 w-48 sm:w-56"
                    />
                  </div>

                  {/* Priority Filter */}
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

                  {/* Status Filter */}
                  {activeTab === 'overview' && (
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Table */}
              {filteredComplaints.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                        <th scope="col" className="px-5 py-3.5">Complaint ID</th>
                        <th scope="col" className="px-5 py-3.5">Title</th>
                        <th scope="col" className="px-5 py-3.5">Category</th>
                        <th scope="col" className="px-5 py-3.5">Location</th>
                        <th scope="col" className="px-5 py-3.5">Priority</th>
                        <th scope="col" className="px-5 py-3.5">Submitted Date</th>
                        <th scope="col" className="px-5 py-3.5">Status</th>
                        <th scope="col" className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {filteredComplaints.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                          
                          {/* ID */}
                          <td className="px-5 py-4 font-mono font-bold text-teal-800 whitespace-nowrap">
                            #{ticket.id}
                          </td>

                          {/* Title */}
                          <td className="px-5 py-4 max-w-xs">
                            <p className="font-semibold text-slate-900 truncate">{ticket.title}</p>
                            <p className="text-[11px] text-slate-500 truncate">{ticket.description}</p>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4 whitespace-nowrap text-slate-700">
                            <span className="font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                              {ticket.category || 'General'}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                            {ticket.location}
                          </td>

                          {/* Priority */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {getPriorityBadge(ticket.priority)}
                          </td>

                          {/* Submitted Date */}
                          <td className="px-5 py-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {getStatusBadge(ticket.status)}
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              
                              {/* 1. Accept Button (if in ASSIGNED state) */}
                              {ticket.status === 'ASSIGNED' && (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptTicket(ticket.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                                  title="Accept ticket to commence response"
                                >
                                  <UserCheck className="w-3 h-3 text-blue-600" />
                                  Accept
                                </button>
                              )}

                              {/* 2. Start Work Button (transitions to IN_PROGRESS) */}
                              {ticket.status === 'ASSIGNED' && (
                                <button
                                  type="button"
                                  onClick={() => openStatusModal(ticket, 'IN_PROGRESS')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                                  title="Begin inspection work"
                                >
                                  <Play className="w-3 h-3 text-amber-600" />
                                  Start Work
                                </button>
                              )}

                              {/* 3. Add Remarks / Update Button */}
                              {ticket.status === 'IN_PROGRESS' && (
                                <button
                                  type="button"
                                  onClick={() => openStatusModal(ticket, 'IN_PROGRESS')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                                  title="Add technician progress remark"
                                >
                                  <MessageSquare className="w-3 h-3 text-slate-600" />
                                  Remark
                                </button>
                              )}

                              {/* 4. Mark Resolved */}
                              {ticket.status === 'IN_PROGRESS' && (
                                <button
                                  type="button"
                                  onClick={() => openStatusModal(ticket, 'RESOLVED')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                                  title="Mark repair completed"
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Resolve
                                </button>
                              )}

                              {/* 5. View Full Details Modal */}
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(ticket)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors"
                              >
                                <Eye className="w-3 h-3 text-slate-500" />
                                Details
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
                  <p className="text-sm font-semibold text-slate-700">No Complaints Match Current Filter</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery ? `No records found matching "${searchQuery}".` : 'There are no complaints under this status queue.'}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB CONTENT 2: NOTIFICATIONS                             */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0f1c34]">Staff Dispatch Notifications</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Automated ticket dispatch and student inquiry alerts.</p>
                </div>
                <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {notifications.length} Total
                </span>
              </div>

              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${notif.isRead ? 'bg-white' : 'bg-teal-50/30'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${notif.isRead ? 'bg-slate-100 text-slate-500' : 'bg-teal-100 text-teal-800'}`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-GB') : 'Just now'}
                          </p>
                        </div>
                      </div>
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={async () => {
                            await markNotificationAsRead(notif.id);
                            fetchStaffData();
                          }}
                          className="text-[11px] font-semibold text-teal-700 hover:underline shrink-0"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-500">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No notifications recorded.
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB CONTENT 3: PROFILE                                   */}
          {/* ======================================================== */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 max-w-2xl space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="w-16 h-16 rounded-full bg-[#0f1c34] text-white flex items-center justify-center font-bold text-2xl border-2 border-teal-500">
                  {user?.fullName?.charAt(0) || 'M'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0f1c34]">{user?.fullName || 'Marcus Sterling'}</h2>
                  <p className="text-xs text-slate-500">{user?.email || 'staff@campuscare.edu'}</p>
                  <span className="inline-block mt-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Role: {user?.role || 'STAFF'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Assigned Division</span>
                  <span className="text-slate-800 font-semibold">{user?.department || 'Physical Plant & Facilities'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Service Specialization</span>
                  <span className="text-slate-800 font-semibold">Electrical &amp; Plumbing Services</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Active Assignments</span>
                  <span className="text-slate-800 font-semibold">{pendingAcceptance + inProgress} Tickets</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Lifetime Resolved</span>
                  <span className="text-slate-800 font-semibold">{resolved} Completed</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ======================================================== */}
      {/* 3. STATUS & REMARK UPDATE MODAL                          */}
      {/* ======================================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0f1c34]">
                Update Ticket #{selectedTicket.id} &bull; {targetStatus}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
              <p className="font-semibold text-slate-800">{selectedTicket.title}</p>
              <p className="text-[11px] text-slate-500">{selectedTicket.category} &bull; {selectedTicket.location}</p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transition Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                >
                  <option value="ASSIGNED">ASSIGNED (Awaiting Action)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Technician On-Site)</option>
                  <option value="RESOLVED">RESOLVED (Repairs Complete)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technician Remarks / Progress Log
                </label>
                <textarea
                  rows={3}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Detail inspection observations, parts replaced, or completion notes..."
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
                >
                  {submittingStatus ? 'Saving...' : `Confirm ${targetStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. COMPREHENSIVE TICKET DETAILS & HISTORY MODAL          */}
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

            {/* Description & Location */}
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
                  <span className="text-slate-500 font-semibold block uppercase text-[10px]">Requester</span>
                  <span className="text-slate-800 font-medium">{detailsTicket.createdBy?.fullName || 'Student'} ({detailsTicket.createdBy?.studentId || 'N/A'})</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Information */}
            {detailsTicket.aiAnalysis && (
              <div className="bg-teal-50/60 border border-teal-200/80 rounded-lg p-3.5 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-teal-900 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>AI Maintenance Intelligence Analysis</span>
                </div>
                <p className="text-teal-800">{detailsTicket.aiAnalysis.explanation}</p>
                <p className="text-[10px] text-teal-600 font-mono">
                  Engine: {detailsTicket.aiAnalysis.engine || 'Scikit-Learn TF-IDF + FastAPI'} &bull; Urgency Score: {detailsTicket.aiAnalysis.urgencyScore || '7.5'}/10
                </p>
              </div>
            )}

            {/* Chronological History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Service Audit Trail &amp; History
              </h4>

              {loadingHistory ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-600 mx-auto mb-1.5" />
                  Loading history records...
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
                        <p className="text-slate-600 mt-0.5">{h.remarks || 'Status update logged.'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">By: {h.updatedBy?.fullName || 'System Dispatcher'}</p>
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

    </div>
  );
}
