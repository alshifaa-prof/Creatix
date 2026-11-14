import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { Enquiry } from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Send, Calendar } from 'lucide-react';

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
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-serif font-bold text-stone-900">Sent Collaboration Proposals</h1>
        <p className="text-xs text-stone-500 mt-1">
          Monitor the live status of collaboration proposals sent to creators.
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
              className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        enq.status
                      )}`}
                    >
                      {enq.status === 'sent' ? 'Awaiting Creator Response' : enq.status}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono-numbers">
                      Sent {formatDate(enq.created_at)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">{enq.campaign_title}</h3>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    Offered Payment
                  </span>
                  <span className="text-base font-bold font-mono-numbers text-stone-900 block">
                    {formatINR(enq.offered_payment)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-600 bg-surface-50 p-3 rounded-lg border border-stone-100 leading-relaxed">
                {enq.description}
              </p>

              {enq.deliverables && (
                <div className="text-xs">
                  <span className="font-semibold text-stone-700 block mb-0.5">Deliverables:</span>
                  <p className="text-stone-600 whitespace-pre-line">{enq.deliverables}</p>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono-numbers">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Target Deadline: {formatDate(enq.deadline)}
                </span>
                <span className="text-[11px] text-stone-400">
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
