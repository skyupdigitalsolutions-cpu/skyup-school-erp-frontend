import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCaretaker } from '@/features/caretaker/caretakerSlice';

function Field({ label, required, children }) {
  return <div><label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>{children}</div>;
}
function Input(props) {
  return <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />;
}
function Select({ options, ...props }) {
  return <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" {...props}><option value="">Select…</option>{options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}</select>;
}
function Card({ title, children }) {
  return <div className="bg-white rounded-xl border"><div className="px-5 py-4 border-b"><h3 className="text-sm font-semibold text-gray-800">{title}</h3></div><div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div></div>;
}

export default function AddCaretaker() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    caretakerId: '', employmentType: 'full_time', status: 'active',
    personal: { firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '', relationship: '', phone: '', email: '', address: { line1: '', city: '', state: '', pincode: '', country: 'India' }, emergencyContact: { name: '', phone: '', relation: '' } },
    vehicleDetails: { vehicleNumber: '', model: '', route: '', capacity: '' },
  });

  const set = (path, value) => {
    setForm(prev => {
      const keys = path.split('.'); const next = { ...prev }; let cur = next;
      for (let i = 0; i < keys.length - 1; i++) { cur[keys[i]] = { ...cur[keys[i]] }; cur = cur[keys[i]]; }
      cur[keys[keys.length - 1]] = value; return next;
    });
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.caretakerId.trim()) return setError('Caretaker ID is required.');
    if (!form.personal.firstName.trim()) return setError('First name is required.');
    if (!form.personal.phone.trim()) return setError('Phone is required.');
    setSubmitting(true);
    try {
      const result = await dispatch(createCaretaker({ ...form, vehicleDetails: { ...form.vehicleDetails, capacity: Number(form.vehicleDetails.capacity) || 0 } }));
      if (createCaretaker.fulfilled.match(result)) navigate('/principal/caretakers');
      else setError(result.payload?.message || 'Failed to create caretaker.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/principal/caretakers')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div><h1 className="text-xl font-bold text-gray-900">Add New Caretaker</h1><p className="text-sm text-gray-400 mt-0.5">Register a new caretaker or driver</p></div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card title="Basic Information">
        <Field label="Caretaker ID" required><Input placeholder="e.g. CTK-001" value={form.caretakerId} onChange={e => set('caretakerId', e.target.value)} /></Field>
        <Field label="Employment Type"><Select value={form.employmentType} onChange={e => set('employmentType', e.target.value)} options={['full_time','part_time','contract','volunteer']} /></Field>
        <Field label="Status"><Select value={form.status} onChange={e => set('status', e.target.value)} options={['active','inactive']} /></Field>
      </Card>

      <Card title="Personal Information">
        <Field label="First Name" required><Input placeholder="First name" value={form.personal.firstName} onChange={e => set('personal.firstName', e.target.value)} /></Field>
        <Field label="Last Name"><Input placeholder="Last name" value={form.personal.lastName} onChange={e => set('personal.lastName', e.target.value)} /></Field>
        <Field label="Date of Birth"><Input type="date" value={form.personal.dateOfBirth} onChange={e => set('personal.dateOfBirth', e.target.value)} /></Field>
        <Field label="Gender"><Select value={form.personal.gender} onChange={e => set('personal.gender', e.target.value)} options={['male','female','other']} /></Field>
        <Field label="Blood Group"><Select value={form.personal.bloodGroup} onChange={e => set('personal.bloodGroup', e.target.value)} options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} /></Field>
        <Field label="Relationship"><Input placeholder="e.g. Parent, Driver, Guardian" value={form.personal.relationship} onChange={e => set('personal.relationship', e.target.value)} /></Field>
        <Field label="Phone" required><Input placeholder="+91 98765 43210" value={form.personal.phone} onChange={e => set('personal.phone', e.target.value)} /></Field>
        <Field label="Email"><Input type="email" placeholder="email@example.com" value={form.personal.email} onChange={e => set('personal.email', e.target.value)} /></Field>
      </Card>

      <Card title="Address">
        <Field label="Address Line 1"><Input placeholder="Street / Area" value={form.personal.address.line1} onChange={e => set('personal.address.line1', e.target.value)} /></Field>
        <Field label="City"><Input placeholder="City" value={form.personal.address.city} onChange={e => set('personal.address.city', e.target.value)} /></Field>
        <Field label="State"><Input placeholder="State" value={form.personal.address.state} onChange={e => set('personal.address.state', e.target.value)} /></Field>
        <Field label="Pincode"><Input placeholder="560001" value={form.personal.address.pincode} onChange={e => set('personal.address.pincode', e.target.value)} /></Field>
      </Card>

      <Card title="Emergency Contact">
        <Field label="Name"><Input placeholder="Contact name" value={form.personal.emergencyContact.name} onChange={e => set('personal.emergencyContact.name', e.target.value)} /></Field>
        <Field label="Phone"><Input placeholder="+91 98765 43210" value={form.personal.emergencyContact.phone} onChange={e => set('personal.emergencyContact.phone', e.target.value)} /></Field>
        <Field label="Relation"><Input placeholder="e.g. Spouse" value={form.personal.emergencyContact.relation} onChange={e => set('personal.emergencyContact.relation', e.target.value)} /></Field>
      </Card>

      <Card title="Vehicle Details">
        <Field label="Vehicle Number"><Input placeholder="e.g. KA-01-AB-1234" value={form.vehicleDetails.vehicleNumber} onChange={e => set('vehicleDetails.vehicleNumber', e.target.value)} /></Field>
        <Field label="Vehicle Model"><Input placeholder="e.g. Maruti Ertiga" value={form.vehicleDetails.model} onChange={e => set('vehicleDetails.model', e.target.value)} /></Field>
        <Field label="Route"><Input placeholder="e.g. Route 5 - Koramangala" value={form.vehicleDetails.route} onChange={e => set('vehicleDetails.route', e.target.value)} /></Field>
        <Field label="Capacity"><Input type="number" placeholder="e.g. 10" value={form.vehicleDetails.capacity} onChange={e => set('vehicleDetails.capacity', e.target.value)} /></Field>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-6">
        <button onClick={() => navigate('/principal/caretakers')} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
          {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitting ? 'Saving…' : 'Save Caretaker'}
        </button>
      </div>
    </div>
  );
}
