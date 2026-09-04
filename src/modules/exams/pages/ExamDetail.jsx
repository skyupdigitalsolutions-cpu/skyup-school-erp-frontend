import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchExam } from '@/features/exams/examsSlice';

const STATUS_COLORS = { draft:'bg-gray-100 text-gray-600', scheduled:'bg-blue-100 text-blue-700', ongoing:'bg-green-100 text-green-700', evaluation:'bg-yellow-100 text-yellow-700', completed:'bg-purple-100 text-purple-700', cancelled:'bg-red-100 text-red-700' };

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value ?? '—'}</p>
    </div>
  );
}

export default function ExamDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: exam, profileLoading, error } = useSelector((s) => s.exams);

  useEffect(() => { dispatch(fetchExam(id)); }, [dispatch, id]);

  if (profileLoading || !exam) {
    return (
      <div className="p-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error.message || 'Failed to load exam.'}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading exam…</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <button onClick={() => navigate('/principal/exams')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="w-4 h-4" /> Back to Exams
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{exam.examId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[exam.status] || 'bg-gray-100 text-gray-600'}`}>
            {exam.status?.replace('_', ' ')}
          </span>
          <button
            onClick={() => navigate(`/principal/exams/${exam._id}/edit`)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            Edit
          </button>
        </div>
      </div>

      {exam.description && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{exam.description}</p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
        <Field label="Type" value={exam.type?.replace('_', ' ')} />
        <Field label="Academic Year" value={exam.academicYear} />
        <Field label="Term" value={exam.term} />
      </div>

      {exam.classAllocations?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Class Allocations</h3>
          </div>
          <div className="p-5 flex flex-wrap gap-2">
            {exam.classAllocations.map((a, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                Class {a.class}{a.sections?.length ? ` (${a.sections.join(', ')})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {exam.rooms?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Exam Rooms</h3>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {exam.rooms.map((r, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-800">{r.roomNo}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.block} · Capacity {r.capacity}</p>
                {r.invigilator && <p className="text-xs text-gray-500 mt-1">Invigilator: {r.invigilator}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {exam.timetable?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Timetable</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Date', 'Subject', 'Class', 'Section', 'Time', 'Room', 'Invigilators', 'Max Marks', 'Pass Marks'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exam.timetable.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{row.date ? new Date(row.date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{row.subject}</td>
                    <td className="px-4 py-2.5 text-gray-600">{row.class}</td>
                    <td className="px-4 py-2.5 text-gray-600">{row.section}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{row.startTime}–{row.endTime}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{row.room}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{(row.invigilators || []).map(inv => inv.name).join(', ') || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600">{row.maxMarks}</td>
                    <td className="px-4 py-2.5 text-gray-600">{row.passingMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {exam.results?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Published Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Rank', 'Student', 'Total Marks', 'Percentage', 'Grade', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...exam.results].sort((a, b) => a.rank - b.rank).map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">#{r.rank}</td>
                    <td className="px-4 py-2.5 text-gray-700">{r.name}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.totalMarks} / {r.maxTotalMarks}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.percentage}%</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.grade}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${r.status === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
