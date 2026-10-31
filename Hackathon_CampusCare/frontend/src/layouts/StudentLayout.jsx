import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { clearAuthSession, getAuthSession } from '../services/authService';

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Retrieve user session or fallback placeholder
  const { user } = getAuthSession();
  const studentName = user?.fullName || 'Maya Lin';
  const studentEmail = user?.email || 'm.lin@university.edu';
  const studentId = user?.studentId || 'STU-2026-8910';

  const navItems = [
    { name: 'Overview', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Raise Complaint', href: '/student/complaints/new', icon: PlusCircle },
    { name: 'My Complaints', href: '/student/complaints', icon: ClipboardList },
    { name: 'Notifications', href: '/student/notifications', icon: Bell, badge: 2 },
    { name: 'My Profile', href: '/student/profile', icon: User },
  ];

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      
      {/* MOBILE HEADER BAR */}
      <div className="lg:hidden bg-[#0f1c34] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-teal-600 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">CampusCare</span>
            <span className="ml-1.5 bg-teal-500/20 text-teal-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-teal-500/30">
              Student
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation drawer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION (Deep Navy) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f1c34] text-white flex flex-col justify-between border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-slate-800/80">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-md bg-teal-600 flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-white group-hover:text-teal-200 transition-colors">
                    CampusCare
                  </span>
                  <span className="bg-teal-500/20 text-teal-300 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border border-teal-500/30">
                    Portal
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Student Service Desk
                </span>
              </div>
            </Link>
          </div>

          {/* Quick CTA */}
          <div className="px-4 pt-4 pb-2">
            <Link
              to="/student/complaints/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Raise Complaint
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Student Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-teal-300 border-l-2 border-teal-500 pl-2.5 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* User Mini Profile Card */}
          <div className="bg-[#172a4d]/60 rounded-md p-2.5 border border-slate-700/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {studentName.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">{studentName}</p>
              <p className="text-[10px] text-slate-400 truncate">{studentId}</p>
            </div>
          </div>

          {/* Institutional Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-40 lg:hidden"
        />
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP ENTERPRISE HEADER */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Header Left: Breadcrumbs & Status */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Student Workspace
              </span>
              <span className="hidden sm:inline text-slate-300">&bull;</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-700">Campus Dispatch Active</span>
              </div>
            </div>

            {/* Header Right: Notifications & Profile Menu */}
            <div className="flex items-center gap-3">
              
              {/* Notifications Link */}
              <Link
                to="/student/notifications"
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                title="View Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white"></span>
              </Link>

              <div className="h-4 w-px bg-slate-200"></div>

              {/* Profile Menu Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-md hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0f1c34] text-white text-xs font-semibold flex items-center justify-center">
                    {studentName.charAt(0)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{studentName}</p>
                    <p className="text-[10px] text-slate-500 leading-none">Student</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div 
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-slate-200 shadow-md py-1.5 z-50 text-xs"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800">{studentName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{studentEmail}</p>
                      <p className="text-[10px] font-mono text-teal-700 mt-0.5">{studentId}</p>
                    </div>

                    <Link
                      to="/student/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/student/complaints"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Complaints</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </header>

        {/* MAIN BODY OUTLET */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
