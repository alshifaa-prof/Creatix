// Database & Domain Types per PRD §6, §8, §9

export type UserRole = 'creator' | 'brand';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
}

export interface CreatorProfile {
  user_id: string;
  display_name: string | null; // Decision 1
  bio: string | null;
  niche: string;
  expertise: string[];
  location: string | null;
  profile_image_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  other_links: string[];
  follower_count: number;
  subscriber_count: number;
  average_views: number;
  engagement_rate: number;
  portfolio_links: string[];
  is_public: boolean;
  updated_at: string;
}

export interface BrandProfile {
  user_id: string;
  brand_name: string;
  description: string | null;
  industry: string | null;
  website: string | null;
  logo_url: string | null;
}

export type DealStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid';

export interface Collaboration {
  id: string;
  creator_id: string;
  brand_id: string | null;
  enquiry_id: string | null;
  brand_name: string;
  campaign_title: string;
  description: string | null;
  payment_amount: number;
  deliverables: string | null;
  submission_deadline: string | null;
  publishing_deadline: string | null;
  deal_status: DealStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  show_on_profile: boolean;
  created_at: string;
  updated_at: string;
}

export type ContractReviewStatus = 'pending' | 'confirmed';

export interface ContractFlag {
  clause: string;
  reason: string;
}

export interface ExtractedTerms {
  summary: string;
  brand_name: string | null;
  payment_amount: number | null;
  currency: string | null;
  payment_conditions: string | null;
  deliverables: string[];
  submission_deadline: string | null;
  publishing_deadline: string | null;
  exclusivity: string | null;
  usage_licensing: string | null;
  flags: ContractFlag[];
}

export interface ContractDocument {
  id: string;
  creator_id: string;
  collaboration_id: string | null;
  file_path: string | null;
  original_filename: string | null;
  extracted_text: string | null;
  ai_summary: string | null;
  ai_flags: ContractFlag[];
  extracted_terms: Partial<ExtractedTerms>;
  review_status: ContractReviewStatus;
  uploaded_at: string;
}

export type RecordType = 'income' | 'expense';
export type RecordPaymentStatus = 'received' | 'pending';

export interface FinancialRecord {
  id: string;
  creator_id: string;
  collaboration_id: string | null;
  record_type: RecordType;
  category: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  payment_status: RecordPaymentStatus;
  created_at: string;
}

export type EnquiryStatus = 'sent' | 'accepted' | 'rejected';

export interface Enquiry {
  id: string;
  creator_id: string;
  brand_id: string;
  campaign_title: string;
  description: string;
  offered_payment: number;
  deliverables: string | null;
  deadline: string | null;
  additional_requirements: string | null;
  status: EnquiryStatus;
  created_at: string;
}

export interface Shortlist {
  id: string;
  brand_id: string;
  creator_id: string;
  created_at: string;
}
