import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createClass, updateClass, fetchClass } from '@/features/classes/classSlice';

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

export default function AddClass() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', academicYear: '', sections: '', subjects: '', capacity: 40, status: 'active',
  });

  useEffect(() => {
    if (!isEdit) return;
    dispatch(fetchClass(id)).then((res) => {
      if (res.payload) {
        const c = res.payload;
        setForm({
          name: c.name || '',
          academicYear: c.academicYear || '',
          sections: (c.sections || []).join(', '),
          subjects: (c.subjects || []).join(', '),
          capacity: c.capacity ?? 40,
          status: c.status || 'active',
        });
      }
    });
  }, [id, isEdit, dispatch]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) return setError('Class name is required.');
    if (!form.academicYear.trim()) return setError('Academic year is required.');
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      academicYear: form.academicYear.trim(),
      sections: form.sections.split(',').map(s => s.trim()).filter(Boolean),
      subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
      capacity: Number(form.capacity) || 0,
      status: form.status,
    };
    try {
      const action = isEdit ? updateClass({ id, payload }) : createClass(payload);
      const result = await dispatch(action);
      const isOk = isEdit ? updateClass.fulfilled.match(result) : createClass.fulfilled.match(result);
      if (isOk) navigate('/principal/classes');
      else setError(result.payload?.message || 'Failed to save class.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/principal/classes')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div><h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Class' : 'Add New Class'}</h1><p className="text-sm text-gray-400 mt-0.5">Define a class, its sections and subjects</p></div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card title="Class Details">
        <Field label="Class Name" required><Input placeholder="e.g. 10" value={form.name} onChange={e => set('name', e.target.value)} /></Field>
        <Field label="Academic Year" required><Input placeholder="e.g. 2026-27" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} /></Field>
        <Field label="Status"><Select value={form.status} onChange={e => set('status', e.target.value)} options={['active', 'inactive']} /></Field>
        <Field label="Sections (comma separated)"><Input placeholder="e.g. A, B, C" value={form.sections} onChange={e => set('sections', e.target.value)} /></Field>
        <Field label="Subjects (comma separated)"><Input placeholder="e.g. Maths, Science, English" value={form.subjects} onChange={e => set('subjects', e.target.value)} /></Field>
        <Field label="Capacity"><Input type="number" placeholder="e.g. 40" value={form.capacity} onChange={e => set('capacity', e.target.value)} /></Field>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-6">
        <button onClick={() => navigate('/principal/classes')} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
          {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitting ? 'Saving…' : 'Save Class'}
        </button>
      </div>
    </div>
  );
}