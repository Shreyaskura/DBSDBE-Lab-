import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import campusVisual from '../assets/campus_visual.jpg';
import { login, getRoleDashboardPath, saveAuthSession } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiNotice, setApiNotice] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Validate form fields
  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errs.email = 'University email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid university email (e.g. student@university.edu).';
    }

    if (!password) {
      errs.password = 'Password is required to authenticate.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    return errs;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate();
    setErrors(validationErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setApiNotice(null);

    try {
      // Dispatches to the Spring Boot REST endpoint: POST /api/v1/auth/login
      const result = await login({ email, password, rememberMe });
      
      // Save authenticated session
      saveAuthSession(result.token, result.user);

      // Perform Role-Based Redirection
      const redirectPath = getRoleDashboardPath(result.user?.role || 'STUDENT');
      navigate(redirectPath);
    } catch (err) {
      // Real backend response or network error handling
      if (err.response?.data?.message) {
        setApiNotice({
          type: 'error',
          title: 'Authentication Failed',
          message: err.response.data.message,
        });
      } else {
        // Backend not yet reachable (Spring Boot stage pending)
        setApiNotice({
          type: 'info',
          title: 'Spring Boot REST Gateway Pending',
          message: 'The Spring Boot authentication service (POST /api/v1/auth/login) is currently offline. You can test role-based dashboard redirection using the sandbox below.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSandboxRedirect = (role) => {
    const targetPath = getRoleDashboardPath(role);
    navigate(targetPath);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-slate-50">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SECTION: Split-Screen Branding & Campus Visual */}
          <div className="lg:col-span-5 bg-[#0f1c34] text-white p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
            <div>
              {/* Institutional Branding */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-white font-sans">
                      CampusCare
                    </span>
                    <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded tracking-wide">
                      Enterprise
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    Smart Campus Service Management
                  </span>
                </div>
              </div>

              {/* Welcome Back Header */}
              <div className="space-y-3 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Sign in with your university credentials to access automated ticket dispatch, facility repairs, and AI-prioritized infrastructure support.
                </p>
              </div>

              {/* Campus Visual Frame */}
              <div className="relative rounded-lg overflow-hidden border border-slate-700/80 my-6 shadow-md bg-[#0a1120]">
                <img 
                  src={campusVisual} 
                  alt="University Innovation Centre Campus" 
                  className="w-full h-48 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120]/90 via-transparent to-transparent flex items-end p-3">
                  <div className="flex items-center gap-2 text-[11px] text-teal-300 font-medium bg-[#0a1120]/80 backdrop-blur-xs px-2.5 py-1 rounded border border-teal-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                    University Central Campus &bull; Operations Node
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Assurance */}
            <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Enterprise Spring Security &bull; Role-Based Access</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                All authentications are audited in <code className="text-slate-300">campuscare_db</code> under institutional cybersecurity policies.
              </p>
            </div>
          </div>

          {/* RIGHT SECTION: Login Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0f1c34] tracking-tight">
                  Sign in to your account
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access institutional services across IT, Facilities, and Housing.
                </p>
              </div>

              {/* Backend Status Notice */}
              {apiNotice && (
                <div 
                  className={`mb-6 p-4 rounded-lg border text-xs flex items-start gap-3 ${
                    apiNotice.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {apiNotice.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block">{apiNotice.title}</span>
                    <span className="mt-0.5 block leading-relaxed">{apiNotice.message}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email Address */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    University Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="e.g. s.patel@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                        touched.email && errors.email
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                      }`}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="password" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    >
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-9 pr-10 py-2 text-sm rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                        touched.password && errors.password
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-xs text-slate-600">
                    Remember me on this institutional device
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f1c34] hover:bg-[#172a4d] rounded-md transition-colors shadow-xs disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Authenticating with Spring Security...
                      </>
                    ) : (
                      <>
                        Sign In to CampusCare
                        <ArrowRight className="w-4 h-4 text-teal-400" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Role-Based Redirection Preview Sandbox */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Role-Based Redirection Preview
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    Development Routing
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Inspect workspace layouts provisioned for each enterprise role:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSandboxRedirect('STUDENT')}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition-colors hover:border-slate-300"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSandboxRedirect('STAFF')}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition-colors hover:border-slate-300"
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSandboxRedirect('ADMIN')}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition-colors hover:border-slate-300"
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Register Link */}
              <div className="mt-6 text-center text-xs text-slate-600">
                <span>Don't have a registered account? </span>
                <Link
                  to="/register"
                  className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  Register as Student
                </Link>
              </div>

              {/* Governance Note */}
              <div className="mt-4 p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-500 text-center">
                Staff &amp; Administrator accounts are provisioned exclusively by University IT Administration.
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 max-w-sm w-full p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-[#0f1c34]">
              <Info className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold">Password Reset Protocol</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              CampusCare uses centralized university identity services. To reset your institutional login credentials, please contact the campus IT Helpdesk:
            </p>
            <div className="bg-slate-50 p-3 rounded text-xs space-y-1 font-mono text-slate-700 border border-slate-200">
              <div>Phone: ext. 4400 (Campus Desk)</div>
              <div>Email: it-services@university.edu</div>
              <div>Hours: Mon–Fri, 08:00 – 18:00</div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0f1c34] hover:bg-[#172a4d] rounded-md transition-colors"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
