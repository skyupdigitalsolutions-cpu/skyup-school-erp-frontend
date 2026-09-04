import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CalendarClock, PlayCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { fetchEvents, fetchEventDashboard, changeEventStatus, deleteEvent, bulkCancelEvents, toggleSelectEvent, clearEventSelection, STATUS_COLORS } from '@/features/events/eventsSlice';

const CATEGORIES = ['Cultural','Sports','Academic','Annual Day','Science Fair','Competition','Workshop','Seminar','Field Trip','Other'];


export default function EventDirectory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, meta, dashboard, listLoading, selectedIds } = useSelector(s => s.events);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', academicYear: '' });
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    dispatch(fetchEvents({ ...filters, q: search, page, limit: 20 }));
  }, [dispatch, filters, search, page]);

  useEffect(() => { dispatch(fetchEventDashboard()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);

  const handleBulkCancel = () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Cancel ${selectedIds.length} event(s)?`)) return;
    dispatch(bulkCancelEvents({ ids: selectedIds })).then(() => { dispatch(clearEventSelection()); load(); });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Event Management</h1><p className="text-sm text-gray-500 mt-0.5">Plan, manage and track school events</p></div>
        <button onClick={() => navigate('/principal/events/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Add Event</button>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total" value={dashboard.total} theme="blue" icon={CalendarDays} />
          <StatCard label="Upcoming" value={dashboard.upcoming} theme="amber" icon={CalendarClock} />
          <StatCard label="Ongoing" value={dashboard.ongoing} theme="emerald" icon={PlayCircle} />
          <StatCard label="Completed" value={dashboard.completed} theme="violet" icon={CheckCircle2} />
          <StatCard label="Cancelled" value={dashboard.cancelled} theme="rose" icon={XCircle} />
          <StatCard label="Pending Approval" value={dashboard.pendingApprovals} theme="cyan" icon={Clock} />
        </div>
      )}

      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div className="flex gap-3">
          <input type="text" placeholder="Search by name, ID, organizer, venue..." className="flex-1 border rounded-lg px-3 py-2 text-sm" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <button onClick={load} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 font-medium">Search</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: 'status', label: 'Status', options: ['draft','pending_approval','approved','ongoing','completed','cancelled'] },
            { key: 'category', label: 'Category', options: CATEGORIES },
            { key: 'academicYear', label: 'Academic Year', options: ['2024-25','2025-26'] },
          ].map(({ key, label, options }) => (
            <select key={key} className="border rounded-lg px-3 py-2 text-sm text-gray-700" value={filters[key]} onChange={e => { setFilters({ ...filters, [key]: e.target.value }); setPage(1); }}>
              <option value="">{label}</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3">
          <span className="text-sm font-medium text-orange-800">{selectedIds.length} selected</span>
          <button onClick={handleBulkCancel} className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-medium">Cancel Events</button>
          <button onClick={() => dispatch(clearEventSelection())} className="text-sm px-3 py-1.5 rounded-lg border text-gray-600">Clear</button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        {listLoading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-sm text-gray-400">Loading events…</p></div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mx-auto mb-3 text-gray-300"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>
            <p className="text-sm font-medium text-gray-400">No events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['', 'Event ID', 'Name', 'Category', 'Organizer', 'Start Date', 'End Date', 'Venue', 'Participants', 'Budget', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(event => (
                  <tr key={event._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(event._id)} onChange={() => dispatch(toggleSelectEvent(event._id))} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{event.eventId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{event.name}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-medium">{event.category}</span></td>
                    <td className="px-4 py-3 text-gray-600">{event.organizer?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{event.schedule?.startDate ? new Date(event.schedule.startDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{event.schedule?.endDate ? new Date(event.schedule.endDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{event.venue?.hall || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{event.participants?.totalRegistered || 0}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">₹{(event.budget?.approved || 0).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[event.status] || 'bg-gray-100 text-gray-600'}`}>{event.status?.replace('_', ' ')}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/principal/events/${event._id}`)} className="text-xs px-2 py-1 rounded border text-blue-600 hover:bg-blue-50">View</button>
                        <button onClick={() => navigate(`/principal/events/${event._id}/edit`)} className="text-xs px-2 py-1 rounded border text-gray-600 hover:bg-gray-50">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.pages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">Showing {list.length} of {meta.total}</span>
            <div className="flex gap-2">
              <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="px-3 py-1.5 rounded border disabled:opacity-40">Previous</button>
              <span className="px-3 py-1.5 font-medium">{page}/{meta.pages}</span>
              <button disabled={page>=meta.pages} onClick={() => setPage(p=>p+1)} className="px-3 py-1.5 rounded border disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
