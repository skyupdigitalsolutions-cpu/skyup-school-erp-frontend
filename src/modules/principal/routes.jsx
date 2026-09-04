import { lazy, Suspense } from 'react';

const StudentDirectory = lazy(() => import('./pages/StudentDirectory'));
const StudentProfile   = lazy(() => import('./pages/StudentProfile'));
const AddStudent       = lazy(() => import('./pages/AddStudent'));
const TeacherDirectory = lazy(() => import('./pages/TeacherDirectory'));
const TeacherProfile   = lazy(() => import('./pages/TeacherProfile'));
const AddTeacher       = lazy(() => import('./pages/AddTeacher'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Loading…
    </div>
  );
}

const wrap = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

/**
 * IMPORTANT: specific paths (e.g. students/new) MUST come before
 * param paths (e.g. students/:id) so React Router doesn't treat
 * "new" as an ID.
 */
export const principalRoutes = [
  // ── Students ──────────────────────────────────────────────────────────────
  { path: 'students',        element: wrap(StudentDirectory) },
  { path: 'students/new',    element: wrap(AddStudent) },       // ← before /:id
  { path: 'students/:id',    element: wrap(StudentProfile) },

  // ── Teachers ──────────────────────────────────────────────────────────────
  { path: 'teachers',        element: wrap(TeacherDirectory) },
  { path: 'teachers/new',    element: wrap(AddTeacher) },       // ← before /:id
  { path: 'teachers/:id',    element: wrap(TeacherProfile) },
];
