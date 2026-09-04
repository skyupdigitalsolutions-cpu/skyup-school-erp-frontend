import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createStudent, addStudentDocument } from '@/features/principal/studentSlice';
import { uploadFiles } from '@/lib/upload';

const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const SECTIONS = ['A','B','C','D','E'];
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const GENDERS = ['male','female','other'];
const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'transferred', label: 'Transferred' },
];
const DOCUMENT_TYPES = [
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'transfer_certificate', label: 'Transfer Certificate' },
  { value: 'aadhar_card', label: 'Aadhar Card' },
  { value: 'photo', label: 'Photograph' },
  { value: 'marksheet', label: 'Previous Marksheet' },
  { value: 'other', label: 'Other' },
];

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      {...props}
    />
  );
}

function Select({ options, placeholder, ...props }) {
  return (
    <select
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      {...props}
    >
      <option value="">{placeholder || 'Select…'}</option>
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function AddStudent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── Document upload staging (files are uploaded immediately; attached to
  // the student record right after the student itself is created) ───────────
  const [stagedDocuments, setStagedDocuments] = useState([]);
  const [docType, setDocType] = useState('birth_certificate');
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState('');

  const [form, setForm] = useState({
    admissionNo: '',
    rollNo: '',
    status: 'active',
    personal: {
      firstName: '', lastName: '', dateOfBirth: '', gender: '',
      bloodGroup: '', nationality: '', religion: '',
      phone: '', email: '',
      address: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
    },
    academic: {
      academicYear: '', class: '', section: '', house: '',
      admissionDate: new Date().toISOString().split('T')[0],
    },
    parent: {
      father: { name: '', phone: '', email: '', occupation: '' },
      mother: { name: '', phone: '', email: '', occupation: '' },
      primaryContact: 'father',
    },
    transport: { enrolled: false, routeNo: '', stopName: '', vehicleNo: '' },
    hostel: { enrolled: false, hostelName: '', roomNo: '' },
    medical: { allergies: '', conditions: '', medications: '', emergencyContact: '', notes: '' },
  });

  // Generic deep setter: set('personal.firstName', val)
  const set = (path, value) => {
    setForm((prev) => {
      const keys = path.split('.');
      const next = { ...prev };
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleAddDocument = async () => {
    setDocError('');
    if (!docFile) return setDocError('Choose a file first.');
    if (!docName.trim()) return setDocError('Give the document a name.');
    setDocUploading(true);
    try {
      const [uploaded] = await uploadFiles([docFile]);
      setStagedDocuments((prev) => [...prev, { name: docName.trim(), type: docType, url: uploaded.url, originalName: uploaded.originalName }]);
      setDocName('');
      setDocFile(null);
      const fileInput = document.getElementById('student-doc-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setDocError(err.message || 'Failed to upload document.');
    } finally {
      setDocUploading(false);
    }
  };

  const handleRemoveDocument = (index) => {
    setStagedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.admissionNo.trim()) return setError('Admission number is required.');
    if (!form.personal.firstName.trim()) return setError('First name is required.');
    if (!form.personal.lastName.trim()) return setError('Last name is required.');
    if (!form.academic.academicYear.trim()) return setError('Academic year is required.');
    if (!form.academic.class) return setError('Class is required.');
    if (!form.academic.section) return setError('Section is required.');

    // Convert comma-separated medical fields to arrays
    const payload = {
      ...form,
      medical: {
        ...form.medical,
        allergies: form.medical.allergies ? form.medical.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        conditions: form.medical.conditions ? form.medical.conditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        medications: form.medical.medications ? form.medical.medications.split(',').map((s) => s.trim()).filter(Boolean) : [],
      },
    };

    setSubmitting(true);
    try {
      const result = await dispatch(createStudent(payload));
      if (createStudent.fulfilled.match(result)) {
        const newStudentId = result.payload._id;
        // Attach any documents staged during the form (upload already happened;
        // this just links the already-hosted URL to the new student record).
        for (const doc of stagedDocuments) {
          await dispatch(addStudentDocument({ id: newStudentId, document: { name: doc.name, type: doc.type, url: doc.url } }));
        }
        navigate('/principal/students');
      } else {
        setError(result.payload?.message || 'Failed to create student.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/principal/students')}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-sm text-gray-400 mt-0.5">Fill in the details below to register a new student</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Identity ── */}
      <SectionCard title="Basic Information" subtitle="Admission details and status">
        <Field label="Admission No" required>
          <Input placeholder="e.g. ADM-2025-001" value={form.admissionNo} onChange={(e) => set('admissionNo', e.target.value)} />
        </Field>
        {form.status !== 'new' && (
          <Field label="Roll No">
            <Input placeholder="e.g. 42" value={form.rollNo} onChange={(e) => set('rollNo', e.target.value)} />
          </Field>
        )}
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            options={STATUSES}
          />
        </Field>
      </SectionCard>

      {/* ── Personal ── */}
      <SectionCard title="Personal Information">
        <Field label="First Name" required>
          <Input placeholder="First name" value={form.personal.firstName} onChange={(e) => set('personal.firstName', e.target.value)} />
        </Field>
        <Field label="Last Name" required>
          <Input placeholder="Last name" value={form.personal.lastName} onChange={(e) => set('personal.lastName', e.target.value)} />
        </Field>
        <Field label="Date of Birth">
          <Input type="date" value={form.personal.dateOfBirth} onChange={(e) => set('personal.dateOfBirth', e.target.value)} />
        </Field>
        <Field label="Gender">
          <Select value={form.personal.gender} onChange={(e) => set('personal.gender', e.target.value)} options={GENDERS} />
        </Field>
        <Field label="Blood Group">
          <Select value={form.personal.bloodGroup} onChange={(e) => set('personal.bloodGroup', e.target.value)} options={BLOOD_GROUPS} />
        </Field>
        <Field label="Nationality">
          <Input placeholder="e.g. Indian" value={form.personal.nationality} onChange={(e) => set('personal.nationality', e.target.value)} />
        </Field>
        <Field label="Religion">
          <Input placeholder="e.g. Hindu" value={form.personal.religion} onChange={(e) => set('personal.religion', e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input placeholder="+91 98765 43210" value={form.personal.phone} onChange={(e) => set('personal.phone', e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" placeholder="student@email.com" value={form.personal.email} onChange={(e) => set('personal.email', e.target.value)} />
        </Field>
      </SectionCard>

      {/* ── Address ── */}
      <SectionCard title="Address">
        <Field label="Address Line 1">
          <Input placeholder="House / Flat no., Street" value={form.personal.address.line1} onChange={(e) => set('personal.address.line1', e.target.value)} />
        </Field>
        <Field label="Address Line 2">
          <Input placeholder="Area / Locality" value={form.personal.address.line2} onChange={(e) => set('personal.address.line2', e.target.value)} />
        </Field>
        <Field label="City">
          <Input placeholder="City" value={form.personal.address.city} onChange={(e) => set('personal.address.city', e.target.value)} />
        </Field>
        <Field label="State">
          <Input placeholder="State" value={form.personal.address.state} onChange={(e) => set('personal.address.state', e.target.value)} />
        </Field>
        <Field label="Pincode">
          <Input placeholder="560001" value={form.personal.address.pincode} onChange={(e) => set('personal.address.pincode', e.target.value)} />
        </Field>
        <Field label="Country">
          <Input placeholder="India" value={form.personal.address.country} onChange={(e) => set('personal.address.country', e.target.value)} />
        </Field>
      </SectionCard>

      {/* ── Academic ── */}
      <SectionCard title="Academic Details" subtitle="Class, section and year">
        <Field label="Academic Year" required>
          <Input placeholder="e.g. 2025-26" value={form.academic.academicYear} onChange={(e) => set('academic.academicYear', e.target.value)} />
        </Field>
        <Field label="Class" required>
          <Select value={form.academic.class} onChange={(e) => set('academic.class', e.target.value)} options={CLASSES} />
        </Field>
        <Field label="Section" required>
          <Select value={form.academic.section} onChange={(e) => set('academic.section', e.target.value)} options={SECTIONS} />
        </Field>
        <Field label="House">
          <Input placeholder="e.g. Blue House" value={form.academic.house} onChange={(e) => set('academic.house', e.target.value)} />
        </Field>
        <Field label="Admission Date">
          <Input type="date" value={form.academic.admissionDate} onChange={(e) => set('academic.admissionDate', e.target.value)} />
        </Field>
      </SectionCard>

      {/* ── Parent ── */}
      <SectionCard title="Father's Details">
        <Field label="Father's Name">
          <Input placeholder="Full name" value={form.parent.father.name} onChange={(e) => set('parent.father.name', e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input placeholder="+91 98765 43210" value={form.parent.father.phone} onChange={(e) => set('parent.father.phone', e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" placeholder="father@email.com" value={form.parent.father.email} onChange={(e) => set('parent.father.email', e.target.value)} />
        </Field>
        <Field label="Occupation">
          <Input placeholder="e.g. Engineer" value={form.parent.father.occupation} onChange={(e) => set('parent.father.occupation', e.target.value)} />
        </Field>
      </SectionCard>

      <SectionCard title="Mother's Details">
        <Field label="Mother's Name">
          <Input placeholder="Full name" value={form.parent.mother.name} onChange={(e) => set('parent.mother.name', e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input placeholder="+91 98765 43210" value={form.parent.mother.phone} onChange={(e) => set('parent.mother.phone', e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" placeholder="mother@email.com" value={form.parent.mother.email} onChange={(e) => set('parent.mother.email', e.target.value)} />
        </Field>
        <Field label="Occupation">
          <Input placeholder="e.g. Teacher" value={form.parent.mother.occupation} onChange={(e) => set('parent.mother.occupation', e.target.value)} />
        </Field>
      </SectionCard>

      {/* ── Transport & Hostel ── */}
      <SectionCard title="Transport & Hostel">
        <Field label="Transport Enrolled">
          <Select
            value={form.transport.enrolled ? 'yes' : 'no'}
            onChange={(e) => set('transport.enrolled', e.target.value === 'yes')}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          />
        </Field>
        {form.transport.enrolled && (
          <>
            <Field label="Route No">
              <Input placeholder="e.g. R-12" value={form.transport.routeNo} onChange={(e) => set('transport.routeNo', e.target.value)} />
            </Field>
            <Field label="Stop Name">
              <Input placeholder="e.g. MG Road" value={form.transport.stopName} onChange={(e) => set('transport.stopName', e.target.value)} />
            </Field>
            <Field label="Vehicle No">
              <Input placeholder="e.g. KA-01-AB-1234" value={form.transport.vehicleNo} onChange={(e) => set('transport.vehicleNo', e.target.value)} />
            </Field>
          </>
        )}
        <Field label="Hostel Enrolled">
          <Select
            value={form.hostel.enrolled ? 'yes' : 'no'}
            onChange={(e) => set('hostel.enrolled', e.target.value === 'yes')}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          />
        </Field>
        {form.hostel.enrolled && (
          <>
            <Field label="Hostel Name">
              <Input placeholder="e.g. Boys Hostel A" value={form.hostel.hostelName} onChange={(e) => set('hostel.hostelName', e.target.value)} />
            </Field>
            <Field label="Room No">
              <Input placeholder="e.g. 204" value={form.hostel.roomNo} onChange={(e) => set('hostel.roomNo', e.target.value)} />
            </Field>
          </>
        )}
      </SectionCard>

      {/* ── Medical ── */}
      <SectionCard title="Medical Information" subtitle="Comma-separate multiple entries">
        <Field label="Allergies">
          <Input placeholder="e.g. Peanuts, Dust" value={form.medical.allergies} onChange={(e) => set('medical.allergies', e.target.value)} />
        </Field>
        <Field label="Medical Conditions">
          <Input placeholder="e.g. Asthma, Diabetes" value={form.medical.conditions} onChange={(e) => set('medical.conditions', e.target.value)} />
        </Field>
        <Field label="Medications">
          <Input placeholder="e.g. Inhaler" value={form.medical.medications} onChange={(e) => set('medical.medications', e.target.value)} />
        </Field>
        <Field label="Emergency Contact">
          <Input placeholder="+91 98765 43210" value={form.medical.emergencyContact} onChange={(e) => set('medical.emergencyContact', e.target.value)} />
        </Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Notes">
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              placeholder="Any additional medical notes..."
              value={form.medical.notes}
              onChange={(e) => set('medical.notes', e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Documents ── */}
      <SectionCard title="Documents" subtitle="Upload required documents (PDF, JPG, PNG, DOC — max 5MB each)">
        <Field label="Document Type">
          <Select value={docType} onChange={(e) => setDocType(e.target.value)} options={DOCUMENT_TYPES} />
        </Field>
        <Field label="Document Name">
          <Input placeholder="e.g. Birth Certificate" value={docName} onChange={(e) => setDocName(e.target.value)} />
        </Field>
        <Field label="File">
          <input
            id="student-doc-file-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </Field>

        <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between">
          {docError && <p className="text-sm text-red-600">{docError}</p>}
          <button
            type="button"
            onClick={handleAddDocument}
            disabled={docUploading}
            className="ml-auto px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-60 flex items-center gap-2"
          >
            {docUploading && <span className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />}
            {docUploading ? 'Uploading…' : '+ Add Document'}
          </button>
        </div>

        {stagedDocuments.length > 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
              {stagedDocuments.map((doc, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm bg-white">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label || doc.type} · {doc.originalName}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveDocument(i)} className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50 shrink-0 ml-3">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SectionCard>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          onClick={() => navigate('/principal/students')}
          className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitting ? 'Saving…' : 'Save Student'}
        </button>
      </div>
    </div>
  );
}