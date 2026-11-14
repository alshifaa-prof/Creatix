import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { Enquiry } from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Mail, CheckCircle2, XCircle, Calendar } from 'lucide-react';

export const EnquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadEnquiries();
  }, [user]);

  const loadEnquiries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getReceivedEnquiries(user.id);
      setEnquiries(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load enquiries.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (enquiryId: string) => {
    try {
      setActionLoadingId(enquiryId);
      const res = await api.acceptEnquiry(enquiryId);
      toast.success('Proposal accepted! Collaboration deal created in your pipeline.');
      await loadEnquiries();
      // Navigate to created deal
      navigate(`/creator/deals/${res.collaboration.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept proposal.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (enquiryId: string) => {
    try {
      setActionLoadingId(enquiryId);
      await api.rejectEnquiry(enquiryId);
      toast.success('Proposal rejected.');
      await loadEnquiries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject proposal.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-serif font-bold text-stone-900">Brand Collaboration Enquiries</h1>
        <p className="text-xs text-stone-500 mt-1">
          Review incoming campaign proposals sent directly by brand partners.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No incoming enquiries"
          description="When brand partners discover your media kit and send collaboration proposals, they will appear here."
        />
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => {
            const isPending = enq.status === 'sent';
            const isActioning = actionLoadingId === enq.id;

            return (
              <div
                key={enq.id}
                className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          enq.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : enq.status === 'rejected'
                            ? 'bg-stone-100 text-stone-600 border border-stone-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {enq.status === 'sent' ? 'New Proposal' : enq.status}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono-numbers">
                        Received {formatDate(enq.created_at)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900">{enq.campaign_title}</h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                      Offered Fee
                    </span>
                    <span className="text-lg font-bold font-mono-numbers text-creator-900 block">
                      {formatINR(enq.offered_payment)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed bg-surface-50 p-3 rounded-lg border border-stone-100">
                  {enq.description}
                </p>

                {enq.deliverables && (
                  <div className="text-xs">
                    <span className="font-semibold text-stone-800 block mb-1">Deliverables:</span>
                    <p className="text-stone-600 whitespace-pre-line">{enq.deliverables}</p>
                  </div>
                )}

                {enq.additional_requirements && (
                  <div className="text-xs">
                    <span className="font-semibold text-stone-800 block mb-1">
                      Requirements & Exclusivity:
                    </span>
                    <p className="text-stone-500 italic">{enq.additional_requirements}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Target Deadline: <strong className="font-mono-numbers">{formatDate(enq.deadline)}</strong></span>
                  </div>

                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(enq.id)}
                        loading={isActioning}
                        className="text-stone-600 hover:text-stone-900"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Decline
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleAccept(enq.id)}
                        loading={isActioning}
                        className="gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept & Create Deal
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-stone-400">
                      Resolved ({enq.status})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
