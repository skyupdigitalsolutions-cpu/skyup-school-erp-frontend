import { lazy, Suspense } from 'react';
const EventDirectory = lazy(() => import('./pages/EventDirectory'));
const AddEvent = lazy(() => import('./pages/AddEvent'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>; }
const wrap = C => <Suspense fallback={<Loading />}><C /></Suspense>;

/**
 * IMPORTANT: specific paths (events/new) MUST come before param paths
 * (events/:id, events/:id/edit) so React Router doesn't treat "new" as an :id.
 */
export const eventRoutes = [
  { path: 'events', element: wrap(EventDirectory) },
  { path: 'events/new', element: wrap(AddEvent) },
  { path: 'events/:id/edit', element: wrap(AddEvent) },
  { path: 'events/:id', element: wrap(EventDetail) },
];
