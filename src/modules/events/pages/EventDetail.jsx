import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, MapPin, IndianRupee, ArrowLeft, UserCog, ImageIcon, ShieldCheck, Send, Check, X } from 'lucide-react';
import { fetchEvent, changeEventStatus, STATUS_COLORS } from '@/features/events/eventsSlice';

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value ?? '—'}</p>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: event, profileLoading, error } = useSelector((s) => s.events);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { dispatch(fetchEvent(id)); }, [dispatch, id]);

  const runStatusChange = async (status, { promptLabel } = {}) => {
    let notes;
    if (promptLabel) {
      notes = window.prompt(promptLabel) || '';
      if (promptLabel.startsWith('Reason') && !notes.trim()) return; // rejection needs a reason
    }
    setActionLoading(true);
    try {
      await dispatch(changeEventStatus({ id, status, notes }));
    } finally {
      setActionLoading(false);
    }
  };

  if (profileLoading || !event) {
    return (
      <div className="p-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error.message || 'Failed to load event.'}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading event…</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <button onClick={() => navigate('/principal/events')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{event.eventId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[event.status] || 'bg-gray-100 text-gray-600'}`}>
            {event.status?.replace('_', ' ')}
          </span>
          {event.status === 'draft' && (
            <button
              onClick={() => runStatusChange('pending_approval')}
              disabled={actionLoading}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Approval
            </button>
          )}
          {event.status === 'pending_approval' && (
            <>
              <button
                onClick={() => runStatusChange('approved', { promptLabel: 'Approval notes (optional):' })}
                disabled={actionLoading}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => runStatusChange('draft', { promptLabel: 'Reason for rejection:' })}
                disabled={actionLoading}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/principal/events/${event._id}/edit`)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            Edit
          </button>
        </div>
      </div>

      {(event.approval?.requestedAt || event.approval?.approvedAt) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">Approval Trail</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {event.approval?.requestedAt && (
              <Field
                label="Submitted for approval"
                value={`${event.approval.requestedBy?.name || 'Unknown'} · ${new Date(event.approval.requestedAt).toLocaleDateString()}`}
              />
            )}
            {event.approval?.approvedAt && (
              <Field
                label="Approved by"
                value={`${event.approval.approvedBy?.name || 'Unknown'} · ${new Date(event.approval.approvedAt).toLocaleDateString()}`}
              />
            )}
          </div>
          {event.approval?.notes && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-4">{event.approval.notes}</p>
          )}
        </div>
      )}

      {event.description && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{event.description}</p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 gap-5">
        <Field label="Category" value={event.category} />
        <Field label="Organizer" value={event.organizer?.name} />
        <Field label="Start Date" value={event.schedule?.startDate ? new Date(event.schedule.startDate).toLocaleDateString() : null} />
        <Field label="End Date" value={event.schedule?.endDate ? new Date(event.schedule.endDate).toLocaleDateString() : null} />
        <Field label="Venue" value={event.venue?.hall || event.venue?.address} />
        <Field label="Seating Capacity" value={event.venue?.seatingCapacity} />
        <Field label="Participants" value={event.participants?.totalRegistered ?? 0} />
        <Field label="Approved Budget" value={event.budget?.approved != null ? `₹${event.budget.approved.toLocaleString('en-IN')}` : null} />
      </div>

      {event.schedule?.agenda?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">Agenda</h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {event.schedule.agenda.map((a, i) => (
              <li key={i} className="px-5 py-3 flex items-start gap-4 text-sm">
                <span className="w-16 shrink-0 font-mono text-xs text-gray-400 mt-0.5">{a.time}</span>
                <div>
                  <p className="font-medium text-gray-800">{a.session}</p>
                  {a.speaker && <p className="text-xs text-gray-500">{a.speaker}</p>}
                  {a.description && <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {event.committees?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">Task Assignments</h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {event.committees.map((c, i) => (
              <li key={i} className="px-5 py-3 flex items-start justify-between text-sm gap-4">
                <div>
                  <p className="font-medium text-gray-800">{c.name}</p>
                  {c.responsibility && <p className="text-xs text-gray-500 mt-0.5">{c.responsibility}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium capitalize shrink-0">{c.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {event.photos?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">Photos</h3>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {event.photos.map((p, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-gray-100">
                <img src={p.url} alt={p.caption || ''} className="w-full h-32 object-cover bg-gray-50" />
                {p.caption && <p className="text-xs text-gray-500 px-2 py-1.5 truncate">{p.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {event.venue?.facilities?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <MapPin className="w-4 h-4 text-gray-400" />
          {event.venue.facilities.map((f) => (
            <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}
