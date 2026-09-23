import { useSelector } from 'react-redux';

export default function Dashboard() {
  const user = useSelector((s) => s.auth.user);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.name || 'Student'}</h1>
      <p className="text-sm text-gray-500 mt-1">
        This is your own portal — separate from the Principal dashboard.
      </p>

      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm text-gray-600">
          Student-specific modules (homework, exams, timetable, fees, attendance, etc.)
          go here as they're built out.
        </p>
      </div>
    </div>
  );
}
