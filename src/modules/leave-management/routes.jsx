import { lazy, Suspense } from 'react';
const LeaveDirectory = lazy(() => import('./pages/LeaveDirectory'));
const AddLeaveRequest = lazy(() => import('./pages/AddLeaveRequest'));
function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>; }
const wrap = C => <Suspense fallback={<Loading />}><C /></Suspense>;

export const leaveManagementRoutes = [
  { path: 'leave-management', element: wrap(LeaveDirectory) },
  { path: 'leave-management/new', element: wrap(AddLeaveRequest) },
];