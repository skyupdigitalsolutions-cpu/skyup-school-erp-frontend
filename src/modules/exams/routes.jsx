import { lazy, Suspense } from 'react';
const ExamDirectory = lazy(() => import('./pages/ExamDirectory'));
const AddExam = lazy(() => import('./pages/AddExam'));
function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>; }
const wrap = C => <Suspense fallback={<Loading />}><C /></Suspense>;
export const examRoutes = [
  { path: 'exams', element: wrap(ExamDirectory) },
  { path: 'exams/new', element: wrap(AddExam) },
];
