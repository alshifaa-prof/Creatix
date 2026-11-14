import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { Enquiry } from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Send, Calendar, Sparkles } from 'lucide-react';

export const BrandEnquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadSentEnquiries();
  }, [user]);

  const loadSentEnquiries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getSentEnquiries(user.id);
      setEnquiries(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load sent proposals.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-[#E2F1E9] text-[#1E4936] border-[#B7DAC7]';
      case 'rejected':
        return 'bg-[#FAF3F1] text-[#A85F48] border-[#E7C2B9]';
      default:
        return 'bg-[#F4ECE1] text-[#7A6440] border-[#DEC6A5]';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-12 w-64 rounded-2xl" />
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
          04 / Outbound Proposals
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
          Sent Collaboration Proposals
        </h1>
        <p className="text-xs text-[#5A534F] mt-1">
          Monitor the live negotiation status of collaboration proposals sent to creators.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No collaboration proposals sent yet"
          description="Explore creator media kits in the discovery directory and send your first campaign brief."
        />
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury space-y-4 hover:border-[#B49A70] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        enq.status
                      )}`}
                    >
                      {enq.status === 'sent' ? 'Awaiting Creator Response' : enq.status}
                    </span>
                    <span className="text-[10px] text-[#7B726C] font-mono">
                      Sent {formatDate(enq.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#171514]">{enq.campaign_title}</h3>
                </div>

                <div className="text-left sm:text-right bg-[#FAF7F2] sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-[#D4C2AE]/60">
                  <span className="text-[10px] text-[#7B726C] uppercase tracking-wider block">
                    Offered Payment
                  </span>
                  <span className="text-2xl font-serif font-bold font-mono-numbers text-[#171514] block">
                    {formatINR(enq.offered_payment)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#5A534F] bg-[#FAF7F2] p-4 rounded-xl border border-[#D4C2AE]/60 leading-relaxed">
                {enq.description}
              </p>

              {enq.deliverables && (
                <div className="text-xs">
                  <span className="font-semibold text-[#171514] block mb-1">Deliverables:</span>
                  <p className="text-[#5A534F] whitespace-pre-line leading-relaxed">{enq.deliverables}</p>
                </div>
              )}

              <div className="pt-3.5 border-t border-[#D4C2AE]/50 flex items-center justify-between text-xs text-[#7B726C] font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#B49A70]" />
                  Target Deadline: <strong className="text-[#171514]">{formatDate(enq.deadline)}</strong>
                </span>
                <span className="text-[11px] text-[#7B726C]">
                  Creator ID: {enq.creator_id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
