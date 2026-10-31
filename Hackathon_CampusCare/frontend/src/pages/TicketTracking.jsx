import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle2, Clock, Wrench, ShieldCheck, MapPin, Tag } from 'lucide-react';
import api from '../services/api';

export default function TicketTracking() {
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanId = ticketId.replace(/\D/g, '') || ticketId.trim();
    if (!cleanId) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await api.get(`/public/tickets/${cleanId}`);
      setTicket(response.data);
    } catch (err) {
      setTicket(null);
      setError(
        err.response?.status === 404
          ? `No ticket record found matching reference #${cleanId}. Please verify the ticket identifier.`
          : 'Unable to communicate with the institutional tracking service. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'SUBMITTED': return 1;
      case 'ASSIGNED': return 2;
      case 'IN_PROGRESS': return 3;
      case 'RESOLVED':
      case 'CLOSED': return 4;
      default: return 1;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-slate-100 text-[#0f1c34] border border-slate-200">
            <Search className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0f1c34]">
              Service Request Tracking
            </h1>
            <p className="text-xs text-slate-500">
              Query institutional ticket status, assigned technician SLA, and real-time resolution history.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 max-w-2xl mx-auto space-y-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ticketQuery" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Institutional Tracking ID / Reference Number
            </label>
            <div className="flex gap-2">
              <input
                id="ticketQuery"
                type="text"
                placeholder="Enter ticket number (e.g. 1, 2, 3 or CC-001)"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={loading || !ticketId.trim()}
                className="px-5 py-2 bg-[#0f1c34] hover:bg-[#172a4d] text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Searching...' : 'Track Ticket'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-xs text-red-700 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {ticket && (
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/50 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-teal-700">TICKET #{ticket.id}</span>
                <h3 className="text-base font-bold text-[#0f1c34] mt-0.5">{ticket.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getPriorityBadge(ticket.priority)}`}>
                  {ticket.priority} Priority
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-800">
                  {ticket.status}
                </span>
              </div>
            </div>

            {/* Workflow Progression Stepper */}
            <div className="py-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
                <span className={getStatusStep(ticket.status) >= 1 ? 'font-bold text-teal-700' : ''}>1. Submitted</span>
                <span className={getStatusStep(ticket.status) >= 2 ? 'font-bold text-teal-700' : ''}>2. Assigned</span>
                <span className={getStatusStep(ticket.status) >= 3 ? 'font-bold text-teal-700' : ''}>3. In Progress</span>
                <span className={getStatusStep(ticket.status) >= 4 ? 'font-bold text-teal-700' : ''}>4. Resolved</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(getStatusStep(ticket.status) / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Ticket Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 pt-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold">{ticket.category || 'General'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold">{ticket.location || 'Campus Facilities'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Assigned Team:</span>
                <span className="font-semibold">{ticket.assignedStaff || ticket.assignedDepartment || 'Institutional Triage'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Logged At:</span>
                <span className="font-semibold">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'Recent'}</span>
              </div>
            </div>

            {ticket.description && (
              <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block mb-1">Issue Description:</span>
                {ticket.description}
              </div>
            )}
          </div>
        )}

        {!searched && !ticket && (
          <div className="text-center py-6 text-slate-400 text-xs">
            Enter a numeric ticket ID from your submission confirmation to view live resolution updates.
          </div>
        )}
      </div>
    </div>
  );
}
