// Unified Data Layer Switcher
// Per User Rule 1 & 2: All pages read/write via this single api instance

import { MockCreatixApi } from './mockApi';
import { SupabaseCreatixApi } from './supabaseApi';
import type { CreatixApi } from './types';

// Default to mock mode unless explicitly set to 'false'
const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const isMockMode = (): boolean => useMock;

export const api: CreatixApi = useMock
  ? new MockCreatixApi()
  : new SupabaseCreatixApi();

export * from './types';
