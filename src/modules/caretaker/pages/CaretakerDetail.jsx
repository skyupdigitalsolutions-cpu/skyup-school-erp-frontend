import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchCaretaker } from '@/features/caretaker/caretakerSlice';

const STATUS_COLORS = { active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-600' };

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value ?? '—'}</p>
    </div>
  );
}

export default function CaretakerDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: c, profileLoading, error } = useSelector((s) => s.caretaker);

  useEffect(() => { dispatch(fetchCaretaker(id)); }, [dispatch, id]);

  if (profileLoading || !c) {
    return (
      <div className="p-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error.message || 'Failed to load caretaker.'}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading caretaker…</p>
          </div>
        )}
      </div>
    );
  }

  const name = `${c.personal?.firstName || ''} ${c.personal?.lastName || ''}`.trim();

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <button onClick={() => navigate('/principal/caretakers')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="w-4 h-4" /> Back to Caretakers
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {name.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{name || '—'}</h1>
            <p className="text-sm text-gray-500 mt-0.5 font-mono">{c.caretakerId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>
            {c.status}
          </span>
          <button
            onClick={() => navigate(`/principal/caretakers/${c._id}/edit`)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
        <Field label="Employment Type" value={c.employmentType?.replace('_', ' ')} />
        <Field label="Relationship" value={c.personal?.relationship} />
        <Field label="Phone" value={c.personal?.phone} />
        <Field label="Email" value={c.personal?.email} />
        <Field label="Gender" value={c.personal?.gender} />
        <Field label="Blood Group" value={c.personal?.bloodGroup} />
        <Field label="Verification" value={c.verificationStatus} />
      </div>

      {(c.personal?.address?.line1 || c.personal?.address?.city) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Address</h3>
          <p className="text-sm text-gray-700">
            {[c.personal.address.line1, c.personal.address.city, c.personal.address.state, c.personal.address.pincode].filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      {(c.personal?.emergencyContact?.name || c.personal?.emergencyContact?.phone) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-3 gap-5">
          <Field label="Emergency Contact" value={c.personal.emergencyContact.name} />
          <Field label="Phone" value={c.personal.emergencyContact.phone} />
          <Field label="Relation" value={c.personal.emergencyContact.relation} />
        </div>
      )}

      {(c.vehicleDetails?.vehicleNumber || c.vehicleDetails?.route) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 sm:grid-cols-4 gap-5">
          <Field label="Vehicle Number" value={c.vehicleDetails.vehicleNumber} />
          <Field label="Model" value={c.vehicleDetails.model} />
          <Field label="Route" value={c.vehicleDetails.route} />
          <Field label="Capacity" value={c.vehicleDetails.capacity} />
        </div>
      )}
    </div>
  );
}
