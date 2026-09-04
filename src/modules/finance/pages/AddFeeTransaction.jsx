import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTransaction } from '@/features/finance/financeSlice';
import { fetchStudents } from '@/features/principal/studentSlice';

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

export default function AddFeeTransaction() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: students } = useSelector(s => s.principalStudents);
  const [studentSearch, setStudentSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    student: '', academicYear: '', feeType: 'tuition', amount: '', paymentMode: '', transactionRef: '', status: 'pending', dueDate: '', remarks: '',
  });

  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchStudents({ q: studentSearch, limit: 10 })), 300);
    return () => clearTimeout(t);
  }, [studentSearch, dispatch]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.student) return setError('Select a student.');
    if (!form.academicYear.trim()) return setError('Academic year is required.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a valid amount.');
    setSubmitting(true);
    const payload = {
      student: form.student,
      academicYear: form.academicYear.trim(),
      feeType: form.feeType,
      amount: Number(form.amount),
      paymentMode: form.paymentMode || null,
      transactionRef: form.transactionRef || null,
      status: form.status,
      dueDate: form.dueDate || null,
      remarks: form.remarks || null,
    };
    const result = await dispatch(createTransaction(payload));
    setSubmitting(false);
    if (createTransaction.fulfilled.match(result)) navigate('/principal/finance');
    else setError(result.payload?.message || 'Failed to record transaction.');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/principal/finance')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div><h1 className="text-xl font-bold text-gray-900">Record Fee Transaction</h1><p className="text-sm text-gray-400 mt-0.5">Log a payment, due amount, or refund for a student</p></div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card title="Transaction Details">
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Student" required>
            <Input placeholder="Search by name or admission no…" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
            {studentSearch && (
              <div className="mt-1 border rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                {students.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400">No matching students.</p>
                ) : students.map(st => (
                  <button
                    key={st._id}
                    onClick={() => { set('student', st._id); setStudentSearch(`${st.personal.firstName} ${st.personal.lastName} (${st.admissionNo})`); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${form.student === st._id ? 'bg-blue-50' : ''}`}
                  >
                    {st.personal.firstName} {st.personal.lastName} — {st.admissionNo} · {st.academic?.class}-{st.academic?.section}
                  </button>
                ))}
              </div>
            )}
          </Field>
        </div>
        <Field label="Academic Year" required><Input placeholder="e.g. 2026-27" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} /></Field>
        <Field label="Fee Type"><Select value={form.feeType} onChange={e => set('feeType', e.target.value)} options={['tuition', 'transport', 'hostel', 'exam', 'library', 'other']} /></Field>
        <Field label="Amount (₹)" required><Input type="number" placeholder="e.g. 15000" value={form.amount} onChange={e => set('amount', e.target.value)} /></Field>
        <Field label="Status"><Select value={form.status} onChange={e => set('status', e.target.value)} options={['paid', 'pending', 'partial', 'overdue', 'refunded']} /></Field>
        <Field label="Payment Mode"><Select value={form.paymentMode} onChange={e => set('paymentMode', e.target.value)} options={['cash', 'cheque', 'online', 'card', 'upi']} /></Field>
        <Field label="Transaction Ref"><Input placeholder="e.g. UPI ref / cheque no." value={form.transactionRef} onChange={e => set('transactionRef', e.target.value)} /></Field>
        <Field label="Due Date"><Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} /></Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Remarks"><Input placeholder="Optional notes" value={form.remarks} onChange={e => set('remarks', e.target.value)} /></Field>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-6">
        <button onClick={() => navigate('/principal/finance')} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
          {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitting ? 'Saving…' : 'Save Transaction'}
        </button>
      </div>
    </div>
  );
}