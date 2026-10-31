import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Hash, 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';
import campusVisual from '../assets/campus_visual.jpg';
import { register, getRoleDashboardPath } from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    department: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiNotice, setApiNotice] = useState(null);

  const departments = [
    'School of Computer Science & Information Technology',
    'School of Engineering & Technology',
    'School of Business & Financial Management',
    'School of Humanities & Social Sciences',
    'School of Architecture & Urban Design',
    'School of Natural & Applied Sciences',
    'School of Health & Allied Medical Sciences',
  ];

  // Validation logic
  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full legal name is required.';
    } else if (formData.fullName.trim().length < 3) {
      errs.fullName = 'Full name must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'University email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid institutional email (e.g. s.name@university.edu).';
    }

    if (!formData.studentId.trim()) {
      errs.studentId = 'University Student ID is required.';
    } else if (formData.studentId.trim().length < 4) {
      errs.studentId = 'Student ID must be at least 4 characters.';
    }

    if (!formData.department) {
      errs.department = 'Please select your academic department.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must acknowledge the university acceptable use policy.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate();
    setErrors(validationErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setApiNotice(null);

    try {
      // Dispatches to Spring Boot: POST /api/v1/auth/register
      const result = await register(formData);
      
      setApiNotice({
        type: 'success',
        title: 'Registration Successful',
        message: result.message || 'Student account created. Redirecting to login...',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.message) {
        setApiNotice({
          type: 'error',
          title: 'Registration Rejected',
          message: err.response.data.message,
        });
      } else {
        // Backend not yet reachable (Spring Boot stage pending)
        setApiNotice({
          type: 'info',
          title: 'Spring Boot REST Gateway Pending',
          message: 'The registration endpoint (POST /api/v1/auth/register) is staged for Spring Boot integration. All validation rules passed successfully.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-slate-50 py-8">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SECTION: Split-Screen Branding & Registration Guidelines */}
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
                      Student Access
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    AI-Powered Smart Campus Service Management
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="space-y-3 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Student Enrollment
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Register your verified student credentials to submit infrastructure service requests, track repair SLAs, and access campus facility dispatching.
                </p>
              </div>

              {/* Campus Visual Frame */}
              <div className="relative rounded-lg overflow-hidden border border-slate-700/80 my-6 shadow-md bg-[#0a1120]">
                <img 
                  src={campusVisual} 
                  alt="University Innovation Centre Campus" 
                  className="w-full h-44 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120]/90 via-transparent to-transparent flex items-end p-3">
                  <div className="flex items-center gap-2 text-[11px] text-teal-300 font-medium bg-[#0a1120]/80 backdrop-blur-xs px-2.5 py-1 rounded border border-teal-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    Student Service Registry &bull; 2026-2027 Academic Year
                  </div>
                </div>
              </div>

              {/* Role Governance Callout */}
              <div className="bg-[#172a4d]/80 border border-slate-700 rounded-lg p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-teal-300 font-semibold">
                  <LockKeyhole className="w-4 h-4 text-teal-400" />
                  <span>Institutional Role Policy</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Public enrollment is strictly provisioned for <strong>Student</strong> accounts. Faculty, facility staff, and administrative accounts require background verification and are created exclusively by University IT Administration.
                </p>
              </div>
            </div>

            {/* Bottom Institutional Assurance */}
            <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>FERPA &amp; Institutional Privacy Compliant</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Data persists securely in MySQL 8 <code className="text-slate-300">campuscare_db</code> under strict data protection directives.
              </p>
            </div>
          </div>

          {/* RIGHT SECTION: Registration Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-xl mx-auto w-full">
              
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0f1c34] tracking-tight">
                  Create Student Account
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete the fields below with your registered university academic details.
                </p>
              </div>

              {/* Status Notice */}
              {apiNotice && (
                <div 
                  className={`mb-6 p-4 rounded-lg border text-xs flex items-start gap-3 ${
                    apiNotice.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : apiNotice.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {apiNotice.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : apiNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block">{apiNotice.title}</span>
                    <span className="mt-0.5 block leading-relaxed">{apiNotice.message}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Full Name & Student ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label 
                      htmlFor="fullName" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="e.g. Maya Lin"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('fullName')}
                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                          touched.fullName && errors.fullName
                            ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                        }`}
                      />
                    </div>
                    {touched.fullName && errors.fullName && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Student ID */}
                  <div>
                    <label 
                      htmlFor="studentId" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Student ID Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Hash className="w-4 h-4" />
                      </div>
                      <input
                        id="studentId"
                        name="studentId"
                        type="text"
                        placeholder="e.g. STU-2026-8910"
                        value={formData.studentId}
                        onChange={handleChange}
                        onBlur={() => handleBlur('studentId')}
                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                          touched.studentId && errors.studentId
                            ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                        }`}
                      />
                    </div>
                    {touched.studentId && errors.studentId && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.studentId}
                      </p>
                    )}
                  </div>
                </div>

                {/* University Email */}
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
                      placeholder="e.g. m.lin@university.edu"
                      value={formData.email}
                      onChange={handleChange}
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

                {/* Academic Department */}
                <div>
                  <label 
                    htmlFor="department" 
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Academic Department / School <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      onBlur={() => handleBlur('department')}
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-white text-slate-900 focus:outline-none transition-colors ${
                        touched.department && errors.department
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                      }`}
                    >
                      <option value="">Select your enrolled department...</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  {touched.department && errors.department && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Role Selection (Locked to Student) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Account Role (Public Enrollment)
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="roleStudent"
                        name="role"
                        value="STUDENT"
                        checked={true}
                        readOnly
                        className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <label htmlFor="roleStudent" className="text-xs font-semibold text-slate-800">
                        Student Account
                      </label>
                    </div>
                    <span className="text-[11px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded border border-teal-200">
                      Public Tier
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Administrative and Staff accounts must be provisioned through IT governance.
                  </p>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label 
                      htmlFor="password" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={handleChange}
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
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label 
                      htmlFor="confirmPassword" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={`w-full pl-9 pr-10 py-2 text-sm rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                          touched.confirmPassword && errors.confirmPassword
                            ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="pt-1">
                  <div className="flex items-start">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      onBlur={() => handleBlur('agreeTerms')}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="agreeTerms" className="ml-2 block text-xs text-slate-600 leading-normal">
                      I certify that I am an actively enrolled university student and agree to the institutional Acceptable Use Policy, Data Privacy Protocols, and Service Level Agreement.
                    </label>
                  </div>
                  {touched.agreeTerms && errors.agreeTerms && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.agreeTerms}
                    </p>
                  )}
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
                        Transmitting to Spring Boot Backend...
                      </>
                    ) : (
                      <>
                        Create Student Account
                        <ArrowRight className="w-4 h-4 text-teal-400" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6 text-center text-xs text-slate-600">
                <span>Already registered with CampusCare? </span>
                <Link
                  to="/login"
                  className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  Sign in here
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
