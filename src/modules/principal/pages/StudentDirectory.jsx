import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, School, FileStack } from 'lucide-react';
import StatCard from '@/components/StatCard';
import {
  fetchStudents, fetchStudentStats,
  changeStudentStatus, archiveStudent, deleteStudent,
  bulkPromoteStudents, bulkStudentStatus,
  toggleSelectId, selectAll, clearSelection,
  setFilters,
} from '@/features/principal/studentSlice';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-800',
  transferred: 'bg-blue-100 text-blue-800',
  archived: 'bg-yellow-100 text-yellow-800',
  alumni: 'bg-purple-100 text-purple-800',
};

const FEE_COLORS = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  due: 'bg-orange-100 text-orange-700',
  overdue: 'bg-red-100 text-red-700',
};


function BulkPromoteModal({ selectedCount, onConfirm, onClose }) {
  const [form, setForm] = useState({ newClass: '', newSection: '', newAcademicYear: '' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Promote {selectedCount} Students</h3>
        <div className="space-y-3">
          {[
            { key: 'newClass', label: 'New Class' },
            { key: 'newSection', label: 'New Section' },
            { key: 'newAcademicYear', label: 'New Academic Year' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border">Cancel</button>
          <button
            onClick={() => onConfirm(form)}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium"
          >
            Promote
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentDirectory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, meta, stats, listLoading, selectedIds, filters } = useSelector(
    (s) => s.principalStudents
  );
  const loading = listLoading;

  const [search, setSearch] = useState('');
  const [localFilters, setLocalFilters] = useState({
    academicYear: '', class: '', section: '', status: '', gender: '',
    transport: '', hostel: '', feeStatus: '',
  });
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    const params = { ...localFilters, q: search, page, limit: 20 };
    dispatch(fetchStudents(params));
    dispatch(setFilters(params));
  }, [dispatch, localFilters, search, page]);

  useEffect(() => {
    dispatch(fetchStudentStats());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleBulkStatus = (status) => {
    if (!selectedIds.length) return;
    dispatch(bulkStudentStatus({ ids: selectedIds, status })).then(() => {
      dispatch(clearSelection());
      load();
    });
  };

  const handleBulkPromote = (form) => {
    if (!selectedIds.length) return;
    dispatch(bulkPromoteStudents({ ids: selectedIds, ...form })).then(() => {
      dispatch(clearSelection());
      setShowPromoteModal(false);
      load();
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === list.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAll(list.map((s) => s._id)));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all student records, profiles and bulk operations</p>
        </div>
        <button
          onClick={() => navigate('/principal/students/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Student
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={stats.total} theme="blue" icon={Users} />
          <StatCard label="Active" value={stats.active} theme="emerald" icon={UserCheck} />
          <StatCard label="Classes" value={stats.byClass?.length} theme="violet" icon={School} />
          <StatCard label="Page" value={`${page} / ${meta.pages}`} theme="amber" icon={FileStack} />
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name, admission no..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button
            onClick={load}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition font-medium"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { key: 'academicYear', label: 'Academic Year', options: ['2024-25', '2025-26'] },
            { key: 'class', label: 'Class', options: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
            { key: 'status', label: 'Status', options: ['active','inactive','suspended','transferred','archived','alumni'] },
            { key: 'gender', label: 'Gender', options: ['male','female','other'] },
            { key: 'transport', label: 'Transport', options: ['yes','no'] },
            { key: 'feeStatus', label: 'Fee Status', options: ['paid','partial','due','overdue'] },
          ].map(({ key, label, options }) => (
            <select
              key={key}
              className="border rounded-lg px-3 py-2 text-sm text-gray-700"
              value={localFilters[key]}
              onChange={(e) => { setLocalFilters({ ...localFilters, [key]: e.target.value }); setPage(1); }}
            >
              <option value="">{label}</option>
              {options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-blue-800">{selectedIds.length} selected</span>
          <button
            onClick={() => setShowPromoteModal(true)}
            className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium"
          >
            Promote
          </button>
          <button
            onClick={() => handleBulkStatus('suspended')}
            className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-medium"
          >
            Suspend
          </button>
          <button
            onClick={() => handleBulkStatus('active')}
            className="text-sm px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-medium"
          >
            Activate
          </button>
          <button
            onClick={() => handleBulkStatus('archived')}
            className="text-sm px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 font-medium"
          >
            Archive
          </button>
          <button
            onClick={() => dispatch(clearSelection())}
            className="text-sm px-3 py-1.5 rounded-lg border text-gray-600"
          >
            Clear
          </button>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading students…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mx-auto mb-3 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            <p className="text-sm font-medium">No students found</p>
            <p className="text-xs mt-1 text-gray-300">Try adjusting the filters or add a new student</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === list.length && list.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  {['Photo', 'Admission No', 'Roll No', 'Name', 'Class', 'Section', 'Parent', 'Attendance', 'Fee', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(student._id)}
                        onChange={() => dispatch(toggleSelectId(student._id))}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {student.photo ? (
                        <img src={student.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                          {student.personal?.firstName?.[0]}{student.personal?.lastName?.[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{student.admissionNo}</td>
                    <td className="px-4 py-3 text-gray-600">{student.rollNo || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {student.personal?.firstName} {student.personal?.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{student.academic?.class}</td>
                    <td className="px-4 py-3 text-gray-600">{student.academic?.section}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {student.parent?.father?.name || student.parent?.mother?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        student.attendanceSummary?.percentage >= 75 ? 'text-green-700' : 'text-red-600'
                      }`}>
                        {student.attendanceSummary?.percentage?.toFixed(0) ?? '—'}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${FEE_COLORS[student.feeStatus?.status] || 'bg-gray-100 text-gray-600'}`}>
                        {student.feeStatus?.status || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[student.status] || 'bg-gray-100 text-gray-600'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/principal/students/${student._id}`)}
                          className="text-xs px-2 py-1 rounded border text-blue-600 hover:bg-blue-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/principal/students/${student._id}/edit`)}
                          className="text-xs px-2 py-1 rounded border text-gray-600 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Archive this student?')) {
                              dispatch(archiveStudent(student._id)).then(load);
                            }
                          }}
                          className="text-xs px-2 py-1 rounded border text-yellow-600 hover:bg-yellow-50"
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Showing {list.length} of {meta.total} students
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded border disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-gray-700 font-medium">
                {page} / {meta.pages}
              </span>
              <button
                disabled={page >= meta.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded border disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showPromoteModal && (
        <BulkPromoteModal
          selectedCount={selectedIds.length}
          onConfirm={handleBulkPromote}
          onClose={() => setShowPromoteModal(false)}
        />
      )}
    </div>
  );
}
