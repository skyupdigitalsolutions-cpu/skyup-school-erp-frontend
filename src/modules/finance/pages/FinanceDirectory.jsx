import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTransactions, fetchFinanceStats, deleteTransaction } from '@/features/finance/financeSlice';

import { IndianRupee, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/StatCard';

const STATUS_BADGE = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  partial: 'bg-blue-100 text-blue-800',
  overdue: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function FinanceDirectory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, meta, stats, listLoading } = useSelector(s => s.finance);
  const [filters, setFilters] = useState({ academicYear: '', feeType: '', status: '' });
  const [page, setPage] = useState(1);

  const load = useCallback(() => { dispatch(fetchTransactions({ ...filters, page, limit: 20 })); }, [dispatch, filters, page]);
  useEffect(() => { dispatch(fetchFinanceStats({ academicYear: filters.academicYear })); }, [dispatch, filters.academicYear]);
  useEffect(() => { load(); }, [load]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    dispatch(deleteTransaction(id)).then(() => load());
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fee collection and student transactions</p>
        </div>
        <button onClick={() => navigate('/principal/finance/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Record Transaction</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={`₹${(stats.totalAmount ?? 0).toLocaleString('en-IN')}`} theme="blue" icon={IndianRupee} />
          <StatCard label="Collected" value={`₹${(stats.collected ?? 0).toLocaleString('en-IN')}`} theme="emerald" icon={CheckCircle2} />
          <StatCard label="Pending" value={`₹${(stats.pending ?? 0).toLocaleString('en-IN')}`} theme="amber" icon={Clock} />
          <StatCard label="Overdue" value={`₹${(stats.overdue ?? 0).toLocaleString('en-IN')}`} theme="rose" icon={AlertTriangle} />
        </div>
      )}

      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
        <input placeholder="Academic Year e.g. 2026-27" className="border rounded-lg px-3 py-2 text-sm w-56" value={filters.academicYear} onChange={e => { setFilters({ ...filters, academicYear: e.target.value }); setPage(1); }} />
        <select className="border rounded-lg px-3 py-2 text-sm" value={filters.feeType} onChange={e => { setFilters({ ...filters, feeType: e.target.value }); setPage(1); }}>
          <option value="">All Fee Types</option>
          {['tuition', 'transport', 'hostel', 'exam', 'library', 'other'].map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-2 text-sm" value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
          <option value="">All Statuses</option>
          {['paid', 'pending', 'partial', 'overdue', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {listLoading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-sm text-gray-400">Loading transactions…</p></div>
        ) : list.length === 0 ? (
          <p className="p-12 text-center text-sm text-gray-400">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Student', 'Class', 'Fee Type', 'Amount', 'Status', 'Due Date', 'Paid Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {t.student ? `${t.student.personal?.firstName || ''} ${t.student.personal?.lastName || ''}`.trim() : '—'}
                      <p className="text-xs text-gray-400 font-normal">{t.student?.admissionNo}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.student?.academic?.class ? `${t.student.academic.class}-${t.student.academic.section}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{t.feeType}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{t.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[t.status]}`}>{t.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{t.paidDate ? new Date(t.paidDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(t._id)} className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.pages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">Showing {list.length} of {meta.total}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded border disabled:opacity-40">Previous</button>
              <span className="px-3 py-1.5 font-medium">{page}/{meta.pages}</span>
              <button disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded border disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}