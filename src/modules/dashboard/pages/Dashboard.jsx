import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardSummary } from '@/features/dashboard/dashboardSlice';

function StatCard({ label, value, sub, color, onClick }) {
  const c = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  return (
    <button onClick={onClick} className={`text-left rounded-xl border p-5 transition hover:shadow-md ${c[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{label}</p>
      <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
    </button>
  );
}

function ListCard({ title, items, empty, renderItem, onViewAll }) {
  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {onViewAll && <button onClick={onViewAll} className="text-xs font-medium text-blue-600 hover:underline">View all</button>}
      </div>
      <div className="p-2">
        {(!items || items.length === 0) ? (
          <p className="text-sm text-gray-400 text-center py-6">{empty}</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map(renderItem)}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { summary, loading, error } = useSelector(s => s.dashboard);

  useEffect(() => { dispatch(fetchDashboardSummary()); }, [dispatch]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">A live overview of your school</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading && !summary ? (
        <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-sm text-gray-400">Loading dashboard…</p></div>
      ) : summary && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Students" value={summary.students.total} sub={`${summary.students.active} active`} color="blue" onClick={() => navigate('/principal/students')} />
            <StatCard label="Teachers" value={summary.teachers.total} sub={`${summary.teachers.active} active`} color="green" onClick={() => navigate('/principal/teachers')} />
            <StatCard label="Caretakers" value={summary.caretakers.total} sub={`${summary.caretakers.active} active`} color="purple" onClick={() => navigate('/principal/caretakers')} />
            <StatCard label="Classes" value={summary.classes.total} sub="active classes" color="amber" onClick={() => navigate('/principal/classes')} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ListCard
              title={`Upcoming Events (${summary.events.upcoming})`}
              items={summary.events.recent}
              empty="No upcoming events."
              onViewAll={() => navigate('/principal/events')}
              renderItem={(e) => (
                <li key={e._id} className="px-3 py-2.5 flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{e.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{e.category}</p>
                  </div>
                  <span className="text-xs text-gray-500">{e.schedule?.startDate ? new Date(e.schedule.startDate).toLocaleDateString() : '—'}</span>
                </li>
              )}
            />
            <ListCard
              title={`Exams (${summary.exams.ongoing} ongoing)`}
              items={summary.exams.recent}
              empty="No exams found."
              onViewAll={() => navigate('/principal/exams')}
              renderItem={(e) => (
                <li key={e._id} className="px-3 py-2.5 flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{e.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{e.type?.replace('_', ' ')} · {e.academicYear}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{e.status}</span>
                </li>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}