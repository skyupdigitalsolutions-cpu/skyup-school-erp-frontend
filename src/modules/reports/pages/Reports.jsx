import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, GraduationCap, ShieldCheck, CalendarDays } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { fetchReportOverview } from '@/features/reports/reportSlice';

function downloadCSV(filename, rows) {
  const header = 'Label,Count\n';
  const body = rows.map(r => `"${String(r.label).replace(/"/g, '""')}",${r.count}`).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const BAR_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];

function BreakdownCard({ title, rows, filename, barColor }) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{total} total</p>
        </div>
        <button
          onClick={() => downloadCSV(filename, rows)}
          disabled={rows.length === 0}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
      </div>
      <div className="p-5">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No data available.</p>
        ) : (
          <ul className="space-y-2.5">
            {rows.map(r => (
              <li key={r.label} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate text-gray-600 capitalize">{r.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`${barColor} h-full rounded-full`} style={{ width: `${(r.count / max) * 100}%` }} />
                </div>
                <span className="w-8 text-right font-semibold text-gray-800">{r.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Reports() {
  const dispatch = useDispatch();
  const { overview, loading, error } = useSelector(s => s.reports);

  useEffect(() => { dispatch(fetchReportOverview()); }, [dispatch]);

  const sum = (rows) => (rows || []).reduce((s, r) => s + r.count, 0);

  const sections = overview ? [
    { title: 'Students by Class', rows: overview.students.byClass, filename: 'students-by-class.csv' },
    { title: 'Students by Status', rows: overview.students.byStatus, filename: 'students-by-status.csv' },
    { title: 'Teachers by Department', rows: overview.teachers.byDepartment, filename: 'teachers-by-department.csv' },
    { title: 'Teachers by Status', rows: overview.teachers.byStatus, filename: 'teachers-by-status.csv' },
    { title: 'Caretakers by Status', rows: overview.caretakers.byStatus, filename: 'caretakers-by-status.csv' },
    { title: 'Events by Status', rows: overview.events.byStatus, filename: 'events-by-status.csv' },
    { title: 'Events by Category', rows: overview.events.byCategory, filename: 'events-by-category.csv' },
    { title: 'Exams by Status', rows: overview.exams.byStatus, filename: 'exams-by-status.csv' },
    { title: 'Exams by Type', rows: overview.exams.byType, filename: 'exams-by-type.csv' },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Breakdown reports across every module, exportable as CSV</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading && !overview ? (
        <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-sm text-gray-400">Generating reports…</p></div>
      ) : overview && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Students" value={sum(overview.students.byStatus)} theme="blue" icon={Users} />
            <StatCard label="Teachers" value={sum(overview.teachers.byStatus)} theme="emerald" icon={GraduationCap} />
            <StatCard label="Caretakers" value={sum(overview.caretakers.byStatus)} theme="violet" icon={ShieldCheck} />
            <StatCard label="Events" value={sum(overview.events.byStatus)} theme="amber" icon={CalendarDays} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sections.map((s, i) => (
              <BreakdownCard key={s.filename} {...s} barColor={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}