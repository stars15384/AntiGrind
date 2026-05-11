import apiClient from './client';
import type {
  WorkHourRecordResponse,
  WorkHourRecordCreate,
  WorkHourRecordVerify,
} from '../types';

export const workHoursApi = {
  async create(data: WorkHourRecordCreate): Promise<WorkHourRecordResponse> {
    return apiClient.post<WorkHourRecordResponse>('/api/work-hours', data);
  },

  async getByCompany(companyId: string, params?: { skip?: number; limit?: number }): Promise<WorkHourRecordResponse[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiClient.get<WorkHourRecordResponse[]>(
      `/api/work-hours/company/${companyId}${query ? `?${query}` : ''}`
    );
  },

  async verify(recordId: string, data: WorkHourRecordVerify): Promise<WorkHourRecordResponse> {
    return apiClient.post<WorkHourRecordResponse>(`/api/work-hours/${recordId}/verify`, data);
  },
};
