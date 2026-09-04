import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchLeaveRequests, fetchLeaveStats, approveLeaveRequest, rejectLeaveRequest, deleteLeaveRequest } from '@/features/leave-management/leaveSlice';

function StatCard({ label, value, color = 'blue' }) {
  const c = { blue: 'bg-blue-50 border-blue-200 text-blue-700', amber: 'bg-amber-50 border-amber-200 text-amber-700', green: 'bg-green-50 border-green-200 text-green-700', red: 'bg-red-50 border-red-200 text-red-700' };
  return <div className={`rounded-xl border p-4 ${c[color]}`}><p className="text-xs font-semibold uppercase tracking-wide opacity-60">{label}</p><p className="text-2xl font-bold mt-1">{value ?? '—'}</p></div>;
}

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function LeaveDirectory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, stats, listLoading } = useSelector(s => s.leaveManagement);
  const [filters, setFilters] = useState({ status: '', applicantType: '' });
  const [remarksDraft, setRemarksDraft] = useState({});

  const load = useCallback(() => { dispatch(fetchLeaveRequests({ ...filters, limit: 30 })); }, [dispatch, filters]);
  useEffect(() => { dispatch(fetchLeaveStats()); load(); }, [dispatch, load]);

  const act = (thunk, id) => {
    dispatch(thunk({ id, remarks: remarksDraft[id] || '' })).then(() => { dispatch(fetchLeaveStats()); });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    dispatch(deleteLeaveRequest(id)).then(() => { load(); dispatch(fetchLeaveStats()); });
  };

  const applicantName = (l) => {
    const p = l.applicant?.personal;
    return p ? `${p.firstName} ${p.lastName}` : '—';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Approve or reject staff leave requests</p>
        </div>
        <button onClick={() => navigate('/principal/leave-management/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Log Leave Request</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Pending" value={stats.pending} color="amber" />
          <StatCard label="Approved" value={stats.approved} color="green" />
          <StatCard label="Rejected" value={stats.rejected} color="red" />
          <StatCard label="Total" value={stats.total} color="blue" />
        </div>
      )}

      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
        <select className="border rounded-lg px-3 py-2 text-sm" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {['pending', 'approved', 'rejected', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-2 text-sm" value={filters.applicantType} onChange={e => setFilters({ ...filters, applicantType: e.target.value })}>
          <option value="">All Staff Types</option>
          <option value="teacher">Teacher</option>
          <option value="caretaker">Caretaker</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border">
        {listLoading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-sm text-gray-400">Loading requests…</p></div>
        ) : list.length === 0 ? (
          <p className="p-12 text-center text-sm text-gray-400">No leave requests found.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map(l => (
              <li key={l._id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{applicantName(l)}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{l.applicantType}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 capitalize">{l.leaveType}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[l.status]}`}>{l.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{l.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(l.fromDate).toLocaleDateString()} → {new Date(l.toDate).toLocaleDateString()} · {l.totalDays} day(s)
                    </p>
                    {l.approverRemarks && <p className="text-xs text-gray-500 mt-1 italic">Remarks: {l.approverRemarks}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {l.status === 'pending' ? (
                      <>
                        <input
                          placeholder="Remarks (optional)"
                          className="border rounded-lg px-2 py-1.5 text-xs w-40"
                          value={remarksDraft[l._id] || ''}
                          onChange={e => setRemarksDraft({ ...remarksDraft, [l._id]: e.target.value })}
                        />
                        <button onClick={() => act(approveLeaveRequest, l._id)} className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium">Approve</button>
                        <button onClick={() => act(rejectLeaveRequest, l._id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium">Reject</button>
                      </>
                    ) : (
                      <button onClick={() => handleDelete(l._id)} className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50">Delete</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}