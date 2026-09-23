import { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./pages/Dashboard'));
function Loading() {
  return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>;
}
const wrap = (C) => (
  <Suspense fallback={<Loading />}>
    <C />
  </Suspense>
);

export const teacherRoutes = [{ path: 'dashboard', element: wrap(Dashboard) }];
