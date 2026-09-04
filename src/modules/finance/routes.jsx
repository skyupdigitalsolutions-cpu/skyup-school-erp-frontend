import { lazy, Suspense } from 'react';
const FinanceDirectory = lazy(() => import('./pages/FinanceDirectory'));
const AddFeeTransaction = lazy(() => import('./pages/AddFeeTransaction'));
function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>; }
const wrap = C => <Suspense fallback={<Loading />}><C /></Suspense>;

export const financeRoutes = [
  { path: 'finance', element: wrap(FinanceDirectory) },
  { path: 'finance/new', element: wrap(AddFeeTransaction) },
];