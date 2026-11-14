import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type {
  FinancialRecord,
  Collaboration,
  RecordType,
  RecordPaymentStatus,
} from '../../types';
import {
  calculateDashboardMetrics,
  calculateMonthlyTrends,
  calculateDealProfitability,
} from '../../lib/calculations';
import { formatINR, formatDate } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MonthlyTrendChart } from '../../components/charts/MonthlyTrendChart';
import { ProfitabilityChart } from '../../components/charts/ProfitabilityChart';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Trash2,
  Edit2,
  IndianRupee,
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Production',
  'Equipment',
  'Editing',
  'Travel',
  'Props & Materials',
  'Software',
  'Marketing',
  'Other',
];

const INCOME_CATEGORIES = [
  'Brand Collaboration',
  'Affiliate',
  'Platform Payout',
  'Other',
];

export const FinancePage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [deals, setDeals] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);

  // Record modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [recordType, setRecordType] = useState<RecordType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [collaborationId, setCollaborationId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<RecordPaymentStatus>('received');
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadFinancialData();
  }, [user]);

  const loadFinancialData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [fetchedRecords, fetchedDeals] = await Promise.all([
        api.getFinancialRecords(user.id),
        api.getDeals(user.id),
      ]);
      setRecords(fetchedRecords);
      setDeals(fetchedDeals);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  };

  const metrics = calculateDashboardMetrics(records, deals);
  const monthlyTrends = calculateMonthlyTrends(records);
  const dealProfits = calculateDealProfitability(records, deals);

  const openCreateModal = (type: RecordType = 'income') => {
    setEditingRecord(null);
    setRecordType(type);
    setAmount('');
    setCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setCollaborationId('');
    setPaymentStatus('received');
    setIsModalOpen(true);
  };

  const openEditModal = (rec: FinancialRecord) => {
    setEditingRecord(rec);
    setRecordType(rec.record_type);
    setAmount(String(rec.amount));
    setCategory(rec.category);
    setDescription(rec.description || '');
    setDate(rec.transaction_date);
    setCollaborationId(rec.collaboration_id || '');
    setPaymentStatus(rec.payment_status);
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Amount must be greater than 0.');
      return;
    }

    try {
      setSaving(true);
      if (editingRecord) {
        await api.updateFinancialRecord(editingRecord.id, {
          record_type: recordType,
          category,
          amount: parsedAmount,
          description: description.trim(),
          transaction_date: date,
          collaboration_id: collaborationId ? collaborationId : null,
          payment_status: recordType === 'income' ? paymentStatus : 'received',
        });
        toast.success('Record updated successfully.');
      } else {
        await api.createFinancialRecord({
          creator_id: user.id,
          record_type: recordType,
          category,
          amount: parsedAmount,
          description: description.trim(),
          transaction_date: date,
          collaboration_id: collaborationId ? collaborationId : null,
          payment_status: recordType === 'income' ? paymentStatus : 'received',
        });
        toast.success(
          `${recordType === 'income' ? 'Income' : 'Expense'} of ${formatINR(parsedAmount)} added.`
        );
      }
      setIsModalOpen(false);
      loadFinancialData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    try {
      setDeleting(true);
      await api.deleteFinancialRecord(recordToDelete);
      toast.success('Record deleted.');
      setRecordToDelete(null);
      loadFinancialData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete record.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Creator Finances</h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time tracking of received payouts, production expenses, and pure net business profit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openCreateModal('expense')}
            className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </Button>

          <Button size="sm" onClick={() => openCreateModal('income')} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards Hierarchy (Net Earnings Hero Number per UX Rules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* HERO CARD: Net Earnings */}
        <div className="p-5 bg-stone-900 text-white rounded-xl shadow-xs border border-stone-800 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Net Profit (Earnings)
            </span>
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono-numbers block mt-1 tracking-tight ${
                metrics.netEarnings < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatINR(metrics.netEarnings)}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 mt-3 pt-3 border-t border-stone-800">
            Received Income − Recorded Expenses
          </p>
        </div>

        {/* Received Income Card */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <span>Received Income</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {formatINR(metrics.totalReceivedIncome)}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 mt-3 pt-3 border-t border-stone-100">
            Realized creator cash in bank
          </p>
        </div>

        {/* Expenses Card */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <span>Total Expenses</span>
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-2xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {formatINR(metrics.totalExpenses)}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 mt-3 pt-3 border-t border-stone-100">
            Gear, studio, editing & software costs
          </p>
        </div>

        {/* Expected / Pending Income Card */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <span>Pending Receivables</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-bold font-mono-numbers text-amber-900 block mt-1">
              {formatINR(metrics.expectedIncome)}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 mt-3 pt-3 border-t border-stone-100">
            Pending invoices (not counted in net)
          </p>
        </div>
      </div>

      {/* Charts Section (§5.7 FR-FIN-6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-1">
            Monthly Income vs Expenses
          </h2>
          <p className="text-xs text-stone-500 mb-2">
            Comparison of cash received and expenses logged by month.
          </p>
          <MonthlyTrendChart data={monthlyTrends} />
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-1">
            Collaboration Profitability
          </h2>
          <p className="text-xs text-stone-500 mb-2">
            Net profit per brand campaign for deals with linked financial records.
          </p>
          <ProfitabilityChart data={dealProfits} />
        </div>
      </div>

      {/* Transaction Records Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 sm:py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            All Financial Records ({records.length})
          </h3>
          <Button size="sm" variant="outline" onClick={() => openCreateModal('income')}>
            Record Transaction
          </Button>
        </div>

        {records.length === 0 ? (
          <EmptyState
            icon={IndianRupee}
            title="No financial records"
            description="Start logging brand payouts, affiliate income, and production expenses to track net earnings."
            actionLabel="Add Record"
            onAction={() => openCreateModal('income')}
          />
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
                <thead className="bg-surface-50 text-stone-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Description / Deal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {records.map((rec) => {
                    const linkedDeal = deals.find((d) => d.id === rec.collaboration_id);
                    const isIncome = rec.record_type === 'income';

                    return (
                      <tr key={rec.id} className="hover:bg-surface-50/50 transition-colors">
                        <td className="py-3.5 px-6 text-stone-600 font-mono-numbers">
                          {formatDate(rec.transaction_date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {rec.record_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-900">{rec.category}</td>
                        <td className="py-3.5 px-4">
                          <div className="text-stone-800 truncate max-w-xs">
                            {rec.description || '—'}
                          </div>
                          {linkedDeal && (
                            <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                              Deal: {linkedDeal.brand_name} · {linkedDeal.campaign_title}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isIncome ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                rec.payment_status === 'received'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {rec.payment_status}
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-medium">Recorded</span>
                          )}
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono-numbers font-bold ${
                            isIncome ? 'text-creator-900' : 'text-rose-600'
                          }`}
                        >
                          {isIncome ? `+${formatINR(rec.amount)}` : `-${formatINR(rec.amount)}`}
                        </td>
                        <td className="py-3.5 px-6 text-right space-x-1">
                          <button
                            onClick={() => openEditModal(rec)}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(rec.id)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (375px responsive) */}
            <div className="md:hidden divide-y divide-stone-100">
              {records.map((rec) => {
                const linkedDeal = deals.find((d) => d.id === rec.collaboration_id);
                const isIncome = rec.record_type === 'income';

                return (
                  <div key={rec.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {rec.record_type}
                          </span>
                          <span className="font-bold text-xs text-stone-900">{rec.category}</span>
                        </div>
                        {rec.description && (
                          <p className="text-xs text-stone-600 mt-1">{rec.description}</p>
                        )}
                        {linkedDeal && (
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            Deal: {linkedDeal.brand_name}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono-numbers font-bold text-sm block ${
                            isIncome ? 'text-creator-900' : 'text-rose-600'
                          }`}
                        >
                          {isIncome ? `+${formatINR(rec.amount)}` : `-${formatINR(rec.amount)}`}
                        </span>
                        <span className="text-[10px] text-stone-400 block font-mono-numbers mt-0.5">
                          {formatDate(rec.transaction_date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      {isIncome ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            rec.payment_status === 'received'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {rec.payment_status}
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Paid</span>
                      )}

                      <div className="space-x-2">
                        <button
                          onClick={() => openEditModal(rec)}
                          className="text-stone-500 hover:text-stone-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setRecordToDelete(rec.id)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Record Creation & Editing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Edit Financial Record' : 'Record Transaction'}
        description="Log received earnings or production expenses for accurate profit calculations."
      >
        <form onSubmit={handleSaveRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Record Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRecordType('income');
                  setCategory(INCOME_CATEGORIES[0]);
                }}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  recordType === 'income'
                    ? 'border-creator-900 bg-emerald-50 text-creator-900 ring-1 ring-creator-900'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                + Income (Payout)
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecordType('expense');
                  setCategory(EXPENSE_CATEGORIES[0]);
                }}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  recordType === 'expense'
                    ? 'border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-600'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                − Expense (Cost)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (₹) *"
              type="number"
              min="1"
              step="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 12000"
              required
            />

            <Select
              label="Category *"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={(recordType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
                (c) => ({ label: c, value: c })
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Transaction Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            {recordType === 'income' && (
              <Select
                label="Payment Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as RecordPaymentStatus)}
                options={[
                  { label: 'Received (in bank account)', value: 'received' },
                  { label: 'Pending (expected payout)', value: 'pending' },
                ]}
                hint="Pending income does not enter Net Earnings until received"
              />
            )}
          </div>

          <Select
            label="Linked Collaboration (Optional)"
            value={collaborationId}
            onChange={(e) => setCollaborationId(e.target.value)}
            options={[
              { label: 'None (General Business Transaction)', value: '' },
              ...deals.map((d) => ({
                label: `${d.brand_name} - ${d.campaign_title}`,
                value: d.id,
              })),
            ]}
          />

          <Textarea
            label="Description / Purpose"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 60-second Reel payout via NEFT / Ring light purchase from Amazon"
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingRecord ? 'Update Record' : 'Save Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteRecord}
        title="Delete Financial Record?"
        message="This record will be permanently removed. Your monthly trends and net earnings will recalculate immediately."
        loading={deleting}
      />
    </div>
  );
};
