import apiClient from './client';
import type { QACreate, QAAnswer, QAResponse } from '../types';

export const qaApi = {
  async ask(data: QACreate): Promise<QAResponse> {
    return apiClient.post<QAResponse>('/api/qa', data);
  },

  async answer(questionId: string, data: QAAnswer): Promise<QAResponse> {
    return apiClient.post<QAResponse>(`/api/qa/${questionId}/answer`, data);
  },

  async list(params?: { skip?: number; limit?: number }): Promise<QAResponse[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiClient.get<QAResponse[]>(`/api/qa${query ? `?${query}` : ''}`);
  },
};
