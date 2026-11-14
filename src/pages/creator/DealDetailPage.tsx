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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            to="/creator/deals"
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900">
              {isNew ? 'Create New Collaboration' : deal.campaign_title || 'Edit Deal'}
            </h1>
            <p className="text-xs text-stone-500">
              {isNew ? 'Define brand terms, payment and expected deliverables.' : deal.brand_name}
            </p>
          </div>
        </div>

        {!isNew && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete Deal</span>
          </Button>
        )}
      </div>

      {/* Deal Profitability Quick Card (§5.3 FR-DEAL-5) */}
      {!isNew && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Deal Received Income
            </span>
            <span className="text-xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {formatINR(dealReceivedIncome)}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Target: {formatINR(deal.payment_amount)}
            </span>
          </div>

          <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Linked Expenses
            </span>
            <span className="text-xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {formatINR(dealExpenses)}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Production costs</span>
          </div>

          <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Deal Net Profit
            </span>
            <span
              className={`text-xl font-bold font-mono-numbers block mt-1 ${
                dealNetProfit < 0 ? 'text-rose-600' : 'text-creator-900'
              }`}
            >
              {formatINR(dealNetProfit)}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Income − Expenses</span>
          </div>
        </div>
      )}

      {/* Main Deal Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Deal Essentials
          </h2>

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
        <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Milestones & Deadlines
          </h2>

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
          <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-creator-900" />
                Linked Contract Document
              </h2>
              {linkedContract && (
                <Link
                  to={`/creator/contracts/${linkedContract.id}`}
                  className="text-xs font-semibold text-creator-900 hover:underline"
                >
                  View Contract Details →
                </Link>
              )}
            </div>

            {linkedContract ? (
              <div className="p-4 rounded-lg bg-surface-50 border border-stone-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-900">{linkedContract.original_filename}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Status: <span className="font-semibold uppercase">{linkedContract.review_status}</span>
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  AI Analyzed
                </span>
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                No contract linked to this deal yet. You can upload a contract in the{' '}
                <Link to="/creator/contracts" className="font-semibold text-creator-900 hover:underline">
                  Contracts section
                </Link>
                .
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
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
