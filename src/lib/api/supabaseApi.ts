// Supabase Backend API Implementation
// Matches CreatixApi interface for future real-service integration
// (Built per User Rule 2; activated when VITE_USE_MOCK=false)

import { supabase } from '../supabaseClient';
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

export class SupabaseCreatixApi implements CreatixApi {
  // ----------------------------------------------------
  // AUTH
  // ----------------------------------------------------
  async getCurrentSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) return null;
    return { user: profile as Profile, token: session.access_token };
  }

  async signIn(email: string, password?: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'creator123',
    });
    if (error || !data.user) throw new Error(error?.message || 'Login failed');

    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (pError || !profile) throw new Error('User profile could not be loaded.');
    return { user: profile as Profile, token: data.session?.access_token };
  }

  async signUp(
    name: string,
    email: string,
    password?: string,
    role: UserRole = 'creator'
  ): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || 'creator123',
      options: {
        data: { name, role },
      },
    });
    if (error || !data.user) throw new Error(error?.message || 'Signup failed');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: (profile as Profile) || {
        id: data.user.id,
        name,
        email,
        role,
        created_at: new Date().toISOString(),
      },
      token: data.session?.access_token,
    };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  // ----------------------------------------------------
  // PROFILES
  // ----------------------------------------------------
  async getProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data as Profile | null;
  }

  async getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
    const { data } = await supabase.from('creator_profiles').select('*').eq('user_id', userId).single();
    return data as CreatorProfile | null;
  }

  async updateCreatorProfile(userId: string, data: Partial<CreatorProfile>): Promise<CreatorProfile> {
    const { data: updated, error } = await supabase
      .from('creator_profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated as CreatorProfile;
  }

  async getBrandProfile(userId: string): Promise<BrandProfile | null> {
    const { data } = await supabase.from('brand_profiles').select('*').eq('user_id', userId).single();
    return data as BrandProfile | null;
  }

  async updateBrandProfile(userId: string, data: Partial<BrandProfile>): Promise<BrandProfile> {
    const { data: updated, error } = await supabase
      .from('brand_profiles')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated as BrandProfile;
  }

  async getPublicCreatorProfile(
    userId: string
  ): Promise<{ profile: Profile; creator: CreatorProfile } | null> {
    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!creator) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return null;
    return { profile: profile as Profile, creator: creator as CreatorProfile };
  }

  // ----------------------------------------------------
  // COLLABORATIONS
  // ----------------------------------------------------
  async getDeals(creatorId: string): Promise<Collaboration[]> {
    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Collaboration[];
  }

  async getDealById(id: string): Promise<Collaboration | null> {
    const { data } = await supabase.from('collaborations').select('*').eq('id', id).single();
    return data as Collaboration | null;
  }

  async createDeal(data: Omit<Collaboration, 'id' | 'created_at' | 'updated_at'>): Promise<Collaboration> {
    const { data: deal, error } = await supabase
      .from('collaborations')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return deal as Collaboration;
  }

  async updateDeal(id: string, data: Partial<Collaboration>): Promise<Collaboration> {
    const { data: deal, error } = await supabase
      .from('collaborations')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return deal as Collaboration;
  }

  async deleteDeal(id: string): Promise<void> {
    const { error } = await supabase.from('collaborations').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ----------------------------------------------------
  // FINANCIAL RECORDS
  // ----------------------------------------------------
  async getFinancialRecords(creatorId: string): Promise<FinancialRecord[]> {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('creator_id', creatorId)
      .order('transaction_date', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as FinancialRecord[];
  }

  async createFinancialRecord(data: Omit<FinancialRecord, 'id' | 'created_at'>): Promise<FinancialRecord> {
    const { data: record, error } = await supabase
      .from('financial_records')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return record as FinancialRecord;
  }

  async updateFinancialRecord(id: string, data: Partial<FinancialRecord>): Promise<FinancialRecord> {
    const { data: record, error } = await supabase
      .from('financial_records')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return record as FinancialRecord;
  }

  async deleteFinancialRecord(id: string): Promise<void> {
    const { error } = await supabase.from('financial_records').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ----------------------------------------------------
  // ENQUIRIES
  // ----------------------------------------------------
  async getReceivedEnquiries(creatorId: string): Promise<Enquiry[]> {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Enquiry[];
  }

  async getSentEnquiries(brandId: string): Promise<Enquiry[]> {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Enquiry[];
  }

  async createEnquiry(data: Omit<Enquiry, 'id' | 'status' | 'created_at'>): Promise<Enquiry> {
    const { data: enquiry, error } = await supabase
      .from('enquiries')
      .insert({ ...data, status: 'sent' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return enquiry as Enquiry;
  }

  async acceptEnquiry(enquiryId: string): Promise<{ enquiry: Enquiry; collaboration: Collaboration }> {
    // Atomic Postgres RPC (Decision 2)
    const { data: collabId, error } = await supabase.rpc('accept_enquiry', {
      p_enquiry_id: enquiryId,
    });
    if (error) throw new Error(error.message);

    const { data: enquiry } = await supabase.from('enquiries').select('*').eq('id', enquiryId).single();
    const { data: collaboration } = await supabase.from('collaborations').select('*').eq('id', collabId).single();

    return { enquiry: enquiry as Enquiry, collaboration: collaboration as Collaboration };
  }

  async rejectEnquiry(enquiryId: string): Promise<Enquiry> {
    const { error } = await supabase.rpc('reject_enquiry', { p_enquiry_id: enquiryId });
    if (error) throw new Error(error.message);
    const { data: enquiry } = await supabase.from('enquiries').select('*').eq('id', enquiryId).single();
    return enquiry as Enquiry;
  }

  // ----------------------------------------------------
  // DISCOVERY & SHORTLISTS
  // ----------------------------------------------------
  async searchCreators(
    filters: CreatorFilterParams
  ): Promise<Array<{ profile: Profile; creator: CreatorProfile }>> {
    let query = supabase.from('creator_profiles').select('*, profiles(*)').eq('is_public', true);

    if (filters.search) {
      query = query.ilike('display_name', `%${filters.search}%`);
    }
    if (filters.niche && filters.niche !== 'All') {
      query = query.eq('niche', filters.niche);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const rows = (data || []) as any[];
    return rows.map((r) => ({
      profile: r.profiles,
      creator: r,
    }));
  }

  async getShortlistedCreatorIds(brandId: string): Promise<string[]> {
    const { data } = await supabase.from('shortlists').select('creator_id').eq('brand_id', brandId);
    return (data || []).map((s: any) => s.creator_id);
  }

  async toggleShortlist(brandId: string, creatorId: string): Promise<{ shortlisted: boolean }> {
    const { data: existing } = await supabase
      .from('shortlists')
      .select('id')
      .match({ brand_id: brandId, creator_id: creatorId })
      .maybeSingle();

    if (existing) {
      await supabase.from('shortlists').delete().eq('id', existing.id);
      return { shortlisted: false };
    } else {
      await supabase.from('shortlists').insert({ brand_id: brandId, creator_id: creatorId });
      return { shortlisted: true };
    }
  }

  // ----------------------------------------------------
  // CONTRACTS & STORAGE
  // ----------------------------------------------------
  async getContracts(creatorId: string): Promise<ContractDocument[]> {
    const { data, error } = await supabase
      .from('contract_documents')
      .select('*')
      .eq('creator_id', creatorId)
      .order('uploaded_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as ContractDocument[];
  }

  async getContractById(id: string): Promise<ContractDocument | null> {
    const { data } = await supabase.from('contract_documents').select('*').eq('id', id).single();
    return data as ContractDocument | null;
  }

  async uploadContract(creatorId: string, file: File): Promise<ContractDocument> {
    const filePath = `${creatorId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('contracts').upload(filePath, file);
    if (uploadError) throw new Error(uploadError.message);

    const { data, error } = await supabase
      .from('contract_documents')
      .insert({
        creator_id: creatorId,
        file_path: filePath,
        original_filename: file.name,
        review_status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ContractDocument;
  }

  async analyzeContract(_contractId: string, manualText?: string): Promise<ExtractedTerms> {
    const { data, error } = await supabase.functions.invoke('analyze-contract', {
      body: { text: manualText },
    });
    if (error) throw new Error(error.message);
    return data?.data as ExtractedTerms;
  }

  async confirmContractTerms(
    contractId: string,
    terms: Partial<ExtractedTerms>,
    collaborationId?: string | null,
    applyToDeal = false
  ): Promise<ContractDocument> {
    const { data, error } = await supabase
      .from('contract_documents')
      .update({
        review_status: 'confirmed',
        extracted_terms: terms,
        collaboration_id: collaborationId,
      })
      .eq('id', contractId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (applyToDeal && collaborationId) {
      await supabase
        .from('collaborations')
        .update({
          payment_amount: terms.payment_amount,
          submission_deadline: terms.submission_deadline,
          publishing_deadline: terms.publishing_deadline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collaborationId);
    }

    return data as ContractDocument;
  }
}
