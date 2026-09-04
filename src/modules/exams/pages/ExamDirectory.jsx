import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchExams, fetchExamDashboard, changeExamStatus, deleteExam } from '@/features/exams/examsSlice';

const STATUS_COLORS = { draft:'bg-gray-100 text-gray-600', scheduled:'bg-blue-100 text-blue-700', ongoing:'bg-green-100 text-green-700', evaluation:'bg-yellow-100 text-yellow-700', completed:'bg-purple-100 text-purple-700', cancelled:'bg-red-100 text-red-700' };
const EXAM_TYPES = ['unit_test','mid_term','final','annual','mock','competitive','internal'];
const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12'];

function DashCard({ label, value, color='blue' }) {
  const c = { blue:'bg-blue-50 border-blue-200 text-blue-700', green:'bg-green-50 border-green-200 text-green-700', yellow:'bg-yellow-50 border-yellow-200 text-yellow-700', purple:'bg-purple-50 border-purple-200 text-purple-700', orange:'bg-orange-50 border-orange-200 text-orange-700' };
  return <div className={`rounded-xl border p-4 ${c[color]}`}><p className="text-xs font-semibold uppercase tracking-wide opacity-60">{label}</p><p className="text-2xl font-bold mt-1">{value ?? '—'}</p></div>;
}

export default function ExamDirectory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, meta, dashboard, listLoading } = useSelector(s => s.exams);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '', academicYear: '', class: '' });
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    dispatch(fetchExams({ ...filters, q: search, page, limit: 20 }));
  }, [dispatch, filters, search, page]);

  useEffect(() => { dispatch(fetchExamDashboard()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Examination Management</h1><p className="text-sm text-gray-500 mt-0.5">Schedule, conduct and publish examination results</p></div>
        <button onClick={() => navigate('/principal/exams/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Create Exam</button>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <DashCard label="Total" value={dashboard.total} color="blue" />
          <DashCard label="Scheduled" value={dashboard.upcoming} color="orange" />
          <DashCard label="Ongoing" value={dashboard.ongoing} color="green" />
          <DashCard label="Evaluation" value={dashboard.evaluation} color="yellow" />
          <DashCard label="Completed" value={dashboard.completed} color="purple" />
        </div>
      )}

      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div className="flex gap-3">
          <input type="text" placeholder="Search by exam name, ID..." className="flex-1 border rounded-lg px-3 py-2 text-sm" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <button onClick={load} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 font-medium">Search</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'status', label: 'Status', options: ['draft','scheduled','ongoing','evaluation','completed','cancelled'] },
            { key: 'type', label: 'Exam Type', options: EXAM_TYPES },
            { key: 'academicYear', label: 'Academic Year', options: ['2024-25','2025-26'] },
            { key: 'class', label: 'Class', options: CLASSES },
          ].map(({ key, label, options }) => (
            <select key={key} className="border rounded-lg px-3 py-2 text-sm text-gray-700" value={filters[key]} onChange={e => { setFilters({ ...filters, [key]: e.target.value }); setPage(1); }}>
              <option value="">{label}</option>
              {options.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
            </select>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {listLoading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-sm text-gray-400">Loading examinations…</p></div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mx-auto mb-3 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4"/></svg>
            <p className="text-sm font-medium text-gray-400">No examinations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Exam ID','Name','Academic Year','Term','Type','Classes','Start Date','End Date','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(exam => (
                  <tr key={exam._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{exam.examId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{exam.name}</td>
                    <td className="px-4 py-3 text-gray-600">{exam.academicYear}</td>
                    <td className="px-4 py-3 text-gray-600">{exam.term || '—'}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 font-medium capitalize">{exam.type?.replace('_', ' ')}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-600">{exam.classAllocations?.map(c => c.class).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{exam.timetable?.[0]?.date ? new Date(exam.timetable[0].date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{exam.timetable?.length > 0 ? new Date(exam.timetable[exam.timetable.length-1].date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[exam.status] || 'bg-gray-100 text-gray-600'}`}>{exam.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/principal/exams/${exam._id}`)} className="text-xs px-2 py-1 rounded border text-blue-600 hover:bg-blue-50">View</button>
                        <button onClick={() => navigate(`/principal/exams/${exam._id}/edit`)} className="text-xs px-2 py-1 rounded border text-gray-600 hover:bg-gray-50">Edit</button>
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
