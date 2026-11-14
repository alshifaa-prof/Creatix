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
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!creatorData) return null;

  const { creator, profile } = creatorData;

  return (
    <div className="max-w-4xl space-y-8 w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[#D4C2AE]/60">
        <div className="flex items-center gap-4">
          <Link
            to="/brand/discover"
            className="p-2 rounded-xl border border-[#D4C2AE] bg-white hover:bg-[#FAF7F2] text-[#171514] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs text-[#7B726C] font-medium">Back to Creator Directory</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleShortlist}
            className={`gap-1.5 ${isShortlisted ? 'bg-[#F3EAE0] border-[#B49A70] text-[#7A6440]' : ''}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-[#B49A70] text-[#B49A70]' : ''}`} />
            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist Creator'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>Send Enquiry</span>
          </Button>
        </div>
      </div>

      {/* Creator Profile Hero */}
      <div className="bg-white border border-[#D4C2AE] rounded-3xl p-6 sm:p-9 relative shadow-luxury">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {creator.profile_image_url ? (
            <img
              src={creator.profile_image_url}
              alt={creator.display_name || ''}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#D4C2AE] shadow-luxury"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F3EAE0] flex items-center justify-center font-serif font-bold text-3xl text-[#171514] border border-[#D4C2AE]">
              {(creator.display_name || profile.name || 'C')[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171514] tracking-tight">
                {creator.display_name || profile.name}
              </h1>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F4ECE1] text-[#7A6440] border border-[#DEC6A5]">
                {creator.niche}
              </span>
            </div>

            {creator.location && (
              <p className="text-xs text-[#7B726C] flex items-center gap-1.5 mb-3 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#B49A70]" />
                {creator.location}
              </p>
            )}

            {creator.bio && (
              <p className="text-sm text-[#5A534F] leading-relaxed max-w-xl font-normal">
                {creator.bio}
              </p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 pt-6 border-t border-[#D4C2AE]/50 flex flex-wrap gap-3">
          {creator.instagram_url && (
            <a
              href={creator.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#D4C2AE] bg-[#FAF7F2] text-[#171514] hover:bg-[#F3EAE0] text-xs font-semibold transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#A85F48]" />
              Instagram
              <ExternalLink className="w-3.5 h-3.5 text-[#7B726C]" />
            </a>
          )}

          {creator.youtube_url && (
            <a
              href={creator.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#D4C2AE] bg-[#FAF7F2] text-[#171514] hover:bg-[#F3EAE0] text-xs font-semibold transition-colors"
            >
              <Youtube className="w-4 h-4 text-[#A85F48]" />
              YouTube Channel
              <ExternalLink className="w-3.5 h-3.5 text-[#7B726C]" />
            </a>
          )}
        </div>
      </div>

      {/* Self-reported Audience Reach Section */}
      <div className="bg-white border border-[#D4C2AE] rounded-3xl p-6 sm:p-9 space-y-4 shadow-luxury">
        <div className="flex items-center justify-between pb-3 border-b border-[#D4C2AE]/50">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Audience Scale
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Demographics & Engagement
            </h2>
          </div>
          <SelfReportedBadge />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C2AE]">
            <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
              Followers
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1">
              {(creator.follower_count || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#7B726C] block mt-1">Instagram reach</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C2AE]">
            <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
              Subscribers
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1">
              {(creator.subscriber_count || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#7B726C] block mt-1">YouTube community</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C2AE]">
            <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
              Avg. Views
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1">
              {(creator.average_views || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#7B726C] block mt-1">Per video / reel</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#F3EAE0] border border-[#D4C2AE]">
            <span className="text-[10px] font-bold text-[#7A6440] uppercase tracking-[0.18em] block">
              Engagement
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1">
              {creator.engagement_rate || 0}%
            </span>
            <span className="text-[10px] text-[#7B726C] block mt-1">Interaction rate</span>
          </div>
        </div>
      </div>

      {/* Send Enquiry Modal (§5.4 FR-ENQ-1) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Collaboration Proposal for ${creator.display_name || profile.name}`}
        description="Submit your campaign deliverables, target publishing deadline, and proposed commercial fee."
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
              className="gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#B49A70]" />
              <span>Send Campaign Proposal</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
