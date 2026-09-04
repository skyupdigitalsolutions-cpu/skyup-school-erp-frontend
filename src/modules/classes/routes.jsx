import { lazy, Suspense } from 'react';
const ClassDirectory = lazy(() => import('./pages/ClassDirectory'));
const AddClass = lazy(() => import('./pages/AddClass'));
function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>; }
const wrap = C => <Suspense fallback={<Loading />}><C /></Suspense>;

/**
 * IMPORTANT: specific paths (classes/new) MUST come before the param path
 * (classes/:id/edit) so React Router doesn't treat "new" as an :id.
 */
export const classRoutes = [
  { path: 'classes', element: wrap(ClassDirectory) },
  { path: 'classes/new', element: wrap(AddClass) },
  { path: 'classes/:id/edit', element: wrap(AddClass) },
];