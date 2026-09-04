import { lazy, Suspense } from 'react';
const CaretakerDirectory = lazy(() => import('./pages/CaretakerDirectory'));
const AddCaretaker = lazy(() => import('./pages/AddCaretaker'));
function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>; }
const wrap = C => <Suspense fallback={<Loading />}><C /></Suspense>;
export const caretakerRoutes = [
  { path: 'caretakers', element: wrap(CaretakerDirectory) },
  { path: 'caretakers/new', element: wrap(AddCaretaker) },
];
