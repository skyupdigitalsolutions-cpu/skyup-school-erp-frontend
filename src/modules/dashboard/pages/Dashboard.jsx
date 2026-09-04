import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, ShieldCheck, School, CalendarDays, ClipboardList,
  IndianRupee, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { fetchDashboardSummary } from '@/features/dashboard/dashboardSlice';

const STAT_THEMES = {
  blue: { bg: 'bg-blue-50', ring: 'ring-blue-100', icon: 'bg-blue-600', text: 'text-blue-700' },
  emerald: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', icon: 'bg-emerald-600', text: 'text-emerald-700' },
  violet: { bg: 'bg-violet-50', ring: 'ring-violet-100', icon: 'bg-violet-600', text: 'text-violet-700' },
  amber: { bg: 'bg-amber-50', ring: 'ring-amber-100', icon: 'bg-amber-600', text: 'text-amber-700' },
};

function StatCard({ label, value, sub, theme, Icon, onClick }) {
  const t = STAT_THEMES[theme];
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl ${t.bg} ring-1 ${t.ring} p-5 transition hover:shadow-md hover:-translate-y-0.5 duration-150`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500">{label}</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{value ?? '—'}</p>
          {sub && <p className={`text-xs mt-1 font-medium ${t.text}`}>{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${t.icon} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
      </div>
    </button>
  );
}

function Panel({ title, icon: Icon, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ListRows({ items, empty, renderItem }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">{empty}</p>;
  }
  return <ul className="divide-y divide-gray-50 -mx-2">{items.map(renderItem)}</ul>;
}

const FEE_COLORS = { paid: '#10b981', pending: '#f59e0b', partial: '#3b82f6', overdue: '#ef4444', refunded: '#94a3b8' };
const FEE_LABELS = { paid: 'Paid', pending: 'Pending', partial: 'Partial', overdue: 'Overdue', refunded: 'Refunded' };
const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const EXAM_STATUS_STYLE = {
  scheduled: 'bg-blue-50 text-blue-700',
  ongoing: 'bg-amber-50 text-amber-700',
  results_published: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-gray-100 text-gray-600',
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { summary, loading, error } = useSelector((s) => s.dashboard);

  useEffect(() => { dispatch(fetchDashboardSummary()); }, [dispatch]);

  const feeData = summary
    ? Object.entries(summary.fees || {})
        .filter(([, amount]) => amount > 0)
        .map(([status, amount]) => ({ status, amount, label: FEE_LABELS[status] || status }))
    : [];
  const totalCollectable = feeData.reduce((sum, d) => sum + d.amount, 0);
  const totalPaid = summary?.fees?.paid || 0;

  const trendData = (summary?.attendanceTrend || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">A live overview of your school</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading && !summary ? (
        <div className="p-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-400">Loading dashboard…</p>
        </div>
      ) : summary && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Students" value={summary.students.total} sub={`${summary.students.active} active`}
              theme="blue" Icon={Users} onClick={() => navigate('/principal/students')}
            />
            <StatCard
              label="Teachers" value={summary.teachers.total} sub={`${summary.teachers.active} active`}
              theme="emerald" Icon={GraduationCap} onClick={() => navigate('/principal/teachers')}
            />
            <StatCard
              label="Caretakers" value={summary.caretakers.total} sub={`${summary.caretakers.active} active`}
              theme="violet" Icon={ShieldCheck} onClick={() => navigate('/principal/caretakers')}
            />
            <StatCard
              label="Classes" value={summary.classes.total} sub="active classes"
              theme="amber" Icon={School} onClick={() => navigate('/principal/classes')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Attendance trend — spans 3/5 on large screens */}
            <div className="lg:col-span-3">
              <Panel title="Attendance — last 7 days" icon={TrendingUp}>
                {trendData.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-14">No attendance recorded yet this week.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''}
                      />
                      <Area type="monotone" dataKey="present" name="Present" stroke="#2563eb" strokeWidth={2} fill="url(#presentGradient)" />
                      <Area type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={2} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Panel>
            </div>

            {/* Fee collection breakdown */}
            <div className="lg:col-span-2">
              <Panel title="Fee collection" icon={IndianRupee}>
                {feeData.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-14">No fee transactions yet.</p>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 shrink-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={feeData} dataKey="amount" nameKey="label"
                            innerRadius={38} outerRadius={58} paddingAngle={2} strokeWidth={0}
                          >
                            {feeData.map((d) => <Cell key={d.status} fill={FEE_COLORS[d.status] || '#94a3b8'} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] text-gray-400">Collected</p>
                        <p className="text-sm font-bold text-gray-800">
                          {totalCollectable ? Math.round((totalPaid / totalCollectable) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-1.5 flex-1 min-w-0">
                      {feeData.map((d) => (
                        <li key={d.status} className="flex items-center justify-between text-xs gap-2">
                          <span className="flex items-center gap-1.5 text-gray-600 truncate">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: FEE_COLORS[d.status] }} />
                            {d.label}
                          </span>
                          <span className="font-semibold text-gray-800 shrink-0">{INR.format(d.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Panel>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel
              title={`Upcoming Events (${summary.events.upcoming})`}
              icon={CalendarDays}
              action={<button onClick={() => navigate('/principal/events')} className="text-xs font-medium text-blue-600 hover:underline">View all</button>}
            >
              <ListRows
                items={summary.events.recent}
                empty="No upcoming events."
                renderItem={(e) => (
                  <li key={e._id} className="px-2 py-2.5 flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{e.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{e.category}</p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0 ml-3">
                      {e.schedule?.startDate ? new Date(e.schedule.startDate).toLocaleDateString() : '—'}
                    </span>
                  </li>
                )}
              />
            </Panel>

            <Panel
              title={`Exams (${summary.exams.ongoing} ongoing)`}
              icon={ClipboardList}
              action={<button onClick={() => navigate('/principal/exams')} className="text-xs font-medium text-blue-600 hover:underline">View all</button>}
            >
              <ListRows
                items={summary.exams.recent}
                empty="No exams found."
                renderItem={(e) => (
                  <li key={e._id} className="px-2 py-2.5 flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{e.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{e.type?.replace('_', ' ')} · {e.academicYear}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ml-3 ${EXAM_STATUS_STYLE[e.status] || 'bg-gray-100 text-gray-600'}`}>
                      {e.status?.replace('_', ' ')}
                    </span>
                  </li>
                )}
              />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
