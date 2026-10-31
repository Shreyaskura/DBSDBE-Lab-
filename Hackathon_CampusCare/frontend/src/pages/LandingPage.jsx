import React from 'react';
import { 
  Building2, 
  Wrench, 
  Wifi, 
  Home, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText,
  Search,
  Server,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const serviceCategories = [
    {
      title: 'IT & Digital Infrastructure',
      code: 'DIV-IT-01',
      description: 'Campus Wi-Fi connectivity, lab workstations, LMS access, student email credentials, and software licensing support.',
      icon: Wifi,
      department: 'Office of Information Technology',
    },
    {
      title: 'Facilities & Campus Maintenance',
      code: 'DIV-FAC-02',
      description: 'HVAC regulation, electrical maintenance, plumbing fixtures, classroom audiovisual equipment, and civil repairs.',
      icon: Wrench,
      department: 'Physical Plant & Operations',
    },
    {
      title: 'Hostel & Residential Services',
      code: 'DIV-RES-03',
      description: 'Dormitory room inventory, mess hall complaints, hot water supply, laundry facility maintenance, and room inspections.',
      icon: Home,
      department: 'Campus Residential Life',
    },
    {
      title: 'Campus Safety & Emergency Help',
      code: 'DIV-SEC-04',
      description: 'Security dispatch, electronic access cards, parking zone management, surveillance queries, and emergency alarms.',
      icon: ShieldAlert,
      department: 'Campus Security & Safety',
    },
  ];

  const architecturalPillars = [
    {
      icon: Cpu,
      title: 'AI Request Triage',
      description: 'Natural language analysis parses issue severity, infers correct routing, and detects campus-wide recurring incidents automatically.',
    },
    {
      icon: Server,
      title: 'Spring Boot 3 REST Core',
      description: 'Enterprise-grade Java backend providing transactional integrity, role-based access control, and SLA dispatch queues.',
    },
    {
      icon: Database,
      title: 'MySQL 8 Relational Store',
      description: 'Robust schema in campuscare_db storing ticket logs, audit trails, departmental structures, and asset inventories.',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Enterprise Hero Section */}
      <section className="bg-white border-b border-slate-200 -mt-8 pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              Institutional Campus Service Platform
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0f1c34] font-sans leading-tight">
              Centralized Service Desk &amp; Smart Campus Operations
            </h1>
            
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              CampusCare unifies university maintenance, IT services, residential logistics, and emergency dispatch into an enterprise-grade service management system powered by automated triage and institutional workflows.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0f1c34] hover:bg-[#172a4d] rounded-md transition-colors shadow-xs"
              >
                Explore Service Catalog
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </Link>
              <Link
                to="/tracking"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
              >
                <Search className="w-4 h-4 text-slate-500" />
                Track Existing Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Operational Metrics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
              <span>Service Availability</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0f1c34]">99.94%</div>
            <p className="mt-1 text-xs text-slate-500">Continuous uptime across all university zones</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
              <span>Target SLA Response</span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0f1c34]">&lt; 2 Hours</div>
            <p className="mt-1 text-xs text-slate-500">Standard for high-priority facility incidents</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
              <span>Service Divisions</span>
              <Building2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0f1c34]">4 Core Depts</div>
            <p className="mt-1 text-xs text-slate-500">IT, Physical Plant, Residence, Security</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
              <span>Persistence Layer</span>
              <Database className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0f1c34]">campuscare_db</div>
            <p className="mt-1 text-xs text-slate-500">Dedicated MySQL 8 Enterprise storage</p>
          </div>
        </div>
      </section>

      {/* Service Catalog Divisions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#0f1c34] tracking-tight">
              Institutional Service Divisions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a specialized department to inspect operational scope and dispatch protocols.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Enterprise Catalog v1.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.code} 
                className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded bg-slate-100 text-[#0f1c34] border border-slate-200">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#0f1c34]">
                        {cat.title}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        {cat.code} &bull; {cat.department}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                  {cat.description}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Standard SLA: Tier 1 &amp; Tier 2</span>
                  <Link
                    to="/services"
                    className="font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                  >
                    View Specifications
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Architecture Scaffolding */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0f1c34] rounded-lg text-white p-8 border border-slate-800">
          <div className="max-w-2xl">
            <span className="text-teal-400 text-xs font-semibold uppercase tracking-wider">
              System Engineering &amp; Multi-Tier Design
            </span>
            <h2 className="text-2xl font-bold mt-1 text-white">
              Enterprise Technology Architecture
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              CampusCare is structured according to enterprise separation of concerns, ensuring high availability, security auditing, and decoupled machine learning triage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {architecturalPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={pillar.title} 
                  className="bg-[#172a4d]/70 rounded-md p-5 border border-slate-700/60"
                >
                  <div className="p-2 w-fit rounded bg-[#0a1120] text-teal-400 mb-3 border border-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function ChevronRight(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
