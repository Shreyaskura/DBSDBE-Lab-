import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Activity, 
  AlertCircle, 
  User, 
  MapPin, 
  Calendar, 
  Building2, 
  Cpu, 
  ShieldCheck, 
  Image as ImageIcon, 
  Wrench, 
  Layers,
  FileText,
  Printer,
  Star,
  Send,
  RefreshCw
} from 'lucide-react';
import { getComplaintById, getComplaintHistory, submitFeedback } from '../../services/complaintService';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const data = await getComplaintById(id);
      setComplaint(data);

      try {
        const histData = await getComplaintHistory(id);
        setHistory(histData || []);
      } catch {
        setHistory([]);
      }
    } catch (err) {
      setErrorNotice(
        err.response?.data?.message || 'Complaint record not found or server is unreachable.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      await submitFeedback({
        complaintId: Number(id),
        rating: Number(rating),
        comments: comments.trim()
      });
      setFeedbackSuccess(true);
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <h2 className="text-base font-semibold text-[#0f1c34]">
          Loading Service Ticket #{id}...
        </h2>
        <p className="text-xs text-slate-500">
          Querying MySQL <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">campuscare_db</code> audit ledger.
        </p>
      </div>
    );
  }

  if (errorNotice || !complaint) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-[#0f1c34]">
          Complaint Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested service request ID <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">#{id}</code> could not be located in the database.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Retry
          </button>
          <Link
            to="/student/complaints"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0f1c34] hover:bg-[#172a4d] rounded-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to My Complaints
          </Link>
        </div>
      </div>
    );
  }

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            SUBMITTED
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            ASSIGNED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            IN_PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            RESOLVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100">
            {status}
          </span>
        );
    }
  };

  // Priority Badge Helper
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">Priority: Critical</span>;
      case 'HIGH':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">Priority: High</span>;
      case 'MEDIUM':
        return <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">Priority: Medium</span>;
      default:
        return <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">Priority: Low</span>;
    }
  };

  const formattedDate = complaint.createdAt ? 
    new Date(complaint.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 
    (complaint.dateSubmitted || 'Recently');

  const deptName = complaint.assignedDepartment?.departmentName || `${complaint.category || 'Operations'} Division`;
  const staffName = complaint.assignedStaff?.fullName || 'Pending Technician Dispatch';

  // Build standard timeline checkpoints
  const stages = [
    { key: 'SUBMITTED', name: 'Submitted', defaultActor: complaint.createdBy?.fullName || 'Student Requester' },
    { key: 'ASSIGNED', name: 'Assigned', defaultActor: deptName },
    { key: 'IN_PROGRESS', name: 'In Progress', defaultActor: staffName },
    { key: 'RESOLVED', name: 'Resolved', defaultActor: staffName !== 'Pending Technician Dispatch' ? staffName : 'Maintenance Supervisor' }
  ];

  const currentStatusIndex = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].indexOf(complaint.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Navigation & Controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaints Directory
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 border border-slate-200 rounded shadow-2xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-slate-400" />
          Print Ticket Summary
        </button>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              #{complaint.id}
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {complaint.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {getPriorityBadge(complaint.priority)}
            {getStatusBadge(complaint.status)}
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f1c34] tracking-tight">
            {complaint.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Submitted: {formattedDate}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {complaint.location}
            </span>
          </div>
        </div>
      </div>

      {/* Split Section: Details & Visual Tracking Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Description, Timeline, Image, Feedback (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Issue Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Detailed Complaint Description
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-lg border border-slate-200/60">
              {complaint.description}
            </p>
          </div>

          {/* Supporting Image Attachment (if present) */}
          {(complaint.imageUrl || complaint.imageAttachment) && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
              <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-teal-600" />
                Supporting Photograph Attachment
              </h2>
              <div className="rounded-lg overflow-hidden border border-slate-200 max-h-80 bg-slate-100 flex items-center justify-center">
                <img 
                  src={complaint.imageUrl || complaint.imageAttachment} 
                  alt="Student uploaded defect documentation" 
                  className="max-h-80 w-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* COMPLAINT TRACKING TIMELINE */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-teal-600" />
                  Lifecycle Dispatch Workflow
                </div>
                <h2 className="text-base font-bold text-[#0f1c34] mt-0.5">
                  Complaint Tracking Timeline
                </h2>
                <p className="text-xs text-slate-500">
                  Live progression audit trail persisted in MySQL complaint_history table.
                </p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="Reload timeline history"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Timeline Steps */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {stages.map((stageItem, idx) => {
                const stageStatusIndex = idx;
                const isCompleted = currentStatusIndex > stageStatusIndex || (currentStatusIndex === 3 && stageStatusIndex === 3);
                const isActive = currentStatusIndex === stageStatusIndex && currentStatusIndex !== 3;

                // Match any history event for this status
                const historyEvent = history.find(h => h.newStatus === stageItem.key);

                return (
                  <div key={stageItem.key} className="relative flex items-start gap-4">
                    {/* Timeline Node Bullet */}
                    <div className="absolute -left-6 mt-0.5">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center ring-4 ring-amber-100 animate-pulse shadow-2xs">
                          <Activity className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center ring-4 ring-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        </div>
                      )}
                    </div>

                    {/* Stage Card */}
                    <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200/80 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-[#0f1c34]">
                            Stage {idx + 1}: {stageItem.name}
                          </h3>
                          {isActive && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.2 rounded border border-amber-200">
                              Current Stage
                            </span>
                          )}
                          {isCompleted && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.2 rounded border border-emerald-200">
                              Completed
                            </span>
                          )}
                        </div>

                        {historyEvent?.updatedAt && (
                          <span className="text-[11px] font-medium text-slate-500 font-mono">
                            {new Date(historyEvent.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {historyEvent?.remarks || (
                          idx === 0 ? 'Complaint logged by student and submitted to campus dispatch.' :
                          idx === 1 ? 'Department supervisor assignment to certified maintenance crew.' :
                          idx === 2 ? 'Technician dispatched on-site for investigation and repair work.' :
                          'Service verification and institutional work-order sign-off.'
                        )}
                      </p>

                      <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Logged by: {historyEvent?.updatedBy || stageItem.defaultActor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* STUDENT FEEDBACK MODULE: Available once complaint is RESOLVED */}
          {complaint.status === 'RESOLVED' && (
            <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-[#0f1c34]">
                  Resolution Satisfaction Feedback
                </h2>
              </div>
              <p className="text-xs text-slate-600">
                This service request has been resolved. Please rate the quality and timeliness of the maintenance resolution. Records are stored in MySQL <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">feedback</code>.
              </p>

              {feedbackSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Thank you! Your feedback rating ({rating} / 5) has been saved permanently to the database.</span>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3 pt-2">
                  {feedbackError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs">
                      {feedbackError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Service Rating (1 - 5 Stars)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star 
                            className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {rating} out of 5 stars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Comments / Feedback Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Share your feedback regarding the technician's repair speed, cleanliness, and service quality..."
                      className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingFeedback ? 'Saving Feedback...' : 'Submit Resolution Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Meta details, Assigned Personnel, AI Triage (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Assigned Department & Staff */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-teal-600" />
              Service Allocation
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Responsible Department</span>
                <span className="font-semibold text-slate-800 block">
                  {deptName}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Assigned Technician</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full bg-[#0f1c34] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {staffName.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-800">
                    {staffName}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Campus Location</span>
                <span className="font-medium text-slate-700 block leading-tight">
                  {complaint.location}
                </span>
              </div>
            </div>
          </div>

          {/* AI Intelligent Analysis Block */}
          <div className="bg-[#0f1c34] text-white rounded-xl p-5 shadow-xs space-y-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold">
                <Cpu className="w-4 h-4 text-teal-400" />
                <span>AI Triage Analysis</span>
              </div>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded font-mono">
                FastAPI Ready
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Calculated Priority:</span>
                <span className="font-semibold text-teal-300">{complaint.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Status:</span>
                <span className="font-medium text-white">{complaint.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category Routing:</span>
                <span className="font-medium text-slate-200 text-[11px] bg-[#172a4d] px-2 py-0.5 rounded inline-block mt-0.5">
                  {complaint.category} Operations Division
                </span>
              </div>
            </div>
          </div>

          {/* Governance Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              SLA Resolution Standard
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              University maintenance policy guarantees inspection within 4 hours for high-priority tickets. Permanent audit records are persisted in MySQL 8 <code className="text-slate-700 font-mono">campuscare_db</code>.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
