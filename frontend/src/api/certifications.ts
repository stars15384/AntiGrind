import apiClient from './client';
import type {
  CertificationResponse,
  CertificationCreate,
  CertificationReview,
  CertificationBadgeResponse,
} from '../types';

export const certificationsApi = {
  async apply(data: CertificationCreate): Promise<CertificationResponse> {
    return apiClient.post<CertificationResponse>('/api/certifications', data);
  },

  async getById(id: string): Promise<CertificationResponse> {
    return apiClient.get<CertificationResponse>(`/api/certifications/${id}`);
  },

  async review(id: string, data: CertificationReview): Promise<CertificationResponse> {
    return apiClient.post<CertificationResponse>(`/api/certifications/${id}/review`, data);
  },

  async getMyBadges(): Promise<CertificationBadgeResponse[]> {
    return apiClient.get<CertificationBadgeResponse[]>('/api/certifications/my/badges');
  },

  async downloadReport(id: string, language: string = 'zh'): Promise<Response> {
    const token = localStorage.getItem('auth_token');
    return fetch(`${apiClient.defaults.baseURL || ''}/api/certifications/${id}/report?language=${language}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
      },
    });
  },
};
