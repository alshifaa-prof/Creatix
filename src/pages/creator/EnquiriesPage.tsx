import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { Enquiry } from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Mail, CheckCircle2, XCircle, Calendar, Sparkles } from 'lucide-react';

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
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 w-full">
      {/* Header */}
      <div className="pb-6 border-b border-[#D4C2AE]/60">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
          <Sparkles className="w-3 h-3 text-[#B49A70]" />
          04 / Inbound Opportunities
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
          Brand Collaboration Enquiries
        </h1>
        <p className="text-xs text-[#5A534F] mt-1">
          Review incoming campaign briefs and compensation offers sent directly by brand partners.
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
                className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury space-y-4 hover:border-[#B49A70] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          enq.status === 'accepted'
                            ? 'bg-[#E2F1E9] text-[#1E4936] border-[#B7DAC7]'
                            : enq.status === 'rejected'
                            ? 'bg-[#F1ECE4] text-[#695644] border-[#D4C2AE]'
                            : 'bg-[#F4ECE1] text-[#7A6440] border-[#DEC6A5]'
                        }`}
                      >
                        {enq.status === 'sent' ? 'New Proposal' : enq.status}
                      </span>
                      <span className="text-[10px] text-[#7B726C] font-mono">
                        Received {formatDate(enq.created_at)}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-[#171514]">{enq.campaign_title}</h3>
                  </div>

                  <div className="text-left sm:text-right bg-[#FAF7F2] sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-[#D4C2AE]/60">
                    <span className="text-[10px] text-[#7B726C] uppercase tracking-wider block">
                      Offered Fee
                    </span>
                    <span className="text-2xl font-serif font-bold font-mono-numbers text-[#171514] block">
                      {formatINR(enq.offered_payment)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#5A534F] leading-relaxed bg-[#FAF7F2] p-4 rounded-xl border border-[#D4C2AE]/60">
                  {enq.description}
                </p>

                {enq.deliverables && (
                  <div className="text-xs">
                    <span className="font-semibold text-[#171514] block mb-1">Deliverables:</span>
                    <p className="text-[#5A534F] whitespace-pre-line leading-relaxed">{enq.deliverables}</p>
                  </div>
                )}

                {enq.additional_requirements && (
                  <div className="text-xs">
                    <span className="font-semibold text-[#171514] block mb-1">
                      Requirements & Exclusivity:
                    </span>
                    <p className="text-[#7B726C] italic">{enq.additional_requirements}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-[#D4C2AE]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#7B726C]">
                    <Calendar className="w-3.5 h-3.5 text-[#B49A70]" />
                    <span>Target Deadline: <strong className="font-mono text-[#171514]">{formatDate(enq.deadline)}</strong></span>
                  </div>

                  {isPending ? (
                    <div className="flex items-center gap-2.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(enq.id)}
                        loading={isActioning}
                        className="text-[#5A534F] hover:text-[#171514]"
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
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B49A70]" />
                        Accept & Create Deal
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#7B726C] uppercase tracking-wider">
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
