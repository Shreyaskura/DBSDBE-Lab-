import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  Building2, 
  MapPin, 
  Layers, 
  FileText,
  Sparkles
} from 'lucide-react';
import { createComplaint } from '../../services/complaintService';

export default function RaiseComplaintPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    campusBlock: '',
    building: '',
    room: '',
  });

  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');

  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState(null);

  // Predefined Categories per specification
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

  // Campus Blocks
  const campusBlocks = [
    'Central Academic Quad',
    'Engineering & Science Quad',
    'North Campus Quad',
    'South Campus Quad',
    'Student Residential Quad',
    'Athletics & Recreation Zone',
  ];

  // Campus Buildings
  const buildings = [
    'Academic Complex Block A',
    'Academic Complex Block B',
    'Science & Engineering Research Wing',
    'Central University Library',
    'Computer Science & AI Centre',
    'Hostel Residence Block 1 (Men)',
    'Hostel Residence Block 2 (Men)',
    'Hostel Residence Block 3 (Women)',
    'Hostel Residence Block 4 (Women)',
    'Student Dining & Activity Commons',
    'Campus Transportation & Fleet Terminal',
  ];

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Complaint title is required.';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!formData.category) {
      errs.category = 'Please select a complaint category.';
    }

    if (!formData.campusBlock) {
      errs.campusBlock = 'Please select a campus block.';
    }

    if (!formData.building) {
      errs.building = 'Please select a campus building.';
    }

    if (!formData.room.trim()) {
      errs.room = 'Room number or specific location landmark is required.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Complaint description is required.';
    } else if (formData.description.trim().length < 20) {
      errs.description = 'Description must be at least 20 characters to provide sufficient context.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate();
    setErrors(validationErrors);
  };

  // Image Upload Handling
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageError('');

    if (!file) return;

    // Type validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Invalid image format. Supported formats: JPG, PNG, WEBP.');
      return;
    }

    // Size validation: max 5MB (5 * 1024 * 1024)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedImage(file);

    // Read and create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || imageError) {
      return;
    }

    setIsSubmitting(true);
    setSubmitNotice(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: `${formData.campusBlock}, ${formData.building}, Room ${formData.room.trim()}`,
        category: formData.category,
        imageUrl: imagePreview || null,
        priority: 'MEDIUM',
      };

      const result = await createComplaint(payload);

      setSubmitNotice({
        type: 'success',
        title: 'Complaint Registered Successfully',
        message: `Your complaint #${result.id} has been registered and permanently stored in MySQL. Priority will be recommended by our intelligent analysis system.`,
      });

      setTimeout(() => {
        navigate(`/student/complaints/${result.id}`);
      }, 1500);
    } catch (err) {
      setSubmitNotice({
        type: 'error',
        title: 'Submission Failed',
        message: err.response?.data?.message || err.message || 'Unable to submit complaint. Ensure backend service is reachable.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaints
        </Link>
        <span className="text-[11px] font-mono text-slate-400">
          Form Ref: STU-REQ-2026
        </span>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0f1c34] tracking-tight">
              Raise a Service Complaint
            </h1>
            <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-semibold px-2 py-0.5 rounded">
              Campus Service Request
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provide detailed information regarding the campus facility, equipment, or maintenance issue.
          </p>
        </div>

        {/* Success or Error Notice */}
        {submitNotice && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">{submitNotice.title}</span>
              <span className="mt-0.5 block leading-relaxed">{submitNotice.message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          
          {/* 1. Complaint Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Electrical short circuit in Physics Lab 102 workbench"
              value={formData.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              className={`w-full px-3.5 py-2 text-sm rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                touched.title && errors.title
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
              }`}
            />
            {touched.title && errors.title && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* 2. Complaint Category */}
          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Complaint Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              onBlur={() => handleBlur('category')}
              className={`w-full px-3 py-2 text-sm rounded-md border bg-white text-slate-900 focus:outline-none transition-colors ${
                touched.category && errors.category
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
              }`}
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {touched.category && errors.category && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.category}
              </p>
            )}
          </div>

          {/* 3. Location: Campus Block, Building, Room */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              3. Incident Location <span className="text-rose-500">*</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Campus Block */}
              <div>
                <label htmlFor="campusBlock" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Campus Block <span className="text-rose-500">*</span>
                </label>
                <select
                  id="campusBlock"
                  name="campusBlock"
                  value={formData.campusBlock}
                  onChange={handleChange}
                  onBlur={() => handleBlur('campusBlock')}
                  className={`w-full px-3 py-2 text-xs rounded-md border bg-white text-slate-900 focus:outline-none transition-colors ${
                    touched.campusBlock && errors.campusBlock
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                  }`}
                >
                  <option value="">Select block...</option>
                  {campusBlocks.map((block) => (
                    <option key={block} value={block}>{block}</option>
                  ))}
                </select>
                {touched.campusBlock && errors.campusBlock && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.campusBlock}</p>
                )}
              </div>

              {/* Building */}
              <div>
                <label htmlFor="building" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Building <span className="text-rose-500">*</span>
                </label>
                <select
                  id="building"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  onBlur={() => handleBlur('building')}
                  className={`w-full px-3 py-2 text-xs rounded-md border bg-white text-slate-900 focus:outline-none transition-colors ${
                    touched.building && errors.building
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                  }`}
                >
                  <option value="">Select building...</option>
                  {buildings.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {touched.building && errors.building && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.building}</p>
                )}
              </div>

              {/* Room Number */}
              <div>
                <label htmlFor="room" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Room / Specific Area <span className="text-rose-500">*</span>
                </label>
                <input
                  id="room"
                  name="room"
                  type="text"
                  placeholder="e.g. Room 204 or East Wing"
                  value={formData.room}
                  onChange={handleChange}
                  onBlur={() => handleBlur('room')}
                  className={`w-full px-3 py-2 text-xs rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    touched.room && errors.room
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                  }`}
                />
                {touched.room && errors.room && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.room}</p>
                )}
              </div>
            </div>
          </div>

          {/* 4. Priority Notice (Do not force students to determine technical priority) */}
          <div className="bg-[#0f1c34] text-white p-4 rounded-lg border border-slate-800 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                Automated Priority Assessment
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              Priority will be recommended by our intelligent complaint analysis system.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              CampusCare's AI triage engine analyzes the reported category, description text, and facility safety factors in real-time to assign an objective SLA priority.
            </p>
          </div>

          {/* 5. Complaint Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              5. Complaint Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide comprehensive details: what failed, when it started, any visible damage or error codes, and how it impacts campus operations..."
              value={formData.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              className={`w-full px-3.5 py-2.5 text-sm rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                touched.description && errors.description
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
              }`}
            />
            <div className="flex items-center justify-between mt-1 text-xs">
              {touched.description && errors.description ? (
                <p className="text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description}
                </p>
              ) : (
                <span className="text-slate-400">Minimum 20 characters required.</span>
              )}
              <span className="text-slate-400 font-mono text-[11px]">
                {formData.description.length} chars
              </span>
            </div>
          </div>

          {/* 6. Upload Supporting Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              6. Upload Supporting Image (Optional)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Attach a clear photograph of the defect or error code. Formats: JPG, PNG, WEBP (Max 5MB).
            </p>

            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-lg p-6 text-center cursor-pointer bg-slate-50 hover:bg-teal-50/20 transition-colors"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-2.5 rounded-full bg-white text-slate-500 border border-slate-200 shadow-2xs">
                    <Upload className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">Click to upload file</span>
                    <span className="text-xs text-slate-500"> or drag and drop</span>
                  </div>
                  <span className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 5MB</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            ) : (
              /* Image Preview Card */
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                    <img 
                      src={imagePreview} 
                      alt="Supporting visual attachment" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 truncate max-w-xs">
                      {selectedImage?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {(selectedImage?.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedImage?.type}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Image validated &amp; ready
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove Image
                </button>
              </div>
            )}

            {imageError && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {imageError}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/student/complaints')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Submitting to CampusCare...
                </>
              ) : (
                'Submit Service Request'
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
