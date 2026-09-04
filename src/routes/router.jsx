import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import PrincipalLayout from '@/layouts/PrincipalLayout';
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

function Loading() {
  return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>;
}

export const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/principal/dashboard" replace /> },
    ...authRoutes,
    {
      path: '/principal',
      element: (
        <ProtectedRoute>
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
  ],
  { future: { v7_startTransition: true } }
);