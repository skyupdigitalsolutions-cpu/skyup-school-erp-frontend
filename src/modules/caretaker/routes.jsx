import { lazy, Suspense } from 'react';
const CaretakerDirectory = lazy(() => import('./pages/CaretakerDirectory'));
const AddCaretaker = lazy(() => import('./pages/AddCaretaker'));
const CaretakerDetail = lazy(() => import('./pages/CaretakerDetail'));
function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>; }
const wrap = C => <Suspense fallback={<Loading />}><C /></Suspense>;

/**
 * IMPORTANT: specific paths (caretakers/new) MUST come before param paths
 * (caretakers/:id, caretakers/:id/edit) so React Router doesn't treat "new" as an :id.
 */
export const caretakerRoutes = [
  { path: 'caretakers', element: wrap(CaretakerDirectory) },
  { path: 'caretakers/new', element: wrap(AddCaretaker) },
  { path: 'caretakers/:id/edit', element: wrap(AddCaretaker) },
  { path: 'caretakers/:id', element: wrap(CaretakerDetail) },
];
