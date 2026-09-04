import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStudent, fetchStudentTimeline,
  changeStudentStatus, archiveStudent,
  addBehaviourNote, addStudentAward,
} from '@/features/principal/studentSlice';

const TABS = [
  'Overview', 'Personal', 'Academic', 'Parent',
  'Attendance', 'Exam', 'Fee', 'Transport',
  'Library', 'Medical', 'Behaviour', 'Awards',
  'Timeline', 'Documents',
];

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-800',
  transferred: 'bg-blue-100 text-blue-800',
  archived: 'bg-yellow-100 text-yellow-800',
  alumni: 'bg-purple-100 text-purple-800',
};

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2 border-b last:border-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-44 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{value || '—'}</span>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border p-5 space-y-1">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      {children}
    </div>
  );
}

function AddNoteModal({ onConfirm, onClose }) {
  const [form, setForm] = useState({ note: '', type: 'neutral' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Behaviour Note</h3>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm h-28"
          placeholder="Describe the behaviour..."
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
        <select
          className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </select>
        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border">Cancel</button>
          <button onClick={() => onConfirm(form)} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

function AddAwardModal({ onConfirm, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Award</h3>
        {[
          { key: 'title', label: 'Title', required: true },
          { key: 'description', label: 'Description' },
          { key: 'category', label: 'Category' },
        ].map(({ key, label }) => (
          <div key={key} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border">Cancel</button>
          <button onClick={() => onConfirm(form)} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: student, timeline, profileLoading } = useSelector((s) => s.principalStudents);

  const [activeTab, setActiveTab] = useState('Overview');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudent(id));
      dispatch(fetchStudentTimeline({ id, params: { limit: 30 } }));
    }
  }, [dispatch, id]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading student profile…
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Student not found.
      </div>
    );
  }

  const handleStatusChange = (status) => {
    dispatch(changeStudentStatus({ id, status }));
  };

  const handleAddNote = (note) => {
    dispatch(addBehaviourNote({ id, note }));
    setShowNoteModal(false);
  };

  const handleAddAward = (award) => {
    dispatch(addStudentAward({ id, award }));
    setShowAwardModal(false);
  };

  const p = student.personal || {};
  const ac = student.academic || {};
  const parent = student.parent || {};

  return (
    <div className="p-6 space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-xl border p-5 flex flex-col md:flex-row md:items-center gap-5">
        <div className="shrink-0">
          {student.photo ? (
            <img src={student.photo} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
              {p.firstName?.[0]}{p.lastName?.[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{p.firstName} {p.lastName}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[student.status]}`}>
              {student.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {ac.class} — {ac.section} · Admission: {student.admissionNo} · Year: {ac.academicYear}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => navigate(`/principal/students/${id}/edit`)}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={() => handleStatusChange(student.status === 'suspended' ? 'active' : 'suspended')}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium text-red-600 hover:bg-red-50"
            >
              {student.status === 'suspended' ? 'Restore' : 'Suspend'}
            </button>
            <button
              onClick={() => dispatch(archiveStudent(id))}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium text-yellow-600 hover:bg-yellow-50"
            >
              Archive
            </button>
            <select
              className="text-xs px-3 py-1.5 rounded-lg border font-medium text-gray-600"
              value=""
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="">Change Status…</option>
              {['active','inactive','transferred','alumni'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Quick stats */}
        <div className="flex gap-4 shrink-0">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {student.attendanceSummary?.percentage?.toFixed(0) ?? '—'}%
            </p>
            <p className="text-xs text-gray-500">Attendance</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${student.feeStatus?.dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{(student.feeStatus?.dueAmount ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Fee Due</p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="flex overflow-x-auto border-b scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
                <InfoRow label="Full Name" value={`${p.firstName} ${p.lastName}`} />
                <InfoRow label="DOB" value={p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : null} />
                <InfoRow label="Gender" value={p.gender} />
                <InfoRow label="Blood Group" value={p.bloodGroup} />
                <InfoRow label="Phone" value={p.phone} />
                <InfoRow label="Email" value={p.email} />
              </SectionCard>
              <SectionCard title="Academic">
                <InfoRow label="Class" value={ac.class} />
                <InfoRow label="Section" value={ac.section} />
                <InfoRow label="House" value={ac.house} />
                <InfoRow label="Academic Year" value={ac.academicYear} />
                <InfoRow label="Admission Date" value={ac.admissionDate ? new Date(ac.admissionDate).toLocaleDateString() : null} />
              </SectionCard>
              <SectionCard title="Attendance Summary">
                <InfoRow label="Total Days" value={student.attendanceSummary?.totalDays} />
                <InfoRow label="Present Days" value={student.attendanceSummary?.presentDays} />
                <InfoRow label="Percentage" value={`${student.attendanceSummary?.percentage?.toFixed(1)}%`} />
              </SectionCard>
              <SectionCard title="Fee Status">
                <InfoRow label="Total Fee" value={`₹${(student.feeStatus?.totalFee ?? 0).toLocaleString()}`} />
                <InfoRow label="Paid" value={`₹${(student.feeStatus?.paidAmount ?? 0).toLocaleString()}`} />
                <InfoRow label="Due" value={`₹${(student.feeStatus?.dueAmount ?? 0).toLocaleString()}`} />
                <InfoRow label="Status" value={student.feeStatus?.status} />
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
              <InfoRow label="Religion" value={p.religion} />
              <InfoRow label="Phone" value={p.phone} />
              <InfoRow label="Email" value={p.email} />
              {p.address && (
                <InfoRow label="Address" value={[p.address.line1, p.address.city, p.address.state, p.address.pincode].filter(Boolean).join(', ')} />
              )}
            </SectionCard>
          )}

          {/* Academic */}
          {activeTab === 'Academic' && (
            <SectionCard>
              <InfoRow label="Admission No" value={student.admissionNo} />
              <InfoRow label="Roll No" value={student.rollNo} />
              <InfoRow label="Class" value={ac.class} />
              <InfoRow label="Section" value={ac.section} />
              <InfoRow label="House" value={ac.house} />
              <InfoRow label="Academic Year" value={ac.academicYear} />
              <InfoRow label="Admission Date" value={ac.admissionDate ? new Date(ac.admissionDate).toLocaleDateString() : null} />
              {ac.subjects?.length > 0 && (
                <InfoRow label="Subjects" value={ac.subjects.join(', ')} />
              )}
            </SectionCard>
          )}

          {/* Parent */}
          {activeTab === 'Parent' && (
            <div className="grid md:grid-cols-3 gap-4">
              {['father', 'mother', 'guardian'].map((type) => (
                parent[type]?.name && (
                  <SectionCard key={type} title={type.charAt(0).toUpperCase() + type.slice(1)}>
                    <InfoRow label="Name" value={parent[type].name} />
                    <InfoRow label="Phone" value={parent[type].phone} />
                    <InfoRow label="Email" value={parent[type].email} />
                    <InfoRow label="Occupation" value={parent[type].occupation} />
                    {type === 'guardian' && <InfoRow label="Relation" value={parent[type].relation} />}
                  </SectionCard>
                )
              ))}
            </div>
          )}

          {/* Medical */}
          {activeTab === 'Medical' && (
            <SectionCard>
              <InfoRow label="Allergies" value={student.medical?.allergies?.join(', ')} />
              <InfoRow label="Conditions" value={student.medical?.conditions?.join(', ')} />
              <InfoRow label="Medications" value={student.medical?.medications?.join(', ')} />
              <InfoRow label="Emergency Contact" value={student.medical?.emergencyContact} />
              <InfoRow label="Notes" value={student.medical?.notes} />
            </SectionCard>
          )}

          {/* Transport */}
          {activeTab === 'Transport' && (
            <SectionCard>
              <InfoRow label="Enrolled" value={student.transport?.enrolled ? 'Yes' : 'No'} />
              <InfoRow label="Route No" value={student.transport?.routeNo} />
              <InfoRow label="Stop Name" value={student.transport?.stopName} />
              <InfoRow label="Vehicle No" value={student.transport?.vehicleNo} />
            </SectionCard>
          )}

          {/* Library */}
          {activeTab === 'Library' && (
            <SectionCard>
              <InfoRow label="Library Card No" value={student.library?.cardNo} />
              <InfoRow label="Books Issued" value={student.library?.booksIssued} />
              <InfoRow label="Has Overdue" value={student.library?.hasOverdue ? 'Yes' : 'No'} />
            </SectionCard>
          )}

          {/* Attendance */}
          {activeTab === 'Attendance' && (
            <SectionCard>
              <InfoRow label="Total Days" value={student.attendanceSummary?.totalDays} />
              <InfoRow label="Present Days" value={student.attendanceSummary?.presentDays} />
              <InfoRow label="Percentage" value={`${student.attendanceSummary?.percentage?.toFixed(2)}%`} />
              <InfoRow label="Last Updated" value={student.attendanceSummary?.lastUpdated ? new Date(student.attendanceSummary.lastUpdated).toLocaleDateString() : null} />
            </SectionCard>
          )}

          {/* Fee */}
          {activeTab === 'Fee' && (
            <SectionCard>
              <InfoRow label="Total Fee" value={`₹${(student.feeStatus?.totalFee ?? 0).toLocaleString()}`} />
              <InfoRow label="Paid Amount" value={`₹${(student.feeStatus?.paidAmount ?? 0).toLocaleString()}`} />
              <InfoRow label="Due Amount" value={`₹${(student.feeStatus?.dueAmount ?? 0).toLocaleString()}`} />
              <InfoRow label="Last Paid Date" value={student.feeStatus?.lastPaidDate ? new Date(student.feeStatus.lastPaidDate).toLocaleDateString() : null} />
              <InfoRow label="Status" value={student.feeStatus?.status} />
            </SectionCard>
          )}

          {/* Behaviour */}
          {activeTab === 'Behaviour' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white font-medium"
                >
                  + Add Note
                </button>
              </div>
              {student.behaviourNotes?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No behaviour notes recorded.</p>
              )}
              {student.behaviourNotes?.map((note, i) => (
                <div key={i} className={`p-4 rounded-xl border ${note.type === 'positive' ? 'bg-green-50 border-green-200' : note.type === 'negative' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-sm text-gray-800">{note.note}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(note.date).toLocaleDateString()} · {note.type}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Awards */}
          {activeTab === 'Awards' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAwardModal(true)}
                  className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white font-medium"
                >
                  + Add Award
                </button>
              </div>
              {student.awards?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No awards recorded.</p>
              )}
              <div className="grid md:grid-cols-2 gap-3">
                {student.awards?.map((award, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-yellow-50 border-yellow-200">
                    <p className="font-semibold text-gray-800">{award.title}</p>
                    {award.category && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">{award.category}</span>}
                    {award.description && <p className="text-sm text-gray-600 mt-1">{award.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(award.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'Documents' && (
            <div className="space-y-3">
              {student.documents?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No documents uploaded.</p>
              )}
              {student.documents?.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-gray-50">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{doc.name}</p>
                    {doc.type && <p className="text-xs text-gray-500">{doc.type}</p>}
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {activeTab === 'Timeline' && (
            <div className="space-y-3">
              {timeline.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No activity recorded.</p>
              )}
              {timeline.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
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

          {/* Exam */}
          {activeTab === 'Exam' && (
            <p className="text-sm text-gray-400 text-center py-8">Exam performance data is managed by the Examinations module.</p>
          )}
        </div>
      </div>

      {showNoteModal && <AddNoteModal onConfirm={handleAddNote} onClose={() => setShowNoteModal(false)} />}
      {showAwardModal && <AddAwardModal onConfirm={handleAddAward} onClose={() => setShowAwardModal(false)} />}
    </div>
  );
}
