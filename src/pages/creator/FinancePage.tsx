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
  Sparkles,
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
      <div className="space-y-6 w-full">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#D4C2AE]/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
            <Sparkles className="w-3 h-3 text-[#B49A70]" />
            02 / Financial Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
            Creator Profit & Loss
          </h1>
          <p className="text-xs text-[#5A534F] mt-1">
            Real-time ledger of received creator payouts, business production expenses, and pure net take-home earnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openCreateModal('expense')}
            className="text-[#A85F48] hover:text-[#8F4E3A] hover:bg-[#FAF3F1] border-[#E7C2B9] gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </Button>

          <Button size="sm" onClick={() => openCreateModal('income')} className="gap-1.5">
            <Plus className="w-4 h-4 text-[#B49A70]" />
            <span>Add Income</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards Hierarchy (Net Earnings Hero Number) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* HERO CARD: Net Earnings */}
        <div className="p-6 bg-[#171514] text-[#FAF7F2] rounded-2xl shadow-luxury-lg border border-[#282422] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#B49A70]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#B49A70]/20 transition-all" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#B49A70] uppercase tracking-[0.18em] block">
                Net Profit
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B49A70]/20 text-[#D4C2AE] border border-[#B49A70]/30 uppercase">
                Hero
              </span>
            </div>
            <span
              className={`text-2xl sm:text-3xl font-serif font-bold font-mono-numbers block tracking-tight ${
                metrics.netEarnings < 0 ? 'text-[#C47C6A]' : 'text-[#FAF7F2]'
              }`}
            >
              {formatINR(metrics.netEarnings)}
            </span>
          </div>
          <div className="pt-3 border-t border-[#282422] mt-3">
            <p className="text-[10px] text-[#A9927A] font-mono">
              Received Income − Recorded Expenses
            </p>
          </div>
        </div>

        {/* Received Income Card */}
        <div className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between hover:border-[#B49A70] transition-colors">
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em]">
              <span>Received Income</span>
              <ArrowUpRight className="w-4 h-4 text-[#2D6A4F]" />
            </div>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1 tracking-tight">
              {formatINR(metrics.totalReceivedIncome)}
            </span>
          </div>
          <p className="text-[10px] text-[#7B726C] mt-3 pt-3 border-t border-[#D4C2AE]/50">
            Realized creator cash in bank
          </p>
        </div>

        {/* Expenses Card */}
        <div className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between hover:border-[#B49A70] transition-colors">
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em]">
              <span>Total Expenses</span>
              <ArrowDownRight className="w-4 h-4 text-[#A85F48]" />
            </div>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#A85F48] block mt-1 tracking-tight">
              {formatINR(metrics.totalExpenses)}
            </span>
          </div>
          <p className="text-[10px] text-[#7B726C] mt-3 pt-3 border-t border-[#D4C2AE]/50">
            Gear, studio, editing & software costs
          </p>
        </div>

        {/* Expected / Pending Income Card */}
        <div className="p-6 bg-[#F3EAE0] border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between hover:border-[#B49A70] transition-colors">
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#7A6440] uppercase tracking-[0.18em]">
              <span>Pending Receivables</span>
              <Clock className="w-4 h-4 text-[#B49A70]" />
            </div>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1 tracking-tight">
              {formatINR(metrics.expectedIncome)}
            </span>
          </div>
          <p className="text-[10px] text-[#7B726C] mt-3 pt-3 border-t border-[#D4C2AE]/60">
            Pending invoices (not counted in net)
          </p>
        </div>
      </div>

      {/* Charts Section (§5.7 FR-FIN-6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury">
          <div className="pb-3 mb-2 border-b border-[#D4C2AE]/50">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Cash Flow
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Monthly Income vs Expenses
            </h2>
            <p className="text-xs text-[#7B726C] mt-0.5">
              Comparison of cash received and expenses logged by month.
            </p>
          </div>
          <MonthlyTrendChart data={monthlyTrends} />
        </div>

        <div className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury">
          <div className="pb-3 mb-2 border-b border-[#D4C2AE]/50">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Deal Margins
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Collaboration Profitability
            </h2>
            <p className="text-xs text-[#7B726C] mt-0.5">
              Net profit per brand campaign for deals with linked financial records.
            </p>
          </div>
          <ProfitabilityChart data={dealProfits} />
        </div>
      </div>

      {/* Transaction Records Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury overflow-hidden">
        <div className="p-5 sm:px-7 sm:py-5 border-b border-[#D4C2AE]/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Ledger
            </span>
            <h3 className="text-xl font-serif font-bold text-[#171514]">
              All Financial Records ({records.length})
            </h3>
          </div>
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
              <table className="min-w-full divide-y divide-[#D4C2AE]/50 text-left text-xs">
                <thead className="bg-[#F3EAE0]/70 text-[#5A534F] font-semibold uppercase tracking-[0.08em] text-[10px]">
                  <tr>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-4">Type</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Description / Deal</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4C2AE]/30">
                  {records.map((rec) => {
                    const linkedDeal = deals.find((d) => d.id === rec.collaboration_id);
                    const isIncome = rec.record_type === 'income';

                    return (
                      <tr key={rec.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-4 px-6 text-[#7B726C] font-mono-numbers">
                          {formatDate(rec.transaction_date)}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isIncome
                                ? 'bg-[#E2F1E9] text-[#1E4936] border border-[#B7DAC7]'
                                : 'bg-[#FAF3F1] text-[#A85F48] border border-[#E7C2B9]'
                            }`}
                          >
                            {rec.record_type}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-[#171514] font-serif text-sm">{rec.category}</td>
                        <td className="py-4 px-4">
                          <div className="text-[#171514] truncate max-w-xs font-medium">
                            {rec.description || '—'}
                          </div>
                          {linkedDeal && (
                            <div className="text-[10px] text-[#7B726C] mt-0.5 truncate">
                              Deal: {linkedDeal.brand_name} · {linkedDeal.campaign_title}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {isIncome ? (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                rec.payment_status === 'received'
                                  ? 'bg-[#E2F1E9] text-[#1E4936] border-[#B7DAC7]'
                                  : 'bg-[#F4ECE1] text-[#7A6440] border-[#DEC6A5]'
                              }`}
                            >
                              {rec.payment_status}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#7B726C] font-medium">Recorded</span>
                          )}
                        </td>
                        <td
                          className={`py-4 px-4 text-right font-mono-numbers font-bold text-sm ${
                            isIncome ? 'text-[#171514]' : 'text-[#A85F48]'
                          }`}
                        >
                          {isIncome ? `+${formatINR(rec.amount)}` : `-${formatINR(rec.amount)}`}
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          <button
                            onClick={() => openEditModal(rec)}
                            className="p-1.5 rounded-lg text-[#7B726C] hover:text-[#171514] hover:bg-[#F3EAE0] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(rec.id)}
                            className="p-1.5 rounded-lg text-[#7B726C] hover:text-[#A85F48] hover:bg-[#FAF3F1] transition-colors"
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
            <div className="md:hidden divide-y divide-[#D4C2AE]/40">
              {records.map((rec) => {
                const linkedDeal = deals.find((d) => d.id === rec.collaboration_id);
                const isIncome = rec.record_type === 'income';

                return (
                  <div key={rec.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isIncome
                                ? 'bg-[#E2F1E9] text-[#1E4936]'
                                : 'bg-[#FAF3F1] text-[#A85F48]'
                            }`}
                          >
                            {rec.record_type}
                          </span>
                          <span className="font-serif font-bold text-sm text-[#171514]">{rec.category}</span>
                        </div>
                        {rec.description && (
                          <p className="text-xs text-[#5A534F] mt-1">{rec.description}</p>
                        )}
                        {linkedDeal && (
                          <p className="text-[10px] text-[#7B726C] mt-0.5">
                            Deal: {linkedDeal.brand_name}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono-numbers font-bold text-sm block ${
                            isIncome ? 'text-[#171514]' : 'text-[#A85F48]'
                          }`}
                        >
                          {isIncome ? `+${formatINR(rec.amount)}` : `-${formatINR(rec.amount)}`}
                        </span>
                        <span className="text-[10px] text-[#7B726C] block font-mono-numbers mt-0.5">
                          {formatDate(rec.transaction_date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D4C2AE]/40 text-xs">
                      {isIncome ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            rec.payment_status === 'received'
                              ? 'bg-[#E2F1E9] text-[#1E4936]'
                              : 'bg-[#F4ECE1] text-[#7A6440]'
                          }`}
                        >
                          {rec.payment_status}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#7B726C]">Paid</span>
                      )}

                      <div className="space-x-3">
                        <button
                          onClick={() => openEditModal(rec)}
                          className="text-[#5A534F] hover:text-[#171514] text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setRecordToDelete(rec.id)}
                          className="text-[#A85F48] hover:text-[#8F4E3A] text-xs font-semibold"
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
            <label className="block text-[11px] font-semibold text-[#5A534F] uppercase tracking-[0.08em] mb-2">
              Record Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRecordType('income');
                  setCategory(INCOME_CATEGORIES[0]);
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  recordType === 'income'
                    ? 'border-[#B49A70] bg-[#F3EAE0] text-[#171514] ring-1 ring-[#B49A70]'
                    : 'border-[#D4C2AE] text-[#5A534F] hover:bg-[#FAF7F2]'
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
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  recordType === 'expense'
                    ? 'border-[#A85F48] bg-[#FAF3F1] text-[#A85F48] ring-1 ring-[#A85F48]'
                    : 'border-[#D4C2AE] text-[#5A534F] hover:bg-[#FAF7F2]'
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

          <div className="flex justify-end gap-3 pt-4 border-t border-[#D4C2AE]/50">
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
