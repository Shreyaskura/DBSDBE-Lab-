import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Wrench, 
  Wifi, 
  ShieldAlert, 
  Layers, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  PlusCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DEFAULT_DEPARTMENTS = [
  {
    id: 1,
    departmentName: 'Office of Information Technology',
    description: 'Campus network, classroom multimedia, student email accounts, and computer laboratory systems.',
    sla: '4-8 Hours',
    phone: 'ext. 4410',
    email: 'oit-helpdesk@university.edu',
    location: 'Central Academic Quad, Room 104'
  },
  {
    id: 2,
    departmentName: 'Physical Plant & Facilities',
    description: 'HVAC regulation, electrical grids, civil structures, water supply, and general plumbing repairs.',
    sla: '2-4 Hours (Urgent) / 24 Hours (Routine)',
    phone: 'ext. 4420',
    email: 'facilities@university.edu',
    location: 'Facilities Operations Complex'
  },
  {
    id: 3,
    departmentName: 'Campus Residential Life',
    description: 'Hostel dormitories, student dining mess, hot water systems, furnishings, and student accommodation.',
    sla: '4-12 Hours',
    phone: 'ext. 4430',
    email: 'reslife@university.edu',
    location: 'Residential Commons Block 1'
  },
  {
    id: 4,
    departmentName: 'Campus Security & Safety',
    description: 'Access turnstiles, student ID credentials, surveillance cameras, and 24/7 emergency incident dispatch.',
    sla: 'Immediate / < 30 Minutes',
    phone: 'ext. 4400 (Emergency)',
    email: 'security@university.edu',
    location: 'Main Campus Gatehouse'
  },
  {
    id: 5,
    departmentName: 'Sanitation & Environmental Services',
    description: 'Classroom cleanliness, hygiene dispensers, hazardous chemical cleanup, and waste removal.',
    sla: '2-6 Hours',
    phone: 'ext. 4450',
    email: 'sanitation@university.edu',
    location: 'Physical Plant Annex B'
  }
];

export default function ServicesDirectory() {
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/departments');
        if (res.data && res.data.length > 0) {
          // Merge with SLA metadata
          const merged = res.data.map((d, idx) => {
            const fallback = DEFAULT_DEPARTMENTS.find(f => f.departmentName.toLowerCase() === d.departmentName.toLowerCase()) || DEFAULT_DEPARTMENTS[idx % DEFAULT_DEPARTMENTS.length];
            return {
              ...fallback,
              ...d
            };
          });
          setDepartments(merged);
        }
      } catch {
        // Fallback to institutional default directory
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const filteredDepts = departments.filter(d => 
    d.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
            Institutional Service Directory
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f1c34]">
            Campus Operational Service Divisions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Official university maintenance divisions, operating hours, target response Service Level Agreements (SLAs), and emergency contacts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/complaints/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            File a Service Request
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search maintenance divisions, scope, or keywords..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
        />
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => (
          <div 
            key={dept.id || dept.departmentName}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 rounded-lg bg-slate-100 text-[#0f1c34] border border-slate-200 shrink-0">
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {dept.sla || '4-8 Hours SLA'}
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#0f1c34]">
                  {dept.departmentName}
                </h2>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {dept.description}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{dept.phone || 'ext. 4400'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{dept.email || 'services@university.edu'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{dept.location || 'Central Campus Operations'}</span>
              </div>

              <div className="pt-2">
                <Link
                  to="/student/complaints/new"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors"
                >
                  Request Service from Division
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
