// In-Memory & LocalStorage Mock API Implementation
// Satisfies PRD §0, §5, §6, §7, §8, §9 and User Mock Rules 1-5

import type { CreatixApi, AuthSession, CreatorFilterParams } from './types';
import type {
  Profile,
  CreatorProfile,
  BrandProfile,
  Collaboration,
  FinancialRecord,
  Enquiry,
  ContractDocument,
  ExtractedTerms,
  UserRole,
} from '../../types';
import {
  getStoredMockData,
  saveStoredMockData,
  AANYA_USER_ID,
  KAYA_BRAND_USER_ID,
} from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockCreatixApi implements CreatixApi {
  // ----------------------------------------------------
  // AUTH
  // ----------------------------------------------------
  async getCurrentSession(): Promise<AuthSession | null> {
    await delay(50);
    const db = getStoredMockData();
    if (!db.currentUserId) return null;
    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) return null;
    return { user, token: 'mock-session-token' };
  }

  async signIn(email: string, _password?: string): Promise<AuthSession> {
    await delay(150);
    const db = getStoredMockData();
    const cleanEmail = email.trim().toLowerCase();

    // Find existing user or check demo shortcuts
    let user = db.users.find((u) => (u.email || '').toLowerCase() === cleanEmail);

    if (!user) {
      if (cleanEmail.includes('creator') || cleanEmail.includes('aanya')) {
        user = db.users.find((u) => u.id === AANYA_USER_ID);
      } else if (cleanEmail.includes('brand') || cleanEmail.includes('kaya')) {
        user = db.users.find((u) => u.id === KAYA_BRAND_USER_ID);
      }
    }

    if (!user) {
      throw new Error('User not found. Please check your email or use one of the demo accounts.');
    }

    db.currentUserId = user.id;
    saveStoredMockData(db);
    return { user, token: 'mock-session-token' };
  }

  async signUp(
    name: string,
    email: string,
    _password?: string,
    role: UserRole = 'creator'
  ): Promise<AuthSession> {
    await delay(200);
    const db = getStoredMockData();
    const cleanEmail = email.trim().toLowerCase();

    if (db.users.some((u) => (u.email || '').toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUserId = `usr-${Date.now()}`;
    const newUser: Profile = {
      id: newUserId,
      name,
      email: cleanEmail,
      role,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.currentUserId = newUserId;

    if (role === 'creator') {
      db.creators[newUserId] = {
        user_id: newUserId,
        display_name: name,
        bio: '',
        niche: 'Beauty & Lifestyle',
        expertise: [],
        location: '',
        profile_image_url: '',
        instagram_url: '',
        youtube_url: '',
        other_links: [],
        follower_count: 0,
        subscriber_count: 0,
        average_views: 0,
        engagement_rate: 0,
        portfolio_links: [],
        is_public: false,
        updated_at: new Date().toISOString(),
      };
    } else {
      db.brands[newUserId] = {
        user_id: newUserId,
        brand_name: name,
        description: '',
        industry: '',
        website: '',
        logo_url: '',
      };
    }

    saveStoredMockData(db);
    return { user: newUser, token: 'mock-session-token' };
  }

  async signOut(): Promise<void> {
    await delay(50);
    const db = getStoredMockData();
    db.currentUserId = null;
    saveStoredMockData(db);
  }

  // ----------------------------------------------------
  // PROFILES
  // ----------------------------------------------------
  async getProfile(userId: string): Promise<Profile | null> {
    await delay(30);
    const db = getStoredMockData();
    return db.users.find((u) => u.id === userId) || null;
  }

  async getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
    await delay(40);
    const db = getStoredMockData();
    return db.creators[userId] || null;
  }

  async updateCreatorProfile(
    userId: string,
    data: Partial<CreatorProfile>
  ): Promise<CreatorProfile> {
    await delay(100);
    const db = getStoredMockData();
    const existing = db.creators[userId] || {
      user_id: userId,
      display_name: 'Creator',
      bio: '',
      niche: 'Beauty & Lifestyle',
      expertise: [],
      location: '',
      profile_image_url: '',
      instagram_url: '',
      youtube_url: '',
      other_links: [],
      follower_count: 0,
      subscriber_count: 0,
      average_views: 0,
      engagement_rate: 0,
      portfolio_links: [],
      is_public: false,
      updated_at: new Date().toISOString(),
    };

    const updated: CreatorProfile = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };

    db.creators[userId] = updated;

    // Keep user name in sync if display_name updated
    if (data.display_name) {
      const u = db.users.find((user) => user.id === userId);
      if (u) u.name = data.display_name;
    }

    saveStoredMockData(db);
    return updated;
  }

  async getBrandProfile(userId: string): Promise<BrandProfile | null> {
    await delay(40);
    const db = getStoredMockData();
    return db.brands[userId] || null;
  }

  async updateBrandProfile(userId: string, data: Partial<BrandProfile>): Promise<BrandProfile> {
    await delay(100);
    const db = getStoredMockData();
    const existing = db.brands[userId] || {
      user_id: userId,
      brand_name: 'Brand',
      description: '',
      industry: '',
      website: '',
      logo_url: '',
    };

    const updated: BrandProfile = { ...existing, ...data };
    db.brands[userId] = updated;
    saveStoredMockData(db);
    return updated;
  }

  async getPublicCreatorProfile(
    userId: string
  ): Promise<{ profile: Profile; creator: CreatorProfile } | null> {
    await delay(80);
    const db = getStoredMockData();
    const profile = db.users.find((u) => u.id === userId);
    const creator = db.creators[userId];

    if (!profile || !creator) return null;
    // Decision 5: Accessible if public OR if owner is viewing
    if (!creator.is_public && db.currentUserId !== userId) {
      return null;
    }

    return { profile, creator };
  }

  // ----------------------------------------------------
  // COLLABORATIONS (DEALS)
  // ----------------------------------------------------
  async getDeals(creatorId: string): Promise<Collaboration[]> {
    await delay(50);
    const db = getStoredMockData();
    return db.collaborations.filter((c) => c.creator_id === creatorId);
  }

  async getDealById(id: string): Promise<Collaboration | null> {
    await delay(40);
    const db = getStoredMockData();
    return db.collaborations.find((c) => c.id === id) || null;
  }

  async createDeal(
    data: Omit<Collaboration, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Collaboration> {
    await delay(100);
    const db = getStoredMockData();
    const newDeal: Collaboration = {
      ...data,
      id: `collab-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.collaborations.unshift(newDeal);
    saveStoredMockData(db);
    return newDeal;
  }

  async updateDeal(id: string, data: Partial<Collaboration>): Promise<Collaboration> {
    await delay(100);
    const db = getStoredMockData();
    const idx = db.collaborations.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Collaboration deal not found.');

    const updated: Collaboration = {
      ...db.collaborations[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    db.collaborations[idx] = updated;
    saveStoredMockData(db);
    return updated;
  }

  async deleteDeal(id: string): Promise<void> {
    await delay(80);
    const db = getStoredMockData();
    // PRD §5.3 FR-DEAL-4: Keep linked financial records & contract (set collaboration_id to null)
    db.collaborations = db.collaborations.filter((c) => c.id !== id);
    db.financialRecords = db.financialRecords.map((r) =>
      r.collaboration_id === id ? { ...r, collaboration_id: null } : r
    );
    db.contracts = db.contracts.map((doc) =>
      doc.collaboration_id === id ? { ...doc, collaboration_id: null } : doc
    );
    saveStoredMockData(db);
  }

  // ----------------------------------------------------
  // FINANCIAL RECORDS
  // ----------------------------------------------------
  async getFinancialRecords(creatorId: string): Promise<FinancialRecord[]> {
    await delay(50);
    const db = getStoredMockData();
    return db.financialRecords.filter((r) => r.creator_id === creatorId);
  }

  async createFinancialRecord(
    data: Omit<FinancialRecord, 'id' | 'created_at'>
  ): Promise<FinancialRecord> {
    await delay(80);
    const db = getStoredMockData();
    const record: FinancialRecord = {
      ...data,
      id: `fin-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    db.financialRecords.unshift(record);
    saveStoredMockData(db);
    return record;
  }

  async updateFinancialRecord(
    id: string,
    data: Partial<FinancialRecord>
  ): Promise<FinancialRecord> {
    await delay(80);
    const db = getStoredMockData();
    const idx = db.financialRecords.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Financial record not found.');

    const updated: FinancialRecord = { ...db.financialRecords[idx], ...data };
    db.financialRecords[idx] = updated;
    saveStoredMockData(db);
    return updated;
  }

  async deleteFinancialRecord(id: string): Promise<void> {
    await delay(60);
    const db = getStoredMockData();
    db.financialRecords = db.financialRecords.filter((r) => r.id !== id);
    saveStoredMockData(db);
  }

  // ----------------------------------------------------
  // ENQUIRIES
  // ----------------------------------------------------
  async getReceivedEnquiries(creatorId: string): Promise<Enquiry[]> {
    await delay(50);
    const db = getStoredMockData();
    return db.enquiries.filter((e) => e.creator_id === creatorId);
  }

  async getSentEnquiries(brandId: string): Promise<Enquiry[]> {
    await delay(50);
    const db = getStoredMockData();
    return db.enquiries.filter((e) => e.brand_id === brandId);
  }

  async createEnquiry(data: Omit<Enquiry, 'id' | 'status' | 'created_at'>): Promise<Enquiry> {
    await delay(120);
    const db = getStoredMockData();
    const enquiry: Enquiry = {
      ...data,
      id: `enq-${Date.now()}`,
      status: 'sent',
      created_at: new Date().toISOString(),
    };
    db.enquiries.unshift(enquiry);
    saveStoredMockData(db);
    return enquiry;
  }

  async acceptEnquiry(
    enquiryId: string
  ): Promise<{ enquiry: Enquiry; collaboration: Collaboration }> {
    await delay(150);
    const db = getStoredMockData();
    const enquiry = db.enquiries.find((e) => e.id === enquiryId);
    if (!enquiry) throw new Error('Enquiry not found.');
    if (enquiry.status !== 'sent') {
      throw new Error('Only pending sent enquiries can be accepted.');
    }

    // Atomic creation per Decision 2 & PRD §5.4 FR-ENQ-3
    enquiry.status = 'accepted';

    // Check unique enquiry_id constraint
    let existingCollab = db.collaborations.find((c) => c.enquiry_id === enquiryId);
    if (existingCollab) {
      return { enquiry, collaboration: existingCollab };
    }

    const brand = db.brands[enquiry.brand_id];
    const brandUser = db.users.find((u) => u.id === enquiry.brand_id);
    const brandName = brand?.brand_name || brandUser?.name || 'Brand Partner';

    const newCollab: Collaboration = {
      id: `collab-${Date.now()}`,
      creator_id: enquiry.creator_id,
      brand_id: enquiry.brand_id,
      enquiry_id: enquiry.id,
      brand_name: brandName,
      campaign_title: enquiry.campaign_title,
      description: enquiry.description,
      payment_amount: enquiry.offered_payment,
      deliverables: enquiry.deliverables || '',
      submission_deadline: null,
      publishing_deadline: enquiry.deadline || null,
      deal_status: 'accepted',
      payment_status: 'pending',
      notes: enquiry.additional_requirements || '',
      show_on_profile: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.collaborations.unshift(newCollab);
    saveStoredMockData(db);
    return { enquiry, collaboration: newCollab };
  }

  async rejectEnquiry(enquiryId: string): Promise<Enquiry> {
    await delay(100);
    const db = getStoredMockData();
    const enquiry = db.enquiries.find((e) => e.id === enquiryId);
    if (!enquiry) throw new Error('Enquiry not found.');
    if (enquiry.status !== 'sent') {
      throw new Error('Only sent enquiries can be rejected.');
    }

    enquiry.status = 'rejected';
    saveStoredMockData(db);
    return enquiry;
  }

  // ----------------------------------------------------
  // DISCOVERY & SHORTLISTS
  // ----------------------------------------------------
  async searchCreators(
    filters: CreatorFilterParams
  ): Promise<Array<{ profile: Profile; creator: CreatorProfile }>> {
    await delay(100);
    const db = getStoredMockData();
    const results: Array<{ profile: Profile; creator: CreatorProfile }> = [];

    for (const [userId, creator] of Object.entries(db.creators)) {
      if (!creator.is_public) continue; // Only public creators in directory per §5.5 FR-DISC-1

      const profile = db.users.find((u) => u.id === userId);
      if (!profile) continue;

      // Filter by name (case-insensitive substring) - Decision 1: uses display_name
      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.toLowerCase().trim();
        const nameMatch = (creator.display_name || profile.name || '')
          .toLowerCase()
          .includes(query);
        const bioMatch = (creator.bio || '').toLowerCase().includes(query);
        if (!nameMatch && !bioMatch) continue;
      }

      // Filter by niche
      if (filters.niche && filters.niche !== 'All' && creator.niche !== filters.niche) {
        continue;
      }

      // Filter by platform
      if (filters.platform === 'instagram' && !creator.instagram_url) continue;
      if (filters.platform === 'youtube' && !creator.youtube_url) continue;

      // Filter by follower range
      if (filters.followerRange && filters.followerRange !== 'all') {
        const count = creator.follower_count || 0;
        if (filters.followerRange === '<10k' && count >= 10000) continue;
        if (filters.followerRange === '10k-50k' && (count < 10000 || count > 50000)) continue;
        if (filters.followerRange === '50k-100k' && (count < 50000 || count > 100000)) continue;
        if (filters.followerRange === '100k+' && count < 100000) continue;
      }

      results.push({ profile, creator });
    }

    return results;
  }

  async getShortlistedCreatorIds(brandId: string): Promise<string[]> {
    await delay(40);
    const db = getStoredMockData();
    return db.shortlists.filter((s) => s.brand_id === brandId).map((s) => s.creator_id);
  }

  async toggleShortlist(brandId: string, creatorId: string): Promise<{ shortlisted: boolean }> {
    await delay(80);
    const db = getStoredMockData();
    const existingIdx = db.shortlists.findIndex(
      (s) => s.brand_id === brandId && s.creator_id === creatorId
    );

    if (existingIdx !== -1) {
      db.shortlists.splice(existingIdx, 1);
      saveStoredMockData(db);
      return { shortlisted: false };
    } else {
      db.shortlists.push({
        id: `sl-${Date.now()}`,
        brand_id: brandId,
        creator_id: creatorId,
        created_at: new Date().toISOString(),
      });
      saveStoredMockData(db);
      return { shortlisted: true };
    }
  }

  // ----------------------------------------------------
  // CONTRACTS & AI INTELLIGENCE
  // ----------------------------------------------------
  async getContracts(creatorId: string): Promise<ContractDocument[]> {
    await delay(50);
    const db = getStoredMockData();
    return db.contracts.filter((c) => c.creator_id === creatorId);
  }

  async getContractById(id: string): Promise<ContractDocument | null> {
    await delay(40);
    const db = getStoredMockData();
    return db.contracts.find((c) => c.id === id) || null;
  }

  async uploadContract(creatorId: string, file: File): Promise<ContractDocument> {
    await delay(300); // Simulate upload latency
    const db = getStoredMockData();

    const newDoc: ContractDocument = {
      id: `con-${Date.now()}`,
      creator_id: creatorId,
      collaboration_id: null,
      file_path: `mock/contracts/${file.name}`,
      original_filename: file.name,
      extracted_text: `Simulated text extracted from ${file.name}`,
      ai_summary: null,
      ai_flags: [],
      extracted_terms: {},
      review_status: 'pending',
      uploaded_at: new Date().toISOString(),
    };

    db.contracts.unshift(newDoc);
    saveStoredMockData(db);
    return newDoc;
  }

  async analyzeContract(contractId: string, _manualText?: string): Promise<ExtractedTerms> {
    // 1.5s delay to make AI loading state visible per User Rule 4
    await delay(1500);

    const realisticTerms: ExtractedTerms = {
      summary:
        'Standard brand collaboration agreement between Kaya Botanics India and Aanya Sharma for the promotion of Ayurvedic Vitamin C Serum across Instagram.',
      brand_name: 'Kaya Botanics',
      payment_amount: 12000,
      currency: 'INR',
      payment_conditions: 'Net 30 days upon submission and verification of live links',
      deliverables: [
        '1x Instagram 60-second Dedicated Reel',
        '2x Instagram Stories with brand sticker link',
      ],
      submission_deadline: '2026-11-28',
      publishing_deadline: '2026-12-05',
      exclusivity: '30 days post-publishing for competing Ayurvedic skincare brands',
      usage_licensing: 'Paid digital ads whitelist rights for 60 days on Meta platform',
      flags: [
        {
          clause: 'Extended 60-day Paid Ads Whitelist',
          reason:
            'Brand retains digital ad amplification rights without additional compensation beyond base fee.',
        },
        {
          clause: 'Strict Exclusivity Window',
          reason:
            'Restricts collaborations with any direct Ayurvedic beauty competitors for 30 days.',
        },
      ],
    };

    const db = getStoredMockData();
    const doc = db.contracts.find((c) => c.id === contractId);
    if (doc) {
      doc.ai_summary = realisticTerms.summary;
      doc.ai_flags = realisticTerms.flags;
      doc.extracted_terms = realisticTerms;
      saveStoredMockData(db);
    }

    return realisticTerms;
  }

  async confirmContractTerms(
    contractId: string,
    terms: Partial<ExtractedTerms>,
    collaborationId?: string | null,
    applyToDeal = false
  ): Promise<ContractDocument> {
    await delay(150);
    const db = getStoredMockData();
    const doc = db.contracts.find((c) => c.id === contractId);
    if (!doc) throw new Error('Contract document not found.');

    doc.review_status = 'confirmed';
    doc.extracted_terms = { ...doc.extracted_terms, ...terms };
    if (collaborationId) {
      doc.collaboration_id = collaborationId;
    }

    // Explicitly apply payment & deadlines to deal per PRD §5.6 FR-CON-9
    if (applyToDeal && collaborationId) {
      const deal = db.collaborations.find((c) => c.id === collaborationId);
      if (deal) {
        if (terms.payment_amount !== undefined && terms.payment_amount !== null) {
          deal.payment_amount = terms.payment_amount;
        }
        if (terms.submission_deadline !== undefined) {
          deal.submission_deadline = terms.submission_deadline;
        }
        if (terms.publishing_deadline !== undefined) {
          deal.publishing_deadline = terms.publishing_deadline;
        }
        deal.updated_at = new Date().toISOString();
      }
    }

    saveStoredMockData(db);
    return doc;
  }
}
