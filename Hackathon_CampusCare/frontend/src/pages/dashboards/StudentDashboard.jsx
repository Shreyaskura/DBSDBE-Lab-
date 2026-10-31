import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Activity, 
  FolderArchive, 
  ArrowRight, 
  Eye, 
  X, 
  Building2, 
  AlertCircle, 
  ShieldCheck, 
  Cpu, 
  Wrench, 
  MapPin, 
  Calendar,
  Layers,
  Inbox,
  RefreshCw
} from 'lucide-react';
import { getMyComplaints } from '../../services/complaintService';
import { getAuthSession } from '../../services/authService';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = getAuthSession();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const data = await getMyComplaints();
      setComplaints(data || []);
    } catch (err) {
      setErrorNotice(
        err.response?.data?.message || 'Unable to connect to Spring Boot REST backend. Verify MySQL and backend service are active.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Compute live metric numbers dynamically from real MySQL database complaints
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  // Status Badge Rendering Helper
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
            IN_PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            RESOLVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            REJECTED
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

  // Priority Badge Helper
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Critical</span>;
      case 'HIGH':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">High</span>;
      case 'MEDIUM':
        return <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* WELCOME SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0f1c34]">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
            </h1>
            <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-semibold px-2 py-0.5 rounded">
              Academic Term 2026–2027
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Here's an overview of your campus service requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Data CTA */}
          <button
            type="button"
            onClick={fetchComplaints}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            Refresh
          </button>

          {/* Prominent Action Button */}
          <Link
            to="/student/complaints/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Raise New Complaint
          </Link>
        </div>
      </div>

      {/* Backend Alert Message (if any) */}
      {errorNotice && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Backend Sync Notice</span>
            <span className="mt-0.5 block">{errorNotice}</span>
          </div>
        </div>
      )}

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Complaints */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Complaints
            </span>
            <div className="p-2 rounded bg-slate-100 text-slate-700 border border-slate-200">
              <FolderArchive className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-[#0f1c34]">
            {loading ? '--' : totalCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Real records in MySQL campuscare_db
          </p>
        </div>

        {/* Pending Complaints */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Complaints
            </span>
            <div className="p-2 rounded bg-blue-50 text-blue-700 border border-blue-200">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-[#0f1c34]">
            {loading ? '--' : pendingCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Awaiting technician assignment
          </p>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Progress
            </span>
            <div className="p-2 rounded bg-amber-50 text-amber-800 border border-amber-200">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-[#0f1c34]">
            {loading ? '--' : inProgressCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Active technician investigations
          </p>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resolved
            </span>
            <div className="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-[#0f1c34]">
            {loading ? '--' : resolvedCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Successfully closed service orders
          </p>
        </div>
      </div>

      {/* RECENT COMPLAINTS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0f1c34] tracking-tight">
              Recent Complaints
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live records persisted permanently in MySQL database.
            </p>
          </div>

          <Link
            to="/student/complaints"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1"
          >
            View All Complaints
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
            <p>Loading complaints from Spring Boot REST API...</p>
          </div>
        ) : complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th scope="col" className="px-5 py-3.5">Complaint ID</th>
                  <th scope="col" className="px-5 py-3.5">Complaint Title</th>
                  <th scope="col" className="px-5 py-3.5">Category</th>
                  <th scope="col" className="px-5 py-3.5">Date Submitted</th>
                  <th scope="col" className="px-5 py-3.5">Priority</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-teal-800 whitespace-nowrap">
                      #{item.id}
                    </td>

                    <td className="px-5 py-4 font-medium text-[#0f1c34] max-w-xs truncate">
                      {item.title}
                    </td>

                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {item.category}
                    </td>

                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getPriorityBadge(item.priority)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/student/complaints/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* CLEAN EMPTY STATE */
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              <Inbox className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-base font-semibold text-[#0f1c34]">
              No Complaints Filed Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              You haven't submitted any service tickets yet. When you report issues with IT, facilities, or dormitories, they will be saved in MySQL and appear here.
            </p>
            <div className="pt-2">
              <Link
                to="/student/complaints/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Raise Your First Complaint
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ADDITIONAL SECTION: HOW STUDENTS SUBMIT & TRACK COMPLAINTS */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Standard Operating Workflow
          </div>
          <h2 className="text-lg font-bold text-[#0f1c34] mt-1">
            How CampusCare Processes &amp; Resolves Your Complaints
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every submission is persisted in MySQL 8 campuscare_db and routed under institutional Service Level Agreements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-[#0f1c34] text-white text-xs font-bold flex items-center justify-center">1</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-xs font-bold text-[#0f1c34]">Submit Detailed Ticket</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Identify the department, precise building/room, and context. Saved permanently in MySQL.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <Cpu className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-xs font-bold text-[#0f1c34]">AI Triage &amp; Routing</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              FastAPI engine evaluates severity, detects campus-wide duplicate incidents, and assigns priority.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-[#0f1c34] text-white text-xs font-bold flex items-center justify-center">3</span>
              <Wrench className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-xs font-bold text-[#0f1c34]">Technician Dispatch</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Supervisors assign certified staff under guaranteed target resolution SLAs.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">4</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-xs font-bold text-[#0f1c34]">Resolution &amp; Feedback</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Work is certified, history is logged, and students provide satisfaction ratings.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
