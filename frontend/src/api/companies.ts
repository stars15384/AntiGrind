import apiClient from './client';
import type {
  CompanyResponse,
  CompanyDetail,
  CompanySearchResult,
  CompanyCreate,
  CompanyUpdate,
} from '../types';

export const companiesApi = {
  async list(params?: {
    skip?: number;
    limit?: number;
    verification_status?: string;
    sort_by?: string;  // agi_score, created_at, name, employee_count, verification_status
    sort_order?: string; // asc, desc
  }): Promise<CompanyResponse[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.verification_status) searchParams.set('verification_status', params.verification_status);
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);

    const query = searchParams.toString();
    return apiClient.get<CompanyResponse[]>(`/api/companies${query ? `?${query}` : ''}`);
  },

  async search(q: string, limit: number = 10): Promise<CompanySearchResult[]> {
    return apiClient.get<CompanySearchResult[]>(`/api/companies/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  },

  async getById(id: string): Promise<CompanyDetail> {
    return apiClient.get<CompanyDetail>(`/api/companies/${id}`);
  },

  async create(data: CompanyCreate): Promise<CompanyResponse> {
    return apiClient.post<CompanyResponse>('/api/companies', data);
  },

  async update(id: string, data: CompanyUpdate): Promise<CompanyResponse> {
    return apiClient.patch<CompanyResponse>(`/api/companies/${id}`, data);
  },
};
