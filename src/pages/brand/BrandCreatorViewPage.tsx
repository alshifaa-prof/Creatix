import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { CreatorProfile, Profile } from '../../types';
import { SelfReportedBadge } from '../../components/ui/SelfReportedBadge';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Bookmark,
  Send,
  Instagram,
  Youtube,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const BrandCreatorViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [creatorData, setCreatorData] = useState<{ profile: Profile; creator: CreatorProfile } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);

  // Send Enquiry Modal State (PRD §5.4 FR-ENQ-1)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [offeredPayment, setOfferedPayment] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [deadline, setDeadline] = useState('');
  const [requirements, setRequirements] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadCreator();
  }, [id, user]);

  const loadCreator = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getPublicCreatorProfile(id);
      if (!res) {
        toast.error('Creator profile not found or is private.');
        navigate('/brand/discover');
        return;
      }
      setCreatorData(res);

      if (user) {
        const ids = await api.getShortlistedCreatorIds(user.id);
        setIsShortlisted(ids.includes(id));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load creator.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShortlist = async () => {
    if (!user || !id) return;
    try {
      const { shortlisted } = await api.toggleShortlist(user.id, id);
      setIsShortlisted(shortlisted);
      toast.success(shortlisted ? 'Added to shortlist.' : 'Removed from shortlist.');
    } catch (err: any) {
      toast.error('Failed to update shortlist.');
    }
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    const paymentNum = parseFloat(offeredPayment);
    if (!title.trim() || !description.trim() || !paymentNum || paymentNum <= 0) {
      toast.error('Campaign title, description, and positive offered payment are required.');
      return;
    }

    try {
      setSending(true);
      await api.createEnquiry({
        creator_id: id,
        brand_id: user.id,
        campaign_title: title.trim(),
        description: description.trim(),
        offered_payment: paymentNum,
        deliverables: deliverables.trim() || null,
        deadline: deadline || null,
        additional_requirements: requirements.trim() || null,
      });

      toast.success(`Collaboration proposal sent to ${creatorData?.creator.display_name}!`);
      setIsModalOpen(false);
      navigate('/brand/enquiries');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send proposal.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!creatorData) return null;

  const { creator, profile } = creatorData;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            to="/brand/discover"
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs text-stone-500 font-medium">Back to Creator Directory</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleShortlist}
            className={`gap-1.5 ${isShortlisted ? 'bg-amber-50 border-amber-300 text-amber-800' : ''}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-amber-600' : ''}`} />
            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist Creator'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-900 hover:bg-black text-white gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Enquiry</span>
          </Button>
        </div>
      </div>

      {/* Creator Profile Hero */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 relative shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {creator.profile_image_url ? (
            <img
              src={creator.profile_image_url}
              alt={creator.display_name || ''}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-stone-200 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-surface-200 flex items-center justify-center font-serif font-bold text-3xl text-stone-700 border border-stone-300">
              {(creator.display_name || profile.name || 'C')[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {creator.display_name || profile.name}
              </h1>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {creator.niche}
              </span>
            </div>

            {creator.location && (
              <p className="text-xs text-stone-500 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5" />
                {creator.location}
              </p>
            )}

            {creator.bio && (
              <p className="text-sm text-stone-700 leading-relaxed max-w-xl">
                {creator.bio}
              </p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-6 pt-6 border-t border-stone-100 flex flex-wrap gap-3">
          {creator.instagram_url && (
            <a
              href={creator.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-surface-50 text-stone-800 hover:bg-stone-100 text-xs font-medium transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-rose-600" />
              Instagram
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          )}

          {creator.youtube_url && (
            <a
              href={creator.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-surface-50 text-stone-800 hover:bg-stone-100 text-xs font-medium transition-colors"
            >
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              YouTube Channel
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          )}
        </div>
      </div>

      {/* Self-reported Audience Reach Section */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Audience Demographics & Reach
          </h2>
          <SelfReportedBadge />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-surface-50 border border-stone-200/80">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Followers
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {(creator.follower_count || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Instagram reach</span>
          </div>

          <div className="p-4 rounded-lg bg-surface-50 border border-stone-200/80">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Subscribers
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {(creator.subscriber_count || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">YouTube community</span>
          </div>

          <div className="p-4 rounded-lg bg-surface-50 border border-stone-200/80">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Avg. Views
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {(creator.average_views || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Per video / reel</span>
          </div>

          <div className="p-4 rounded-lg bg-surface-50 border border-stone-200/80">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Engagement
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono-numbers text-emerald-800 block mt-1">
              {creator.engagement_rate || 0}%
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Interaction rate</span>
          </div>
        </div>
      </div>

      {/* Send Enquiry Modal (§5.4 FR-ENQ-1) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Send Collaboration Proposal to ${creator.display_name || profile.name}`}
        description="Submit your campaign deliverables, target publishing deadline, and proposed compensation."
        maxWidth="lg"
      >
        <form onSubmit={handleSendEnquiry} className="space-y-4">
          <Input
            label="Campaign Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Glow Vitamin C Reel Campaign"
            required
          />

          <Textarea
            label="Campaign Brief & Objectives *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduce your brand campaign, target audience talking points, and call to action..."
            rows={3}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Offered Payment (₹) *"
              type="number"
              min="1"
              value={offeredPayment}
              onChange={(e) => setOfferedPayment(e.target.value)}
              placeholder="e.g. 12000"
              required
            />

            <Input
              label="Expected Publishing Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <Textarea
            label="Required Deliverables"
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            placeholder="1x 60-second Instagram Reel&#10;2x Instagram Story series with link sticker"
            rows={2}
          />

          <Textarea
            label="Additional Requirements / Exclusivity"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="e.g. Must disclose #Ad, no competing skincare products for 14 days"
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={sending}
              className="bg-brand-900 hover:bg-black text-white gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Campaign Proposal</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
