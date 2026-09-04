import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTeacher, fetchTeacherTimeline,
  changeTeacherStatus, archiveTeacher,
  addTeacherPerformanceReview, assignTeacherSubjects,
  assignTeacherAsset, updateTeacherAiInsights,
} from '@/features/principal/teacherSlice';

const TABS = [
  'Overview', 'Personal', 'Professional', 'Qualification',
  'Classes & Subjects', 'Attendance', 'Leave', 'Payroll',
  'Performance', 'Assets', 'Documents', 'Timeline', 'AI Insights',
];

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  on_leave: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800',
  resigned: 'bg-orange-100 text-orange-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2 border-b last:border-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{value || '—'}</span>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      {children}
    </div>
  );
}

function ReviewModal({ onConfirm, onClose }) {
  const [form, setForm] = useState({ rating: 3, remarks: '' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Performance Review</h3>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
          <input
            type="number" min="0" max="5" step="0.5"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm h-24"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />
        </div>
        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border">Cancel</button>
          <button onClick={() => onConfirm(form)} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: teacher, timeline, profileLoading } = useSelector((s) => s.principalTeachers);

  const [activeTab, setActiveTab] = useState('Overview');
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTeacher(id));
      dispatch(fetchTeacherTimeline({ id, params: { limit: 30 } }));
    }
  }, [dispatch, id]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading teacher profile…
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Teacher not found.
      </div>
    );
  }

  const p = teacher.personal || {};
  const pro = teacher.professional || {};

  const handleAddReview = (review) => {
    dispatch(addTeacherPerformanceReview({ id, review }));
    setShowReviewModal(false);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border p-5 flex flex-col md:flex-row md:items-center gap-5">
        <div className="shrink-0">
          {teacher.photo ? (
            <img src={teacher.photo} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-2xl font-bold">
              {p.firstName?.[0]}{p.lastName?.[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{p.firstName} {p.lastName}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[teacher.status]}`}>
              {teacher.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {pro.designation} · {pro.department} · ID: {teacher.employeeId}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={() => navigate(`/principal/teachers/${id}/edit`)} className="text-xs px-3 py-1.5 rounded-lg border font-medium hover:bg-gray-50">Edit</button>
            <button
              onClick={() => dispatch(changeTeacherStatus({ id, status: teacher.status === 'suspended' ? 'active' : 'suspended' }))}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium text-red-600 hover:bg-red-50"
            >
              {teacher.status === 'suspended' ? 'Restore' : 'Suspend'}
            </button>
            <button onClick={() => dispatch(archiveTeacher(id))} className="text-xs px-3 py-1.5 rounded-lg border font-medium text-yellow-600 hover:bg-yellow-50">Archive</button>
          </div>
        </div>
        <div className="flex gap-4 shrink-0">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{teacher.attendanceSummary?.percentage?.toFixed(0) ?? '—'}%</p>
            <p className="text-xs text-gray-500">Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {teacher.performance?.lastRating != null ? `${teacher.performance.lastRating}/5` : '—'}
            </p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{pro.experienceYears ?? '—'}</p>
            <p className="text-xs text-gray-500">Exp. (yrs)</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="flex overflow-x-auto border-b scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview */}
          {activeTab === 'Overview' && (
            <div className="grid md:grid-cols-2 gap-4">
              <SectionCard title="Personal">
                <InfoRow label="Name" value={`${p.firstName} ${p.lastName}`} />
                <InfoRow label="Phone" value={p.phone} />
                <InfoRow label="Email" value={p.email} />
                <InfoRow label="Gender" value={p.gender} />
                <InfoRow label="Blood Group" value={p.bloodGroup} />
              </SectionCard>
              <SectionCard title="Professional">
                <InfoRow label="Department" value={pro.department} />
                <InfoRow label="Designation" value={pro.designation} />
                <InfoRow label="Employment Type" value={pro.employmentType} />
                <InfoRow label="Joining Date" value={pro.joiningDate ? new Date(pro.joiningDate).toLocaleDateString() : null} />
                <InfoRow label="Experience" value={`${pro.experienceYears} years`} />
              </SectionCard>
              <SectionCard title="Attendance">
                <InfoRow label="Total Days" value={teacher.attendanceSummary?.totalDays} />
                <InfoRow label="Present Days" value={teacher.attendanceSummary?.presentDays} />
                <InfoRow label="Percentage" value={`${teacher.attendanceSummary?.percentage?.toFixed(1)}%`} />
              </SectionCard>
              <SectionCard title="Leave">
                <InfoRow label="Total Leaves" value={teacher.leaveSummary?.totalLeaves} />
                <InfoRow label="Used Leaves" value={teacher.leaveSummary?.usedLeaves} />
                <InfoRow label="Pending" value={teacher.leaveSummary?.pendingLeaves} />
              </SectionCard>
            </div>
          )}

          {/* Personal */}
          {activeTab === 'Personal' && (
            <SectionCard>
              <InfoRow label="First Name" value={p.firstName} />
              <InfoRow label="Last Name" value={p.lastName} />
              <InfoRow label="Date of Birth" value={p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : null} />
              <InfoRow label="Gender" value={p.gender} />
              <InfoRow label="Blood Group" value={p.bloodGroup} />
              <InfoRow label="Nationality" value={p.nationality} />
              <InfoRow label="Phone" value={p.phone} />
              <InfoRow label="Email" value={p.email} />
              {p.emergencyContact?.name && (
                <InfoRow label="Emergency Contact" value={`${p.emergencyContact.name} (${p.emergencyContact.relation}) — ${p.emergencyContact.phone}`} />
              )}
              {p.address && (
                <InfoRow label="Address" value={[p.address.line1, p.address.city, p.address.state].filter(Boolean).join(', ')} />
              )}
            </SectionCard>
          )}

          {/* Professional */}
          {activeTab === 'Professional' && (
            <SectionCard>
              <InfoRow label="Employee ID" value={teacher.employeeId} />
              <InfoRow label="Department" value={pro.department} />
              <InfoRow label="Designation" value={pro.designation} />
              <InfoRow label="Employment Type" value={pro.employmentType} />
              <InfoRow label="Joining Date" value={pro.joiningDate ? new Date(pro.joiningDate).toLocaleDateString() : null} />
              <InfoRow label="Experience Years" value={pro.experienceYears} />
            </SectionCard>
          )}

          {/* Qualification */}
          {activeTab === 'Qualification' && (
            <div className="space-y-3">
              {teacher.qualifications?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No qualifications recorded.</p>
              )}
              {teacher.qualifications?.map((q, i) => (
                <SectionCard key={i} title={q.degree}>
                  <InfoRow label="Specialization" value={q.specialization} />
                  <InfoRow label="Institution" value={q.institution} />
                  <InfoRow label="Year of Passing" value={q.yearOfPassing} />
                  <InfoRow label="Grade" value={q.grade} />
                </SectionCard>
              ))}
            </div>
          )}

          {/* Classes & Subjects */}
          {activeTab === 'Classes & Subjects' && (
            <div className="space-y-3">
              {teacher.assignedSubjects?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No subjects assigned.</p>
              )}
              <div className="grid md:grid-cols-2 gap-3">
                {teacher.assignedSubjects?.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl border bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{s.subject}</p>
                      <p className="text-xs text-gray-500">Class {s.class} — {s.section} · {s.academicYear}</p>
                    </div>
                    {s.isClassTeacher && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Class Teacher</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payroll */}
          {activeTab === 'Payroll' && (
            <SectionCard>
              <InfoRow label="Basic Salary" value={`₹${(teacher.payroll?.basicSalary ?? 0).toLocaleString()}`} />
              <InfoRow label="Gross Salary" value={`₹${(teacher.payroll?.grossSalary ?? 0).toLocaleString()}`} />
              <InfoRow label="Bank Name" value={teacher.payroll?.bankName} />
              <InfoRow label="Account No" value={teacher.payroll?.accountNo ? `****${teacher.payroll.accountNo.slice(-4)}` : null} />
              <InfoRow label="Last Paid Month" value={teacher.payroll?.lastPaidMonth} />
              <InfoRow label="Last Paid Amount" value={teacher.payroll?.lastPaidAmount ? `₹${teacher.payroll.lastPaidAmount.toLocaleString()}` : null} />
            </SectionCard>
          )}

          {/* Performance */}
          {activeTab === 'Performance' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowReviewModal(true)} className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white font-medium">+ Add Review</button>
              </div>
              <div className="flex items-center gap-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-4xl font-bold text-yellow-600">{teacher.performance?.lastRating?.toFixed(1) ?? '—'}</p>
                <div>
                  <p className="font-semibold text-gray-800">Current Rating</p>
                  <p className="text-xs text-gray-500">
                    {teacher.performance?.lastReviewDate ? `Last reviewed ${new Date(teacher.performance.lastReviewDate).toLocaleDateString()}` : 'Not reviewed yet'}
                  </p>
                </div>
              </div>
              {teacher.performance?.reviews?.map((review, i) => (
                <div key={i} className="p-4 rounded-xl border bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-yellow-600">★ {review.rating}/5</span>
                    <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  {review.remarks && <p className="text-sm text-gray-700 mt-1">{review.remarks}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Assets */}
          {activeTab === 'Assets' && (
            <div className="space-y-3">
              {teacher.assets?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No assets assigned.</p>
              )}
              {teacher.assets?.map((asset, i) => (
                <div key={i} className="p-3 rounded-xl border flex items-center justify-between bg-gray-50">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{asset.assetName}</p>
                    {asset.assetId && <p className="text-xs text-gray-500">ID: {asset.assetId}</p>}
                    <p className="text-xs text-gray-400">{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : '—'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    asset.status === 'assigned' ? 'bg-green-100 text-green-700' :
                    asset.status === 'returned' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-700'
                  }`}>{asset.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Documents */}
          {activeTab === 'Documents' && (
            <div className="space-y-3">
              {teacher.documents?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No documents uploaded.</p>
              )}
              {teacher.documents?.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-gray-50">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{doc.name}</p>
                    {doc.type && <p className="text-xs text-gray-500">{doc.type}</p>}
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Download</a>
                </div>
              ))}
            </div>
          )}

          {/* AI Insights */}
          {activeTab === 'AI Insights' && (
            <div className="space-y-4">
              {!teacher.aiInsights?.generatedAt ? (
                <p className="text-sm text-gray-400 text-center py-8">No AI insights generated yet.</p>
              ) : (
                <>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Summary</h4>
                    <p className="text-sm text-gray-700">{teacher.aiInsights.summary}</p>
                    <p className="text-xs text-gray-400 mt-2">Generated {new Date(teacher.aiInsights.generatedAt).toLocaleDateString()}</p>
                  </div>
                  {teacher.aiInsights?.strengths?.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {teacher.aiInsights.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2">
                            <span className="text-green-500">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {teacher.aiInsights?.areasOfImprovement?.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Areas of Improvement</h4>
                      <ul className="space-y-1">
                        {teacher.aiInsights.areasOfImprovement.map((s, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2">
                            <span className="text-orange-500">→</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Attendance / Leave */}
          {activeTab === 'Attendance' && (
            <SectionCard>
              <InfoRow label="Total Days" value={teacher.attendanceSummary?.totalDays} />
              <InfoRow label="Present Days" value={teacher.attendanceSummary?.presentDays} />
              <InfoRow label="Percentage" value={`${teacher.attendanceSummary?.percentage?.toFixed(2)}%`} />
            </SectionCard>
          )}

          {activeTab === 'Leave' && (
            <SectionCard>
              <InfoRow label="Total Leaves" value={teacher.leaveSummary?.totalLeaves} />
              <InfoRow label="Used Leaves" value={teacher.leaveSummary?.usedLeaves} />
              <InfoRow label="Pending Approval" value={teacher.leaveSummary?.pendingLeaves} />
            </SectionCard>
          )}

          {/* Timeline */}
          {activeTab === 'Timeline' && (
            <div className="space-y-3">
              {timeline.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No activity recorded.</p>
              )}
              {timeline.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800">{log.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(log.performedAt).toLocaleString()}
                      {log.performedBy && ` · by ${log.performedBy.name || log.performedBy.email}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showReviewModal && <ReviewModal onConfirm={handleAddReview} onClose={() => setShowReviewModal(false)} />}
    </div>
  );
}
