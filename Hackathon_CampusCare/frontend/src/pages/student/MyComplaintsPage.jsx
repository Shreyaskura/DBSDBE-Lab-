import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  PlusCircle, 
  ArrowUpDown, 
  Eye, 
  RotateCcw, 
  MapPin, 
  Calendar,
  Layers,
  Inbox,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getMyComplaints } from '../../services/complaintService';

export default function MyComplaintsPage() {
  const navigate = useNavigate();

  // Load complaints from live MySQL Spring Boot API
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const data = await getMyComplaints();
      setAllComplaints(data || []);
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

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST'); // NEWEST or OLDEST

  const categories = [
    'Electrical',
    'Plumbing',
    'Network & Wi-Fi',
    'Classroom Equipment',
    'Cleaning & Sanitation',
    'Infrastructure',
    'Transportation',
    'Other',
  ];

  const statuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  // Status Badge Helper
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

  // Filter & Sort Logic
  const filteredComplaints = useMemo(() => {
    return allComplaints
      .filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !query ||
          item.title?.toLowerCase().includes(query) ||
          String(item.id).toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query);

        const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
        const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
        const matchesPriority = selectedPriority === 'ALL' || item.priority === selectedPriority;

        return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.rawDate || a.dateSubmitted || 0).getTime();
        const dateB = new Date(b.createdAt || b.rawDate || b.dateSubmitted || 0).getTime();
        return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
      });
  }, [allComplaints, searchQuery, selectedCategory, selectedStatus, selectedPriority, sortOrder]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedPriority !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setSortOrder('NEWEST');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f1c34] tracking-tight">
              My Complaints Directory
            </h1>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-semibold px-2 py-0.5 rounded">
              {allComplaints.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and track lifecycle resolution timelines for all your campus service tickets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchComplaints}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs"
            title="Refresh Complaints from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
            Refresh
          </button>

          <Link
            to="/student/complaints/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Raise New Complaint
          </Link>
        </div>
      </div>

      {/* Backend Error Alert if any */}
      {errorNotice && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            type="button"
            onClick={fetchComplaints}
            className="text-rose-700 font-semibold underline ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Search Bar & Date Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by complaint title, reference ID, or building location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 bg-white placeholder:text-slate-400"
            />
          </div>

          {/* Sort By Date */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              Sort:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Categorical & Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          
          {/* Filter by Category */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            >
              <option value="ALL">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Filter by Priority */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            >
              <option value="ALL">All Priorities</option>
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters CTA */}
          <div className="flex items-end">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 py-2">
                Showing all records
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th scope="col" className="px-5 py-3.5">Complaint ID</th>
                  <th scope="col" className="px-5 py-3.5">Complaint Title</th>
                  <th scope="col" className="px-5 py-3.5">Category</th>
                  <th scope="col" className="px-5 py-3.5">Location</th>
                  <th scope="col" className="px-5 py-3.5">Submitted Date</th>
                  <th scope="col" className="px-5 py-3.5">Priority</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Complaint ID */}
                    <td className="px-5 py-4 font-mono font-medium text-teal-800 whitespace-nowrap">
                      <Link 
                        to={`/student/complaints/${item.id}`}
                        className="hover:underline font-semibold"
                      >
                        {item.id}
                      </Link>
                    </td>

                    {/* Complaint Title */}
                    <td className="px-5 py-4 font-medium text-[#0f1c34] max-w-xs truncate">
                      <Link 
                        to={`/student/complaints/${item.id}`}
                        className="hover:text-teal-700"
                      >
                        {item.title}
                      </Link>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {item.category}
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                      {item.location}
                    </td>

                    {/* Submitted Date */}
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {item.dateSubmitted || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently')}
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getPriorityBadge(item.priority)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/student/complaints/${item.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        View Details
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty States */
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              <Inbox className="w-8 h-8 text-teal-600" />
            </div>

            {hasActiveFilters ? (
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[#0f1c34]">
                  No Matching Complaints Found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  No service requests match your active search terms or category/status filters.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear Active Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[#0f1c34]">
                  No Complaints in Archive
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  You haven't submitted any service tickets yet. If you are experiencing infrastructure or IT issues, click the button below.
                </p>
                <div className="pt-2">
                  <Link
                    to="/student/complaints/new"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Raise New Complaint
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
