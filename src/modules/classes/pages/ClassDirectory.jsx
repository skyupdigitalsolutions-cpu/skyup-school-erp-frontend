import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchClasses, fetchClassStats, deleteClass } from '@/features/classes/classSlice';

import { School, CheckCircle2, XCircle } from 'lucide-react';
import StatCard from '@/components/StatCard';

export default function ClassDirectory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, meta, stats, listLoading } = useSelector(s => s.classes);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ academicYear: '', status: '' });
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    dispatch(fetchClasses({ ...filters, q: search, page, limit: 20 }));
  }, [dispatch, filters, search, page]);

  useEffect(() => { dispatch(fetchClassStats()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this class?')) return;
    dispatch(deleteClass(id)).then(() => load());
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage classes, sections and class teachers</p>
        </div>
        <button onClick={() => navigate('/principal/classes/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Add Class</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total" value={stats.total} theme="blue" icon={School} />
          <StatCard label="Active" value={stats.active} theme="emerald" icon={CheckCircle2} />
          <StatCard label="Inactive" value={stats.inactive} theme="amber" icon={XCircle} />
        </div>
      )}

      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div className="flex gap-3">
          <input type="text" placeholder="Search by class name..." className="flex-1 border rounded-lg px-3 py-2 text-sm" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <input type="text" placeholder="Academic Year e.g. 2026-27" className="border rounded-lg px-3 py-2 text-sm w-56" value={filters.academicYear} onChange={e => { setFilters({ ...filters, academicYear: e.target.value }); setPage(1); }} />
          <button onClick={load} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 font-medium">Search</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {listLoading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-sm text-gray-400">Loading classes…</p></div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><p className="text-sm font-medium">No classes found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Class', 'Sections', 'Academic Year', 'Class Teacher', 'Capacity', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{(c.sections || []).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.academicYear}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.classTeacher ? `${c.classTeacher.personal?.firstName || ''} ${c.classTeacher.personal?.lastName || ''}`.trim() : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.capacity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/principal/classes/${c._id}/edit`)} className="text-xs px-2 py-1 rounded border text-blue-600 hover:bg-blue-50">Edit</button>
                        <button onClick={() => handleDelete(c._id)} className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50">Delete</button>
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
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded border disabled:opacity-40">Previous</button>
              <span className="px-3 py-1.5 font-medium">{page}/{meta.pages}</span>
              <button disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded border disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}