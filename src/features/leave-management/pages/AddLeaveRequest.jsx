import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createLeaveRequest } from '@/features/leave-management/leaveSlice';
import { fetchTeachers } from '@/features/principal/teacherSlice';
import { fetchCaretakers } from '@/features/caretaker/caretakerSlice';

function Field({ label, required, children }) {
  return <div><label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>{children}</div>;
}
function Input(props) {
  return <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />;
}
function Select({ options, ...props }) {
  return <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" {...props}><option value="">Select…</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
}
function Card({ title, children }) {
  return <div className="bg-white rounded-xl border"><div className="px-5 py-4 border-b"><h3 className="text-sm font-semibold text-gray-800">{title}</h3></div><div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div></div>;
}

function daysBetween(from, to) {
  if (!from || !to) return '';
  const a = new Date(from), b = new Date(to);
  if (b < a) return '';
  return Math.round((b - a) / 86400000) + 1;
}

export default function AddLeaveRequest() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: teachers } = useSelector(s => s.principalTeachers);
  const { list: caretakers } = useSelector(s => s.caretaker);
  const [applicantSearch, setApplicantSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    applicantType: 'teacher', applicant: '', leaveType: 'casual', fromDate: '', toDate: '', reason: '',
  });

  useEffect(() => {
    if (!applicantSearch) return;
    const t = setTimeout(() => {
      if (form.applicantType === 'teacher') dispatch(fetchTeachers({ q: applicantSearch, limit: 10 }));
      else dispatch(fetchCaretakers({ q: applicantSearch, limit: 10 }));
    }, 300);
    return () => clearTimeout(t);
  }, [applicantSearch, form.applicantType, dispatch]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const candidates = form.applicantType === 'teacher' ? teachers : caretakers;

  const handleSubmit = async () => {
    setError('');
    if (!form.applicant) return setError('Select an applicant.');
    if (!form.fromDate || !form.toDate) return setError('Both dates are required.');
    if (!form.reason.trim()) return setError('Reason is required.');
    setSubmitting(true);
    const payload = {
      applicantType: form.applicantType,
      applicant: form.applicant,
      leaveType: form.leaveType,
      fromDate: form.fromDate,
      toDate: form.toDate,
      reason: form.reason.trim(),
    };
    const result = await dispatch(createLeaveRequest(payload));
    setSubmitting(false);
    if (createLeaveRequest.fulfilled.match(result)) navigate('/principal/leave-management');
    else setError(result.payload?.message || 'Failed to submit leave request.');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/principal/leave-management')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div><h1 className="text-xl font-bold text-gray-900">Log Leave Request</h1><p className="text-sm text-gray-400 mt-0.5">Record a leave request for a teacher or caretaker</p></div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card title="Applicant">
        <Field label="Staff Type" required>
          <Select
            value={form.applicantType}
            onChange={e => { set('applicantType', e.target.value); set('applicant', ''); setApplicantSearch(''); }}
            options={['teacher', 'caretaker']}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Search Staff" required>
            <Input placeholder="Search by name…" value={applicantSearch} onChange={e => setApplicantSearch(e.target.value)} />
            {applicantSearch && (
              <div className="mt-1 border rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                {candidates.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400">No matching staff.</p>
                ) : candidates.map(c => (
                  <button
                    key={c._id}
                    onClick={() => { set('applicant', c._id); setApplicantSearch(`${c.personal.firstName} ${c.personal.lastName}`); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${form.applicant === c._id ? 'bg-blue-50' : ''}`}
                  >
                    {c.personal.firstName} {c.personal.lastName}
                  </button>
                ))}
              </div>
            )}
          </Field>
        </div>
      </Card>

      <Card title="Leave Details">
        <Field label="Leave Type" required>
          <Select value={form.leaveType} onChange={e => set('leaveType', e.target.value)} options={['sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid', 'other']} />
        </Field>
        <Field label="From Date" required><Input type="date" value={form.fromDate} onChange={e => set('fromDate', e.target.value)} /></Field>
        <Field label="To Date" required><Input type="date" value={form.toDate} onChange={e => set('toDate', e.target.value)} /></Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-xs text-gray-500">
            {daysBetween(form.fromDate, form.toDate) !== '' ? `${daysBetween(form.fromDate, form.toDate)} day(s) requested` : ''}
          </p>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Reason" required><Input placeholder="Reason for leave" value={form.reason} onChange={e => set('reason', e.target.value)} /></Field>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-6">
        <button onClick={() => navigate('/principal/leave-management')} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
          {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </div>
  );
}