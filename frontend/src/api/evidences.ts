import apiClient from './client';
import type { EvidenceResponse, EvidenceCreate } from '../types';

export const evidencesApi = {
  async upload(companyId: string, file: File, data: EvidenceCreate): Promise<EvidenceResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_id', companyId);
    formData.append('file_type', data.file_type);
    formData.append('type', data.type);
    if (data.work_hour_record_id) {
      formData.append('work_hour_record_id', data.work_hour_record_id);
    }

    return apiClient.postForm<EvidenceResponse>('/api/evidences', formData);
  },

  async getById(id: string): Promise<EvidenceResponse> {
    return apiClient.get<EvidenceResponse>(`/api/evidences/${id}`);
  },
};
