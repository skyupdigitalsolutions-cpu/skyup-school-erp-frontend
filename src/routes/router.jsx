import { createBrowserRouter, Navigate } from 'react-router-dom';
import PrincipalLayout from '@/layouts/PrincipalLayout';
import TeacherLayout from '@/layouts/TeacherLayout';
import StudentLayout from '@/layouts/StudentLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { authRoutes } from '@/modules/authentication/routes';
import { principalRoutes } from '@/modules/principal/routes';
import { caretakerRoutes } from '@/modules/caretaker/routes';
import { eventRoutes } from '@/modules/events/routes';
import { examRoutes } from '@/modules/exams/routes';
import { classRoutes } from '@/modules/classes/routes';
import { dashboardRoutes } from '@/modules/dashboard/routes';
import { noticeRoutes } from '@/modules/notices/routes';
import { reportRoutes } from '@/modules/reports/routes';
import { financeRoutes } from '@/modules/finance/routes';
import { leaveManagementRoutes } from '@/modules/leave-management/routes';
import { teacherRoutes } from '@/modules/teacher/routes';
import { studentRoutes } from '@/modules/student/routes';

export const router = createBrowserRouter(
  [
    // Root just needs *some* landing spot before we know who's logged in;
    // ProtectedRoute + the role check below sort out where they actually end up.
    { path: '/', element: <Navigate to="/principal/dashboard" replace /> },
    ...authRoutes,
    {
      path: '/principal',
      element: (
        <ProtectedRoute allowedRoles={['principal', 'administrator', 'caretaker', 'finance']}>
          <PrincipalLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        ...dashboardRoutes,
        ...noticeRoutes,
        ...reportRoutes,
        ...financeRoutes,
        ...leaveManagementRoutes,
        ...principalRoutes,
        ...caretakerRoutes,
        ...eventRoutes,
        ...examRoutes,
        ...classRoutes,
      ],
    },
    {
      path: '/teacher',
      element: (
        <ProtectedRoute allowedRoles={['teacher']}>
          <TeacherLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        ...teacherRoutes,
      ],
    },
    {
      path: '/student',
      element: (
        <ProtectedRoute allowedRoles={['student', 'parent']}>
          <StudentLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        ...studentRoutes,
      ],
    },
  ],
  { future: { v7_startTransition: true } }
);
