import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  Search, 
  HelpCircle, 
  Activity, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function RootLayout() {
  const location = useLocation();

  const navLinks = [
    { name: 'Overview', href: '/' },
    { name: 'Services Directory', href: '/services' },
    { name: 'Track Request', href: '/tracking' },
    { name: 'System Status', href: '/status' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Institutional Top Bar */}
      <div className="bg-[#0a1120] text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Campus Operations & Infrastructure Portal</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Institutional Service Management</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300 font-medium">All Core Services Operational</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Emergency Dispatch: ext. 4400</span>
          </div>
        </div>
      </div>

      {/* Main Enterprise Navigation Header */}
      <header className="bg-[#0f1c34] border-b border-slate-800 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-teal-600 flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white font-sans">
                    CampusCare
                  </span>
                  <span className="bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded tracking-wide">
                    Enterprise
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium tracking-normal -mt-0.5">
                  AI-Powered Smart Campus Service Management
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/tracking"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                Track Ticket
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-md transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Enterprise Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto text-sm text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-[#0f1c34] flex items-center justify-center text-white">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <span className="font-semibold text-slate-900 tracking-tight">CampusCare System</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Centralized campus operations platform providing automated service dispatch, facility monitoring, and AI-assisted triage for university students, staff, and faculty.
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                Version 1.0.0-rc &bull; Production Architecture
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Service Divisions
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="hover:text-slate-900 cursor-pointer">Information Technology Services</li>
                <li className="hover:text-slate-900 cursor-pointer">Facilities & Physical Plant</li>
                <li className="hover:text-slate-900 cursor-pointer">Hostel & Residential Life</li>
                <li className="hover:text-slate-900 cursor-pointer">Campus Safety & Security</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Platform Architecture
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  React 19 &bull; Vite &bull; Tailwind CSS
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Spring Boot 3.x REST Backend
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  FastAPI AI Classification Engine
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  MySQL 8+ Enterprise Persistence
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Compliance & Security
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Operated under university IT governance and institutional data privacy protocols.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-2 rounded border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Enterprise SLA Guaranteed</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} CampusCare Operations Management. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:underline cursor-pointer">Data Privacy</span>
              <span className="hover:underline cursor-pointer">Acceptable Use Policy</span>
              <span className="hover:underline cursor-pointer">Service Level Agreement</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
