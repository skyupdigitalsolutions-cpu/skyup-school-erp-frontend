import { lazy, Suspense } from 'react';
const EventDirectory = lazy(() => import('./pages/EventDirectory'));
const AddEvent = lazy(() => import('./pages/AddEvent'));
function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>; }
const wrap = C => <Suspense fallback={<Loading />}><C /></Suspense>;
export const eventRoutes = [
  { path: 'events', element: wrap(EventDirectory) },
  { path: 'events/new', element: wrap(AddEvent) },
];
