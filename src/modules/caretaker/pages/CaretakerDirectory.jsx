import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCaretakers, fetchCaretakerStats, changeCaretakerStatus, deleteCaretaker, bulkCaretakerStatus, toggleSelectCaretaker, clearCaretakerSelection } from '@/features/caretaker/caretakerSlice';

const VERIFY_COLORS = { verified: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };
const STATUS_COLORS = { active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-600', suspended: 'bg-red-100 text-red-800', archived: 'bg-yellow-100 text-yellow-800' };

import { ShieldCheck, UserCheck, BadgeCheck, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';

export default function CaretakerDirectory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, meta, stats, listLoading, selectedIds } = useSelector(s => s.caretaker);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', verificationStatus: '', employmentType: '' });
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    dispatch(fetchCaretakers({ ...filters, q: search, page, limit: 20 }));
  }, [dispatch, filters, search, page]);

  useEffect(() => { dispatch(fetchCaretakerStats()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);

  const handleBulkStatus = (status) => {
    if (!selectedIds.length) return;
    dispatch(bulkCaretakerStatus({ ids: selectedIds, status })).then(() => { dispatch(clearCaretakerSelection()); load(); });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caretaker Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage caretakers, student assignments, vehicles and verification</p>
        </div>
        <button onClick={() => navigate('/principal/caretakers/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Add Caretaker</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total} theme="blue" icon={ShieldCheck} />
          <StatCard label="Active" value={stats.active} theme="emerald" icon={UserCheck} />
          <StatCard label="Verified" value={stats.verified} theme="emerald" icon={BadgeCheck} />
          <StatCard label="Pending Verification" value={stats.pending} theme="amber" icon={Clock} />
        </div>
      )}

      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div className="flex gap-3">
          <input type="text" placeholder="Search by name, ID, phone, vehicle..." className="flex-1 border rounded-lg px-3 py-2 text-sm" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <button onClick={load} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 font-medium">Search</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: 'status', label: 'Status', options: ['active','inactive','suspended','archived'] },
            { key: 'verificationStatus', label: 'Verification', options: ['verified','pending','rejected'] },
            { key: 'employmentType', label: 'Employment', options: ['full_time','part_time','contract','volunteer'] },
          ].map(({ key, label, options }) => (
            <select key={key} className="border rounded-lg px-3 py-2 text-sm text-gray-700" value={filters[key]} onChange={e => { setFilters({ ...filters, [key]: e.target.value }); setPage(1); }}>
              <option value="">{label}</option>
              {options.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
            </select>
          ))}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-blue-800">{selectedIds.length} selected</span>
          <button onClick={() => handleBulkStatus('active')} className="text-sm px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-medium">Activate</button>
          <button onClick={() => handleBulkStatus('suspended')} className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-medium">Suspend</button>
          <button onClick={() => dispatch(clearCaretakerSelection())} className="text-sm px-3 py-1.5 rounded-lg border text-gray-600">Clear</button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        {listLoading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-sm text-gray-400">Loading caretakers…</p></div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><p className="text-sm font-medium">No caretakers found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['', 'Photo', 'ID', 'Name', 'Relationship', 'Phone', 'Students', 'Vehicle', 'Verification', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => dispatch(toggleSelectCaretaker(c._id))} /></td>
                    <td className="px-4 py-3">
                      {c.photo ? <img src={c.photo} alt="" className="w-8 h-8 rounded-full object-cover" /> :
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs">{c.personal?.firstName?.[0]}{c.personal?.lastName?.[0]}</div>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.caretakerId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.personal?.firstName} {c.personal?.lastName}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{c.personal?.relationship || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.personal?.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{c.assignedStudents?.length || 0}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.vehicleDetails?.vehicleNumber || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${VERIFY_COLORS[c.verificationStatus]}`}>{c.verificationStatus}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/principal/caretakers/${c._id}`)} className="text-xs px-2 py-1 rounded border text-blue-600 hover:bg-blue-50">View</button>
                        <button onClick={() => navigate(`/principal/caretakers/${c._id}/edit`)} className="text-xs px-2 py-1 rounded border text-gray-600 hover:bg-gray-50">Edit</button>
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
