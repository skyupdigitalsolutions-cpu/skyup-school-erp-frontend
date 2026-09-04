import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

function BreakdownCard({ title, rows, filename }) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b flex items-center justify-between">
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
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(r.count / max) * 100}%` }} />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BreakdownCard title="Students by Class" rows={overview.students.byClass} filename="students-by-class.csv" />
          <BreakdownCard title="Students by Status" rows={overview.students.byStatus} filename="students-by-status.csv" />
          <BreakdownCard title="Teachers by Department" rows={overview.teachers.byDepartment} filename="teachers-by-department.csv" />
          <BreakdownCard title="Teachers by Status" rows={overview.teachers.byStatus} filename="teachers-by-status.csv" />
          <BreakdownCard title="Caretakers by Status" rows={overview.caretakers.byStatus} filename="caretakers-by-status.csv" />
          <BreakdownCard title="Events by Status" rows={overview.events.byStatus} filename="events-by-status.csv" />
          <BreakdownCard title="Events by Category" rows={overview.events.byCategory} filename="events-by-category.csv" />
          <BreakdownCard title="Exams by Status" rows={overview.exams.byStatus} filename="exams-by-status.csv" />
          <BreakdownCard title="Exams by Type" rows={overview.exams.byType} filename="exams-by-type.csv" />
        </div>
      )}
    </div>
  );
}