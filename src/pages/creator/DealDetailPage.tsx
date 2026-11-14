import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type {
  Collaboration,
  FinancialRecord,
  ContractDocument,
  DealStatus,
  PaymentStatus,
} from '../../types';
import { formatINR } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Trash2,
  FileText,
  Sparkles,
} from 'lucide-react';

const DEAL_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Partially Paid', value: 'partially_paid' },
  { label: 'Paid', value: 'paid' },
];

export const DealDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [deal, setDeal] = useState<Partial<Collaboration>>({
    brand_name: '',
    campaign_title: '',
    description: '',
    payment_amount: 0,
    deliverables: '',
    submission_deadline: '',
    publishing_deadline: '',
    deal_status: 'pending' as DealStatus,
    payment_status: 'pending' as PaymentStatus,
    notes: '',
  });

  const [linkedRecords, setLinkedRecords] = useState<FinancialRecord[]>([]);
  const [linkedContract, setLinkedContract] = useState<ContractDocument | null>(null);

  useEffect(() => {
    if (!isNew && id && user) {
      loadDealData();
    }
  }, [id, isNew, user]);

  const loadDealData = async () => {
    if (!id || !user) return;
    try {
      setLoading(true);
      const data = await api.getDealById(id);
      if (!data) {
        toast.error('Deal not found.');
        navigate('/creator/deals');
        return;
      }
      setDeal(data);

      // Load linked financial records
      const allRecords = await api.getFinancialRecords(user.id);
      setLinkedRecords(allRecords.filter((r) => r.collaboration_id === id));

      // Load linked contract
      const allContracts = await api.getContracts(user.id);
      const doc = allContracts.find((c) => c.collaboration_id === id);
      setLinkedContract(doc || null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load deal.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!deal.brand_name?.trim() || !deal.campaign_title?.trim()) {
      toast.error('Brand name and Campaign title are required.');
      return;
    }

    // Validation: submission <= publishing when both set per PRD §5.3 FR-DEAL-3
    if (deal.submission_deadline && deal.publishing_deadline) {
      if (deal.submission_deadline > deal.publishing_deadline) {
        toast.error('Submission deadline must be on or before publishing deadline.');
        return;
      }
    }

    if ((deal.payment_amount || 0) < 0) {
      toast.error('Payment amount cannot be negative.');
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        const created = await api.createDeal({
          creator_id: user.id,
          brand_id: null,
          enquiry_id: null,
          brand_name: deal.brand_name!.trim(),
          campaign_title: deal.campaign_title!.trim(),
          description: deal.description || '',
          payment_amount: Number(deal.payment_amount) || 0,
          deliverables: deal.deliverables || '',
          submission_deadline: deal.submission_deadline || null,
          publishing_deadline: deal.publishing_deadline || null,
          deal_status: deal.deal_status as DealStatus,
          payment_status: deal.payment_status as PaymentStatus,
          notes: deal.notes || '',
          show_on_profile: false,
        });
        toast.success('Collaboration created!');
        navigate(`/creator/deals/${created.id}`);
      } else {
        await api.updateDeal(id!, deal);
        toast.success('Collaboration updated!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save deal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await api.deleteDeal(id);
      toast.success('Deal deleted. Associated financial records remain intact.');
      navigate('/creator/deals');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete deal.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Calculate Net Profit for this deal per PRD §5.3 FR-DEAL-5
  const dealReceivedIncome = linkedRecords
    .filter((r) => r.record_type === 'income' && r.payment_status === 'received')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const dealExpenses = linkedRecords
    .filter((r) => r.record_type === 'expense')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const dealNetProfit = dealReceivedIncome - dealExpenses;

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[#D4C2AE]/60">
        <div className="flex items-center gap-4">
          <Link
            to="/creator/deals"
            className="p-2 rounded-xl border border-[#D4C2AE] bg-white hover:bg-[#FAF7F2] text-[#171514] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-0.5">
              <Sparkles className="w-3 h-3 text-[#B49A70]" />
              {isNew ? '03 / New Deal' : '03 / Deal Workspace'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171514] tracking-tight">
              {isNew ? 'Create New Collaboration' : deal.campaign_title || 'Edit Deal'}
            </h1>
            <p className="text-xs text-[#5A534F]">
              {isNew ? 'Define brand terms, payment terms, and expected deliverables.' : deal.brand_name}
            </p>
          </div>
        </div>

        {!isNew && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-[#A85F48] hover:text-[#8F4E3A] hover:bg-[#FAF3F1] border-[#E7C2B9]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete Deal</span>
          </Button>
        )}
      </div>

      {/* Deal Profitability Quick Card (§5.3 FR-DEAL-5) */}
      {!isNew && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury">
            <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
              Deal Received Income
            </span>
            <span className="text-2xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1">
              {formatINR(dealReceivedIncome)}
            </span>
            <span className="text-[10px] text-[#7B726C] block mt-1 font-mono">
              Target: {formatINR(deal.payment_amount)}
            </span>
          </div>

          <div className="p-5 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury">
            <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
              Linked Expenses
            </span>
            <span className="text-2xl font-serif font-bold font-mono-numbers text-[#A85F48] block mt-1">
              {formatINR(dealExpenses)}
            </span>
            <span className="text-[10px] text-[#7B726C] block mt-1 font-mono">Production costs</span>
          </div>

          <div className="p-5 bg-[#F3EAE0] border border-[#D4C2AE] rounded-2xl shadow-luxury">
            <span className="text-[10px] font-bold text-[#7A6440] uppercase tracking-[0.18em] block">
              Deal Net Profit
            </span>
            <span
              className={`text-2xl font-serif font-bold font-mono-numbers block mt-1 ${
                dealNetProfit < 0 ? 'text-[#A85F48]' : 'text-[#1E4936]'
              }`}
            >
              {formatINR(dealNetProfit)}
            </span>
            <span className="text-[10px] text-[#7B726C] block mt-1 font-mono">Income − Expenses</span>
          </div>
        </div>
      )}

      {/* Main Deal Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury space-y-4">
          <div className="pb-3 border-b border-[#D4C2AE]/50">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Specifications
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Deal Essentials
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand Name *"
              value={deal.brand_name || ''}
              onChange={(e) => setDeal({ ...deal, brand_name: e.target.value })}
              placeholder="e.g. Kaya Botanics"
              required
            />

            <Input
              label="Campaign Title *"
              value={deal.campaign_title || ''}
              onChange={(e) => setDeal({ ...deal, campaign_title: e.target.value })}
              placeholder="e.g. Summer Glow Vitamin C Launch"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Payment Amount (₹) *"
              type="number"
              min="0"
              step="100"
              value={deal.payment_amount ?? 0}
              onChange={(e) => setDeal({ ...deal, payment_amount: parseFloat(e.target.value) || 0 })}
              required
            />

            <Select
              label="Deal Status"
              value={deal.deal_status}
              onChange={(e) => setDeal({ ...deal, deal_status: e.target.value as DealStatus })}
              options={DEAL_STATUS_OPTIONS}
            />

            <Select
              label="Payment Status"
              value={deal.payment_status}
              onChange={(e) => setDeal({ ...deal, payment_status: e.target.value as PaymentStatus })}
              options={PAYMENT_STATUS_OPTIONS}
            />
          </div>

          <Textarea
            label="Campaign Description"
            value={deal.description || ''}
            onChange={(e) => setDeal({ ...deal, description: e.target.value })}
            placeholder="Campaign goals, target audience, key talking points..."
            rows={2}
          />

          <Textarea
            label="Content Deliverables (one per line)"
            value={deal.deliverables || ''}
            onChange={(e) => setDeal({ ...deal, deliverables: e.target.value })}
            placeholder="1x Dedicated 60-second Instagram Reel&#10;2x Instagram Stories with brand link sticker"
            rows={3}
          />
        </div>

        {/* Deadlines & Dates */}
        <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury space-y-4">
          <div className="pb-3 border-b border-[#D4C2AE]/50">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Timeline
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Milestones & Deadlines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Submission Deadline (Draft Preview)"
              type="date"
              value={deal.submission_deadline || ''}
              onChange={(e) => setDeal({ ...deal, submission_deadline: e.target.value })}
              hint="Date when draft footage must be shared with the brand"
            />

            <Input
              label="Publishing Deadline (Go Live)"
              type="date"
              value={deal.publishing_deadline || ''}
              onChange={(e) => setDeal({ ...deal, publishing_deadline: e.target.value })}
              hint="Target date when content goes live on social channels"
            />
          </div>

          <Textarea
            label="Additional Notes / Exclusivity Terms"
            value={deal.notes || ''}
            onChange={(e) => setDeal({ ...deal, notes: e.target.value })}
            placeholder="E.g. Whitelist ad rights for 30 days, competitors prohibited until Dec 15..."
            rows={2}
          />
        </div>

        {/* Linked Contract Document */}
        {!isNew && (
          <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4C2AE]/50">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
                  Document Audit
                </span>
                <h2 className="text-xl font-serif font-bold text-[#171514] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#B49A70]" />
                  Linked Contract Document
                </h2>
              </div>
              {linkedContract && (
                <Link
                  to={`/creator/contracts/${linkedContract.id}`}
                  className="text-xs font-semibold text-[#171514] hover:text-[#B49A70] hover:underline"
                >
                  View Contract Details →
                </Link>
              )}
            </div>

            {linkedContract ? (
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#D4C2AE] flex items-center justify-between">
                <div>
                  <p className="text-xs font-serif font-bold text-[#171514]">{linkedContract.original_filename}</p>
                  <p className="text-[11px] text-[#7B726C] mt-0.5">
                    Status: <span className="font-semibold uppercase tracking-wider">{linkedContract.review_status}</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E2F1E9] text-[#1E4936] border border-[#B7DAC7] uppercase">
                  AI Analyzed
                </span>
              </div>
            ) : (
              <p className="text-xs text-[#7B726C] italic">
                No contract linked to this deal yet. You can upload a contract in the{' '}
                <Link to="/creator/contracts" className="font-semibold text-[#171514] hover:underline">
                  Contracts section
                </Link>
                .
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3">
          <Button variant="outline" type="button" onClick={() => navigate('/creator/deals')}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isNew ? 'Create Collaboration' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Collaboration Deal?"
        message="Are you sure you want to delete this collaboration? Financial income and expense records will be preserved (unlinked) for your tax and profit records."
        loading={deleting}
      />
    </div>
  );
};
