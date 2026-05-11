import apiClient from './client';

export interface RankingCompany {
  rank: number;
  company_id: string;
  name: string;
  agi_score: number;
  level: 'green' | 'yellow' | 'red';
  industry: string;
  region: string;
  employee_count: number;
  certification_level: string;
  trend: 'up' | 'down' | 'stable';
  certification_expires_at?: string;
}

export interface RankingsResponse {
  rankings: RankingCompany[];
  filters: {
    industries: { name: string; count: number }[];
    current_industry?: string;
    current_region?: string;
  };
  pagination: {
    total_count: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  statistics: {
    avg_agi_score: number;
    green_companies: number;
    yellow_companies: number;
    red_companies: number;
    total_certified: number;
  };
}

export interface IndustryComparison {
  industry: string;
  company_count: number;
  avg_agi_score: number;
  best_score: number;
  worst_score: number;
  level: 'green' | 'yellow' | 'red';
}

export const rankingsApi = {
  async getRankings(params?: {
    industry?: string;
    region?: string;
    sort_by?: string;
    sort_order?: string;
    limit?: number;
    offset?: number;
  }): Promise<RankingsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.industry) queryParams.set('industry', params.industry);
    if (params?.region) queryParams.set('region', params.region);
    if (params?.sort_by) queryParams.set('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.set('sort_order', params.sort_order);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());

    return apiClient.get<RankingsResponse>(`/api/rankings?${queryParams.toString()}`);
  },

  async getTopCompanies(params?: {
    level?: 'green' | 'yellow' | 'red';
    limit?: number;
  }): Promise<{ companies: RankingCompany[] }> {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.set('level', params.level);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    return apiClient.get(`/api/rankings/top?${queryParams.toString()}`);
  },

  async getIndustryComparison(): Promise<{
    industries: IndustryComparison[];
    total_industries: number;
    generated_at: string;
  }> {
    return apiClient.get('/api/rankings/industries');
  },
};
