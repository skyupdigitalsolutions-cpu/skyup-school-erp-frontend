import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTeacher } from '@/features/principal/teacherSlice';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const GENDERS = ['male','female','other'];
const DEPARTMENTS = [
  'Mathematics','Science','English','Social Studies',
  'Computer Science','Physical Education','Arts','Music',
  'Hindi','Commerce','Biology','Physics','Chemistry',
];
const DESIGNATIONS = [
  'PGT','TGT','PRT','Head of Department','Vice Principal',
  'Lab Assistant','Sports Coach','Librarian','Counsellor',
];
const EMPLOYMENT_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'visiting', label: 'Visiting' },
];

function Field({ label, required, children, span }) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : span === 3 ? 'sm:col-span-2 lg:col-span-3' : ''}>
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
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

export default function AddTeacher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    employeeId: '',
    status: 'active',
    personal: {
      firstName: '', lastName: '', dateOfBirth: '', gender: '',
      bloodGroup: '', nationality: '',
      phone: '', email: '',
      emergencyContact: { name: '', phone: '', relation: '' },
      address: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
    },
    professional: {
      department: '', designation: '',
      employmentType: 'permanent',
      joiningDate: new Date().toISOString().split('T')[0],
      experienceYears: 0,
    },
    qualifications: [{ degree: '', specialization: '', institution: '', yearOfPassing: '', grade: '' }],
    payroll: {
      basicSalary: '', grossSalary: '',
      bankName: '', accountNo: '', ifscCode: '',
    },
  });

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

  const setQual = (index, field, value) => {
    setForm((prev) => {
      const quals = [...prev.qualifications];
      quals[index] = { ...quals[index], [field]: value };
      return { ...prev, qualifications: quals };
    });
  };

  const addQual = () => {
    setForm((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: '', specialization: '', institution: '', yearOfPassing: '', grade: '' }],
    }));
  };

  const removeQual = (index) => {
    setForm((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.employeeId.trim()) return setError('Employee ID is required.');
    if (!form.personal.firstName.trim()) return setError('First name is required.');
    if (!form.personal.lastName.trim()) return setError('Last name is required.');
    if (!form.personal.phone.trim()) return setError('Phone number is required.');
    if (!form.personal.email.trim()) return setError('Email is required.');
    if (!form.professional.department) return setError('Department is required.');
    if (!form.professional.designation) return setError('Designation is required.');

    const payload = {
      ...form,
      payroll: {
        ...form.payroll,
        basicSalary: Number(form.payroll.basicSalary) || 0,
        grossSalary: Number(form.payroll.grossSalary) || 0,
      },
      professional: {
        ...form.professional,
        experienceYears: Number(form.professional.experienceYears) || 0,
      },
      qualifications: form.qualifications.filter((q) => q.degree.trim()),
    };

    setSubmitting(true);
    try {
      const result = await dispatch(createTeacher(payload));
      if (createTeacher.fulfilled.match(result)) {
        navigate('/principal/teachers');
      } else {
        setError(result.payload?.message || 'Failed to create teacher.');
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
          onClick={() => navigate('/principal/teachers')}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add New Teacher</h1>
          <p className="text-sm text-gray-400 mt-0.5">Fill in the details below to register a new teacher</p>
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
      <SectionCard title="Basic Information">
        <Field label="Employee ID" required>
          <Input placeholder="e.g. EMP-2025-001" value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)} />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            options={['active','inactive','on_leave']}
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
        <Field label="Phone" required>
          <Input placeholder="+91 98765 43210" value={form.personal.phone} onChange={(e) => set('personal.phone', e.target.value)} />
        </Field>
        <Field label="Email" required>
          <Input type="email" placeholder="teacher@school.com" value={form.personal.email} onChange={(e) => set('personal.email', e.target.value)} />
        </Field>
      </SectionCard>

      {/* ── Emergency Contact ── */}
      <SectionCard title="Emergency Contact">
        <Field label="Contact Name">
          <Input placeholder="Full name" value={form.personal.emergencyContact.name} onChange={(e) => set('personal.emergencyContact.name', e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input placeholder="+91 98765 43210" value={form.personal.emergencyContact.phone} onChange={(e) => set('personal.emergencyContact.phone', e.target.value)} />
        </Field>
        <Field label="Relation">
          <Input placeholder="e.g. Spouse, Parent" value={form.personal.emergencyContact.relation} onChange={(e) => set('personal.emergencyContact.relation', e.target.value)} />
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
          <Input value={form.personal.address.country} onChange={(e) => set('personal.address.country', e.target.value)} />
        </Field>
      </SectionCard>

      {/* ── Professional ── */}
      <SectionCard title="Professional Details">
        <Field label="Department" required>
          <Select value={form.professional.department} onChange={(e) => set('professional.department', e.target.value)} options={DEPARTMENTS} />
        </Field>
        <Field label="Designation" required>
          <Select value={form.professional.designation} onChange={(e) => set('professional.designation', e.target.value)} options={DESIGNATIONS} />
        </Field>
        <Field label="Employment Type">
          <Select value={form.professional.employmentType} onChange={(e) => set('professional.employmentType', e.target.value)} options={EMPLOYMENT_TYPES} />
        </Field>
        <Field label="Joining Date">
          <Input type="date" value={form.professional.joiningDate} onChange={(e) => set('professional.joiningDate', e.target.value)} />
        </Field>
        <Field label="Experience (Years)">
          <Input type="number" min="0" placeholder="0" value={form.professional.experienceYears} onChange={(e) => set('professional.experienceYears', e.target.value)} />
        </Field>
      </SectionCard>

      {/* ── Qualifications ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Qualifications</h3>
            <p className="text-xs text-gray-400 mt-0.5">Academic degrees and certifications</p>
          </div>
          <button
            onClick={addQual}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition"
          >
            + Add More
          </button>
        </div>
        <div className="p-5 space-y-4">
          {form.qualifications.map((q, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border relative">
              {form.qualifications.length > 1 && (
                <button
                  onClick={() => removeQual(i)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <Field label="Degree" required>
                <Input placeholder="e.g. B.Ed, M.Sc" value={q.degree} onChange={(e) => setQual(i, 'degree', e.target.value)} />
              </Field>
              <Field label="Specialization">
                <Input placeholder="e.g. Mathematics" value={q.specialization} onChange={(e) => setQual(i, 'specialization', e.target.value)} />
              </Field>
              <Field label="Institution">
                <Input placeholder="University / College" value={q.institution} onChange={(e) => setQual(i, 'institution', e.target.value)} />
              </Field>
              <Field label="Year of Passing">
                <Input type="number" placeholder="2020" value={q.yearOfPassing} onChange={(e) => setQual(i, 'yearOfPassing', e.target.value)} />
              </Field>
              <Field label="Grade / Percentage">
                <Input placeholder="e.g. First Class / 78%" value={q.grade} onChange={(e) => setQual(i, 'grade', e.target.value)} />
              </Field>
            </div>
          ))}
        </div>
      </div>

      {/* ── Payroll ── */}
      <SectionCard title="Payroll Details" subtitle="Salary and bank information">
        <Field label="Basic Salary (₹)">
          <Input type="number" min="0" placeholder="0" value={form.payroll.basicSalary} onChange={(e) => set('payroll.basicSalary', e.target.value)} />
        </Field>
        <Field label="Gross Salary (₹)">
          <Input type="number" min="0" placeholder="0" value={form.payroll.grossSalary} onChange={(e) => set('payroll.grossSalary', e.target.value)} />
        </Field>
        <Field label="Bank Name">
          <Input placeholder="e.g. SBI, HDFC" value={form.payroll.bankName} onChange={(e) => set('payroll.bankName', e.target.value)} />
        </Field>
        <Field label="Account No">
          <Input placeholder="Account number" value={form.payroll.accountNo} onChange={(e) => set('payroll.accountNo', e.target.value)} />
        </Field>
        <Field label="IFSC Code">
          <Input placeholder="e.g. SBIN0001234" value={form.payroll.ifscCode} onChange={(e) => set('payroll.ifscCode', e.target.value)} />
        </Field>
      </SectionCard>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          onClick={() => navigate('/principal/teachers')}
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
          {submitting ? 'Saving…' : 'Save Teacher'}
        </button>
      </div>
    </div>
  );
}
