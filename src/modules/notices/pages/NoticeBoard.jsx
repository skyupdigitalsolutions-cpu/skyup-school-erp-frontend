import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotices, fetchNoticeStats, createNotice, deleteNotice } from '@/features/notices/noticeSlice';

const QUICK_ACTIONS = [
  { label: 'Add Student', path: '/principal/students/new', color: 'blue' },
  { label: 'Add Teacher', path: '/principal/teachers/new', color: 'green' },
  { label: 'Add Caretaker', path: '/principal/caretakers/new', color: 'purple' },
  { label: 'Add Class', path: '/principal/classes/new', color: 'amber' },
  { label: 'Add Event', path: '/principal/events/new', color: 'pink' },
  { label: 'Add Exam', path: '/principal/exams/new', color: 'indigo' },
];

const COLOR_MAP = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
  purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
  amber: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
  pink: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
};

const PRIORITY_BADGE = { low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-700', high: 'bg-red-100 text-red-700' };

function StatCard({ label, value, color = 'blue' }) {
  const c = { blue: 'bg-blue-50 border-blue-200 text-blue-700', red: 'bg-red-50 border-red-200 text-red-700', amber: 'bg-amber-50 border-amber-200 text-amber-700' };
  return <div className={`rounded-xl border p-4 ${c[color]}`}><p className="text-xs font-semibold uppercase tracking-wide opacity-60">{label}</p><p className="text-2xl font-bold mt-1">{value ?? '—'}</p></div>;
}

function NewNoticeForm({ onClose, onCreated }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ title: '', message: '', category: 'general', audience: 'all', priority: 'medium', pinned: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setError('');
    if (!form.title.trim() || !form.message.trim()) return setError('Title and message are required.');
    setSubmitting(true);
    const result = await dispatch(createNotice(form));
    setSubmitting(false);
    if (createNotice.fulfilled.match(result)) onCreated();
    else setError(result.payload?.message || 'Failed to publish notice.');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900">New Notice</h3>
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>}
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={e => set('title', e.target.value)} />
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm h-24" placeholder="Message" value={form.message} onChange={e => set('message', e.target.value)} />
        <div className="grid grid-cols-3 gap-3">
          <select className="border rounded-lg px-2 py-2 text-sm" value={form.category} onChange={e => set('category', e.target.value)}>
            {['general', 'academic', 'event', 'exam', 'urgent'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="border rounded-lg px-2 py-2 text-sm" value={form.audience} onChange={e => set('audience', e.target.value)}>
            {['all', 'teachers', 'students', 'parents', 'caretakers'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="border rounded-lg px-2 py-2 text-sm" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.pinned} onChange={e => set('pinned', e.target.checked)} /> Pin to top
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={submitting} className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {submitting ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NoticeBoard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, stats, listLoading } = useSelector(s => s.notices);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => { dispatch(fetchNotices({ limit: 30 })); }, [dispatch]);
  useEffect(() => { dispatch(fetchNoticeStats()); load(); }, [dispatch, load]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this notice?')) return;
    dispatch(deleteNotice(id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices & Quick Actions</h1>
          <p className="text-sm text-gray-500 mt-0.5">School-wide announcements and one-click shortcuts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ New Notice</button>
      </div>

      {/* Quick Actions grid */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} className={`rounded-xl border p-4 text-sm font-medium text-center transition ${COLOR_MAP[a.color]}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total} color="blue" />
          <StatCard label="Published" value={stats.published} color="blue" />
          <StatCard label="Pinned" value={stats.pinned} color="amber" />
          <StatCard label="Urgent" value={stats.urgent} color="red" />
        </div>
      )}

      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b"><h3 className="text-sm font-semibold text-gray-800">All Notices</h3></div>
        {listLoading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-sm text-gray-400">Loading notices…</p></div>
        ) : list.length === 0 ? (
          <p className="p-12 text-center text-sm text-gray-400">No notices published yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map(n => (
              <li key={n._id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {n.pinned && <span className="text-xs">📌</span>}
                    <p className="font-semibold text-gray-900">{n.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[n.priority]}`}>{n.priority}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{n.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 capitalize">→ {n.audience}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.publishedDate).toLocaleString()}</p>
                </div>
                <button onClick={() => handleDelete(n._id)} className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50 shrink-0">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && <NewNoticeForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); dispatch(fetchNoticeStats()); }} />}
    </div>
  );
}