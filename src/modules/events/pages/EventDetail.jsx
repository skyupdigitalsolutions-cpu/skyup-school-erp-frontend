import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, MapPin, Users, IndianRupee, ArrowLeft } from 'lucide-react';
import { fetchEvent, STATUS_COLORS } from '@/features/events/eventsSlice';

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

  useEffect(() => { dispatch(fetchEvent(id)); }, [dispatch, id]);

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
          <button
            onClick={() => navigate(`/principal/events/${event._id}/edit`)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            Edit
          </button>
        </div>
      </div>

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
