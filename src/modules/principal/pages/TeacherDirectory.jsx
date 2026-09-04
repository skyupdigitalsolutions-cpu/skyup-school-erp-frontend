import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, UserCheck, Building2, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import {
  fetchTeachers, fetchTeacherDashboard,
  changeTeacherStatus, archiveTeacher, deleteTeacher,
  bulkTeacherStatus,
  toggleSelectTeacher, selectAllTeachers, clearTeacherSelection,
  setTeacherFilters,
} from '@/features/principal/teacherSlice';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  on_leave: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800',
  resigned: 'bg-orange-100 text-orange-800',
  archived: 'bg-yellow-100 text-yellow-800',
};


export default function TeacherDirectory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, meta, dashboard, listLoading, selectedIds } = useSelector(
    (s) => s.principalTeachers
  );
  const loading = listLoading;

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    department: '', status: '', employmentType: '', subject: '',
  });
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    const params = { ...filters, q: search, page, limit: 20 };
    dispatch(fetchTeachers(params));
    dispatch(setTeacherFilters(params));
  }, [dispatch, filters, search, page]);

  useEffect(() => {
    dispatch(fetchTeacherDashboard());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleBulkStatus = (status) => {
    if (!selectedIds.length) return;
    dispatch(bulkTeacherStatus({ ids: selectedIds, status })).then(() => {
      dispatch(clearTeacherSelection());
      load();
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === list.length) {
      dispatch(clearTeacherSelection());
    } else {
      dispatch(selectAllTeachers(list.map((t) => t._id)));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Directory, profiles, assignments and performance tracking</p>
        </div>
        <button
          onClick={() => navigate('/principal/teachers/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Teacher
        </button>
      </div>

      {/* Dashboard stats */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Teachers" value={dashboard.total} theme="blue" icon={GraduationCap} />
          <StatCard label="Active" value={dashboard.active} theme="emerald" icon={UserCheck} />
          <StatCard label="Departments" value={dashboard.departmentStats?.length} theme="violet" icon={Building2} />
          <StatCard
            label="Avg Attendance"
            theme="amber"
            icon={TrendingUp}
            value={
              dashboard.departmentStats?.length
                ? `${(dashboard.departmentStats.reduce((s, d) => s + (d.avgAttendance || 0), 0) / dashboard.departmentStats.length).toFixed(0)}%`
                : '—'
            }
          />
        </div>
      )}

      {/* Department breakdown */}
      {dashboard?.departmentStats?.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Department Analytics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {dashboard.departmentStats.map((dept) => (
              <div key={dept._id} className="bg-gray-50 rounded-lg p-3 border">
                <p className="text-xs font-semibold text-gray-700 truncate">{dept._id}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{dept.total}</p>
                <p className="text-xs text-gray-500">{dept.active} active</p>
                {dept.avgRating != null && (
                  <p className="text-xs text-yellow-600">★ {dept.avgRating?.toFixed(1)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name, employee ID, email..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button
            onClick={load}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 font-medium"
          >
            Search
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'department', label: 'Department', options: ['Mathematics','Science','English','Social Studies','Computer Science','Physical Education','Arts','Music'] },
            { key: 'status', label: 'Status', options: ['active','inactive','on_leave','suspended','resigned','archived'] },
            { key: 'employmentType', label: 'Employment', options: ['permanent','contract','part_time','visiting'] },
            { key: 'subject', label: 'Subject', options: ['Mathematics','Physics','Chemistry','Biology','English','History','Geography'] },
          ].map(({ key, label, options }) => (
            <select
              key={key}
              className="border rounded-lg px-3 py-2 text-sm text-gray-700"
              value={filters[key]}
              onChange={(e) => { setFilters({ ...filters, [key]: e.target.value }); setPage(1); }}
            >
              <option value="">{label}</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-blue-800">{selectedIds.length} selected</span>
          <button onClick={() => handleBulkStatus('suspended')} className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-medium">Suspend</button>
          <button onClick={() => handleBulkStatus('active')} className="text-sm px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-medium">Activate</button>
          <button onClick={() => handleBulkStatus('archived')} className="text-sm px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 font-medium">Archive</button>
          <button onClick={() => dispatch(clearTeacherSelection())} className="text-sm px-3 py-1.5 rounded-lg border text-gray-600">Clear</button>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading teachers…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mx-auto mb-3 text-gray-300">
              <rect x="3" y="3" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 16v5M9 9l2 2 4-4" />
            </svg>
            <p className="text-sm font-medium">No teachers found</p>
            <p className="text-xs mt-1 text-gray-300">Try adjusting the filters or add a new teacher</p>
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
                  {['Photo', 'Employee ID', 'Name', 'Department', 'Designation', 'Subjects', 'Attendance', 'Leave', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((teacher) => {
                  const p = teacher.personal || {};
                  const pro = teacher.professional || {};
                  return (
                    <tr key={teacher._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(teacher._id)}
                          onChange={() => dispatch(toggleSelectTeacher(teacher._id))}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {teacher.photo ? (
                          <img src={teacher.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs">
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{teacher.employeeId}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.firstName} {p.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{pro.department}</td>
                      <td className="px-4 py-3 text-gray-600">{pro.designation}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {teacher.assignedSubjects?.slice(0, 2).map((s) => s.subject).join(', ') || '—'}
                        {teacher.assignedSubjects?.length > 2 && ` +${teacher.assignedSubjects.length - 2}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${teacher.attendanceSummary?.percentage >= 90 ? 'text-green-700' : 'text-orange-600'}`}>
                          {teacher.attendanceSummary?.percentage?.toFixed(0) ?? '—'}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {teacher.leaveSummary?.usedLeaves ?? '—'}/{teacher.leaveSummary?.totalLeaves ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[teacher.status] || 'bg-gray-100 text-gray-600'}`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {pro.joiningDate ? new Date(pro.joiningDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigate(`/principal/teachers/${teacher._id}`)}
                            className="text-xs px-2 py-1 rounded border text-blue-600 hover:bg-blue-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/principal/teachers/${teacher._id}/edit`)}
                            className="text-xs px-2 py-1 rounded border text-gray-600 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Archive this teacher?')) {
                                dispatch(archiveTeacher(teacher._id)).then(load);
                              }
                            }}
                            className="text-xs px-2 py-1 rounded border text-yellow-600 hover:bg-yellow-50"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta.pages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">Showing {list.length} of {meta.total} teachers</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded border disabled:opacity-40 hover:bg-gray-50">Previous</button>
              <span className="px-3 py-1.5 text-gray-700 font-medium">{page} / {meta.pages}</span>
              <button disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded border disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
