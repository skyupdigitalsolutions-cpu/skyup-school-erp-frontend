import { lazy, Suspense } from 'react';
const ExamDirectory = lazy(() => import('./pages/ExamDirectory'));
const AddExam = lazy(() => import('./pages/AddExam'));
const ExamDetail = lazy(() => import('./pages/ExamDetail'));
function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>; }
const wrap = C => <Suspense fallback={<Loading />}><C /></Suspense>;

/**
 * IMPORTANT: specific paths (exams/new) MUST come before param paths
 * (exams/:id, exams/:id/edit) so React Router doesn't treat "new" as an :id.
 */
export const examRoutes = [
  { path: 'exams', element: wrap(ExamDirectory) },
  { path: 'exams/new', element: wrap(AddExam) },
  { path: 'exams/:id/edit', element: wrap(AddExam) },
  { path: 'exams/:id', element: wrap(ExamDetail) },
];
