import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createExam } from '@/features/exams/examsSlice';

const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const SECTIONS = ['A','B','C','D','E'];
const EXAM_TYPES = [
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final', label: 'Final Exam' },
  { value: 'annual', label: 'Annual Exam' },
  { value: 'mock', label: 'Mock Exam' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'internal', label: 'Internal Assessment' },
];

function Field({ label, required, children }) {
  return <div><label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>{children}</div>;
}
function Input(props) {
  return <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />;
}
function Select({ options, ...props }) {
  return <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" {...props}><option value="">Select…</option>{options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}</select>;
}
function Card({ title, subtitle, children }) {
  return <div className="bg-white rounded-xl border"><div className="px-5 py-4 border-b"><h3 className="text-sm font-semibold text-gray-800">{title}</h3>{subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}</div><div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div></div>;
}

export default function AddExam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    examId: '', name: '', code: '', type: '', academicYear: '', term: '', description: '', status: 'draft',
    classAllocations: [{ class: '', sections: [] }],
    timetable: [{ date: '', subject: '', class: '', section: '', startTime: '', endTime: '', duration: 60, room: '', maxMarks: 100, passingMarks: 35 }],
  });

  const set = (path, value) => {
    setForm(prev => {
      const keys = path.split('.'); const next = { ...prev }; let cur = next;
      for (let i = 0; i < keys.length - 1; i++) { cur[keys[i]] = { ...cur[keys[i]] }; cur = cur[keys[i]]; }
      cur[keys[keys.length - 1]] = value; return next;
    });
  };

  const setTimetable = (idx, field, value) => {
    setForm(prev => { const t = [...prev.timetable]; t[idx] = { ...t[idx], [field]: value }; return { ...prev, timetable: t }; });
  };
  const addTimetableRow = () => setForm(prev => ({ ...prev, timetable: [...prev.timetable, { date: '', subject: '', class: '', section: '', startTime: '', endTime: '', duration: 60, room: '', maxMarks: 100, passingMarks: 35 }] }));
  const removeTimetableRow = idx => setForm(prev => ({ ...prev, timetable: prev.timetable.filter((_, i) => i !== idx) }));

  const setAllocation = (idx, field, value) => {
    setForm(prev => { const a = [...prev.classAllocations]; a[idx] = { ...a[idx], [field]: value }; return { ...prev, classAllocations: a }; });
  };
  const addAllocation = () => setForm(prev => ({ ...prev, classAllocations: [...prev.classAllocations, { class: '', sections: [] }] }));
  const removeAllocation = idx => setForm(prev => ({ ...prev, classAllocations: prev.classAllocations.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    setError('');
    if (!form.examId.trim()) return setError('Exam ID is required.');
    if (!form.name.trim()) return setError('Exam name is required.');
    if (!form.type) return setError('Exam type is required.');
    if (!form.academicYear.trim()) return setError('Academic year is required.');
    setSubmitting(true);
    try {
      const payload = { ...form, classAllocations: form.classAllocations.filter(a => a.class) };
      const result = await dispatch(createExam(payload));
      if (createExam.fulfilled.match(result)) navigate('/principal/exams');
      else setError(result.payload?.message || 'Failed to create exam.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/principal/exams')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div><h1 className="text-xl font-bold text-gray-900">Create New Examination</h1><p className="text-sm text-gray-400 mt-0.5">Set up exam details, timetable and class allocations</p></div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card title="Exam Details">
        <Field label="Exam ID" required><Input placeholder="e.g. EXAM-2025-001" value={form.examId} onChange={e => set('examId', e.target.value)} /></Field>
        <Field label="Exam Name" required><Input placeholder="e.g. Mid Term Examination" value={form.name} onChange={e => set('name', e.target.value)} /></Field>
        <Field label="Exam Code"><Input placeholder="e.g. MT-2025" value={form.code} onChange={e => set('code', e.target.value)} /></Field>
        <Field label="Exam Type" required><Select value={form.type} onChange={e => set('type', e.target.value)} options={EXAM_TYPES} /></Field>
        <Field label="Academic Year" required><Input placeholder="e.g. 2025-26" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} /></Field>
        <Field label="Term"><Input placeholder="e.g. Term 1, Q2" value={form.term} onChange={e => set('term', e.target.value)} /></Field>
        <Field label="Status"><Select value={form.status} onChange={e => set('status', e.target.value)} options={[{ value:'draft', label:'Draft' },{ value:'scheduled', label:'Scheduled' }]} /></Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Description"><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Exam description…" value={form.description} onChange={e => set('description', e.target.value)} /></Field>
        </div>
      </Card>

      {/* Class Allocations */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Class & Section Allocation</h3>
          <button onClick={addAllocation} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100">+ Add Class</button>
        </div>
        <div className="p-5 space-y-3">
          {form.classAllocations.map((alloc, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-xl border relative">
              {form.classAllocations.length > 1 && (
                <button onClick={() => removeAllocation(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              <Field label="Class" required><Select value={alloc.class} onChange={e => setAllocation(i, 'class', e.target.value)} options={CLASSES} /></Field>
              <div className="col-span-3">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Sections</label>
                <div className="flex flex-wrap gap-2">
                  {SECTIONS.map(s => (
                    <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={alloc.sections?.includes(s)} onChange={e => {
                        const secs = alloc.sections || [];
                        setAllocation(i, 'sections', e.target.checked ? [...secs, s] : secs.filter(x => x !== s));
                      }} className="rounded" />
                      <span className="font-medium text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Exam Timetable</h3>
          <button onClick={addTimetableRow} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100">+ Add Subject</button>
        </div>
        <div className="p-5 space-y-3">
          {form.timetable.map((row, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-xl border relative">
              {form.timetable.length > 1 && (
                <button onClick={() => removeTimetableRow(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              <Field label="Date"><Input type="date" value={row.date} onChange={e => setTimetable(i,'date',e.target.value)} /></Field>
              <Field label="Subject"><Input placeholder="e.g. Mathematics" value={row.subject} onChange={e => setTimetable(i,'subject',e.target.value)} /></Field>
              <Field label="Class"><Select value={row.class} onChange={e => setTimetable(i,'class',e.target.value)} options={CLASSES} /></Field>
              <Field label="Section"><Select value={row.section} onChange={e => setTimetable(i,'section',e.target.value)} options={SECTIONS} /></Field>
              <Field label="Start Time"><Input type="time" value={row.startTime} onChange={e => setTimetable(i,'startTime',e.target.value)} /></Field>
              <Field label="End Time"><Input type="time" value={row.endTime} onChange={e => setTimetable(i,'endTime',e.target.value)} /></Field>
              <Field label="Room"><Input placeholder="e.g. Room 101" value={row.room} onChange={e => setTimetable(i,'room',e.target.value)} /></Field>
              <Field label="Max Marks"><Input type="number" value={row.maxMarks} onChange={e => setTimetable(i,'maxMarks',+e.target.value)} /></Field>
              <Field label="Pass Marks"><Input type="number" value={row.passingMarks} onChange={e => setTimetable(i,'passingMarks',+e.target.value)} /></Field>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pb-6">
        <button onClick={() => navigate('/principal/exams')} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
          {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitting ? 'Saving…' : 'Create Examination'}
        </button>
      </div>
    </div>
  );
}
