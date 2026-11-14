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

export interface AuthSession {
  user: Profile;
  token?: string;
}

export interface CreatorFilterParams {
  search?: string;
  niche?: string;
  platform?: 'all' | 'instagram' | 'youtube';
  followerRange?: string; // '<10k', '10k-50k', '50k-100k', '100k+'
}

export interface CreatixApi {
  // Auth
  getCurrentSession(): Promise<AuthSession | null>;
  signIn(email: string, password?: string): Promise<AuthSession>;
  signUp(name: string, email: string, password?: string, role?: UserRole): Promise<AuthSession>;
  signOut(): Promise<void>;

  // Profiles
  getProfile(userId: string): Promise<Profile | null>;
  getCreatorProfile(userId: string): Promise<CreatorProfile | null>;
  updateCreatorProfile(userId: string, data: Partial<CreatorProfile>): Promise<CreatorProfile>;
  getBrandProfile(userId: string): Promise<BrandProfile | null>;
  updateBrandProfile(userId: string, data: Partial<BrandProfile>): Promise<BrandProfile>;
  getPublicCreatorProfile(userId: string): Promise<{ profile: Profile; creator: CreatorProfile } | null>;

  // Collaborations (Deals)
  getDeals(creatorId: string): Promise<Collaboration[]>;
  getDealById(id: string): Promise<Collaboration | null>;
  createDeal(data: Omit<Collaboration, 'id' | 'created_at' | 'updated_at'>): Promise<Collaboration>;
  updateDeal(id: string, data: Partial<Collaboration>): Promise<Collaboration>;
  deleteDeal(id: string): Promise<void>;

  // Financial Records
  getFinancialRecords(creatorId: string): Promise<FinancialRecord[]>;
  createFinancialRecord(data: Omit<FinancialRecord, 'id' | 'created_at'>): Promise<FinancialRecord>;
  updateFinancialRecord(id: string, data: Partial<FinancialRecord>): Promise<FinancialRecord>;
  deleteFinancialRecord(id: string): Promise<void>;

  // Enquiries
  getReceivedEnquiries(creatorId: string): Promise<Enquiry[]>;
  getSentEnquiries(brandId: string): Promise<Enquiry[]>;
  createEnquiry(data: Omit<Enquiry, 'id' | 'status' | 'created_at'>): Promise<Enquiry>;
  acceptEnquiry(enquiryId: string): Promise<{ enquiry: Enquiry; collaboration: Collaboration }>;
  rejectEnquiry(enquiryId: string): Promise<Enquiry>;

  // Discovery & Shortlists
  searchCreators(filters: CreatorFilterParams): Promise<Array<{ profile: Profile; creator: CreatorProfile }>>;
  getShortlistedCreatorIds(brandId: string): Promise<string[]>;
  toggleShortlist(brandId: string, creatorId: string): Promise<{ shortlisted: boolean }>;

  // Contracts & AI Intelligence
  getContracts(creatorId: string): Promise<ContractDocument[]>;
  getContractById(id: string): Promise<ContractDocument | null>;
  uploadContract(creatorId: string, file: File): Promise<ContractDocument>;
  analyzeContract(contractId: string, manualText?: string): Promise<ExtractedTerms>;
  confirmContractTerms(
    contractId: string,
    terms: Partial<ExtractedTerms>,
    collaborationId?: string | null,
    applyToDeal?: boolean
  ): Promise<ContractDocument>;
}
