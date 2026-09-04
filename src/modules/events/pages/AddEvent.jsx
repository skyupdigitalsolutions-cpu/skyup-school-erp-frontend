import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createEvent, updateEvent, fetchEvent } from '@/features/events/eventsSlice';

const CATEGORIES = ['Cultural','Sports','Academic','Annual Day','Science Fair','Competition','Workshop','Seminar','Field Trip','Other'];

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

export default function AddEvent() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current } = useSelector((s) => s.events);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);
  const [form, setForm] = useState({
    eventId: '', name: '', code: '', category: '', description: '', academicYear: '', status: 'draft',
    schedule: { startDate: '', endDate: '' },
    venue: { hall: '', room: '', address: '', seatingCapacity: '' },
    organizer: { name: '', department: '', phone: '', email: '' },
    budget: { approved: '' },
  });

  useEffect(() => {
    if (isEdit) dispatch(fetchEvent(id));
  }, [dispatch, id, isEdit]);

  // Populate the form once the existing event has loaded (edit mode only).
  useEffect(() => {
    if (!isEdit || !current || current._id !== id) return;
    setForm({
      eventId: current.eventId || '', name: current.name || '', code: current.code || '',
      category: current.category || '', description: current.description || '',
      academicYear: current.academicYear || '', status: current.status || 'draft',
      schedule: {
        startDate: current.schedule?.startDate ? current.schedule.startDate.slice(0, 10) : '',
        endDate: current.schedule?.endDate ? current.schedule.endDate.slice(0, 10) : '',
      },
      venue: {
        hall: current.venue?.hall || '', room: current.venue?.room || '',
        address: current.venue?.address || '', seatingCapacity: current.venue?.seatingCapacity ?? '',
      },
      organizer: {
        name: current.organizer?.name || '', department: current.organizer?.department || '',
        phone: current.organizer?.phone || '', email: current.organizer?.email || '',
      },
      budget: { approved: current.budget?.approved ?? '' },
    });
    setLoaded(true);
  }, [current, id, isEdit]);

  const set = (path, value) => {
    setForm(prev => {
      const keys = path.split('.'); const next = { ...prev }; let cur = next;
      for (let i = 0; i < keys.length - 1; i++) { cur[keys[i]] = { ...cur[keys[i]] }; cur = cur[keys[i]]; }
      cur[keys[keys.length - 1]] = value; return next;
    });
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.eventId.trim()) return setError('Event ID is required.');
    if (!form.name.trim()) return setError('Event name is required.');
    if (!form.category) return setError('Category is required.');
    if (!form.academicYear.trim()) return setError('Academic year is required.');
    if (!form.schedule.startDate) return setError('Start date is required.');
    if (!form.schedule.endDate) return setError('End date is required.');
    if (!form.organizer.name.trim()) return setError('Organizer name is required.');

    setSubmitting(true);
    try {
      const payload = { ...form, venue: { ...form.venue, seatingCapacity: Number(form.venue.seatingCapacity) || 0 }, budget: { ...form.budget, approved: Number(form.budget.approved) || 0 } };
      const result = isEdit
        ? await dispatch(updateEvent({ id, payload }))
        : await dispatch(createEvent(payload));
      const success = isEdit ? updateEvent.fulfilled.match(result) : createEvent.fulfilled.match(result);
      if (success) navigate(isEdit ? `/principal/events/${id}` : '/principal/events');
      else setError(result.payload?.message || `Failed to ${isEdit ? 'update' : 'create'} event.`);
    } finally { setSubmitting(false); }
  };

  if (isEdit && !loaded) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-400">Loading event…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/principal/events')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div><h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Event' : 'Add New Event'}</h1><p className="text-sm text-gray-400 mt-0.5">{isEdit ? 'Update the event details below' : 'Fill in the event details below'}</p></div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card title="Event Information">
        <Field label="Event ID" required><Input placeholder="e.g. EVT-2025-001" value={form.eventId} onChange={e => set('eventId', e.target.value)} /></Field>
        <Field label="Event Name" required><Input placeholder="Annual Sports Day" value={form.name} onChange={e => set('name', e.target.value)} /></Field>
        <Field label="Event Code"><Input placeholder="e.g. ASD-2025" value={form.code} onChange={e => set('code', e.target.value)} /></Field>
        <Field label="Category" required><Select value={form.category} onChange={e => set('category', e.target.value)} options={CATEGORIES} /></Field>
        <Field label="Academic Year" required><Input placeholder="e.g. 2025-26" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} /></Field>
        <Field label="Status"><Select value={form.status} onChange={e => set('status', e.target.value)} options={['draft','pending_approval','approved']} /></Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Description">
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Event objectives and description…" value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Schedule">
        <Field label="Start Date" required><Input type="date" value={form.schedule.startDate} onChange={e => set('schedule.startDate', e.target.value)} /></Field>
        <Field label="End Date" required><Input type="date" value={form.schedule.endDate} onChange={e => set('schedule.endDate', e.target.value)} /></Field>
      </Card>

      <Card title="Venue">
        <Field label="Hall / Venue Name"><Input placeholder="e.g. Main Auditorium" value={form.venue.hall} onChange={e => set('venue.hall', e.target.value)} /></Field>
        <Field label="Room No"><Input placeholder="e.g. Ground Floor" value={form.venue.room} onChange={e => set('venue.room', e.target.value)} /></Field>
        <Field label="Seating Capacity"><Input type="number" placeholder="500" value={form.venue.seatingCapacity} onChange={e => set('venue.seatingCapacity', e.target.value)} /></Field>
        <div className="sm:col-span-2 lg:col-span-3"><Field label="Address"><Input placeholder="Venue address" value={form.venue.address} onChange={e => set('venue.address', e.target.value)} /></Field></div>
      </Card>

      <Card title="Organizer">
        <Field label="Organizer Name" required><Input placeholder="Full name" value={form.organizer.name} onChange={e => set('organizer.name', e.target.value)} /></Field>
        <Field label="Department"><Input placeholder="e.g. Sports Department" value={form.organizer.department} onChange={e => set('organizer.department', e.target.value)} /></Field>
        <Field label="Phone"><Input placeholder="+91 98765 43210" value={form.organizer.phone} onChange={e => set('organizer.phone', e.target.value)} /></Field>
        <Field label="Email"><Input type="email" value={form.organizer.email} onChange={e => set('organizer.email', e.target.value)} /></Field>
      </Card>

      <Card title="Budget">
        <Field label="Approved Budget (₹)"><Input type="number" placeholder="50000" value={form.budget.approved} onChange={e => set('budget.approved', e.target.value)} /></Field>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-6">
        <button onClick={() => navigate('/principal/events')} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
          {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitting ? 'Saving…' : isEdit ? 'Update Event' : 'Save Event'}
        </button>
      </div>
    </div>
  );
}
