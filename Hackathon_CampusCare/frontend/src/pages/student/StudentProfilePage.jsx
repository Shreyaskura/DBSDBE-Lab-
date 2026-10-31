import React from 'react';
import { User, Mail, Hash, GraduationCap, Building2, ShieldCheck, Calendar } from 'lucide-react';
import { getAuthSession } from '../../services/authService';

export default function StudentProfilePage() {
  const { user } = getAuthSession();
  const student = {
    fullName: user?.fullName || 'Maya Lin',
    email: user?.email || 'm.lin@university.edu',
    studentId: user?.studentId || 'STU-2026-8910',
    department: user?.department || 'School of Computer Science & Information Technology',
    enrollmentStatus: 'Active / Enrolled',
    campusHostel: 'Block 4, Room 218 (Dormitory Residence)',
    registeredDate: 'September 2026'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1c34]">
            Student Identity Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional directory information linked to your campus service requests.
          </p>
        </div>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded">
          {student.enrollmentStatus}
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-14 h-14 rounded-full bg-[#0f1c34] text-white text-xl font-bold flex items-center justify-center">
            {student.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0f1c34]">{student.fullName}</h2>
            <p className="text-xs text-slate-500 font-mono">{student.studentId} &bull; Student Account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-4 h-4 text-slate-400" />
              University Email
            </span>
            <p className="font-semibold text-slate-800 text-sm">{student.email}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              Academic Department
            </span>
            <p className="font-semibold text-slate-800 text-sm">{student.department}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Building2 className="w-4 h-4 text-slate-400" />
              Campus Accommodation
            </span>
            <p className="font-semibold text-slate-800 text-sm">{student.campusHostel}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              Portal Registration Date
            </span>
            <p className="font-semibold text-slate-800 text-sm">{student.registeredDate}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">FERPA Protected Record:</span> Profile attributes are synchronized from the university student information system (SIS) and securely persisted in <code className="bg-slate-200 px-1 py-0.5 rounded">campuscare_db</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
