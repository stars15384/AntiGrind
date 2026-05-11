import apiClient from './client';
import type {
  AttendanceScreenshotResponse,
  CompanyAttendanceStats,
} from '../types';

export const attendanceApi = {
  async uploadScreenshot(
    companyId: string,
    source: string,
    file: File
  ): Promise<AttendanceScreenshotResponse> {
    const formData = new FormData();
    formData.append('company_id', companyId);
    formData.append('source', source);
    formData.append('file', file);

    return apiClient.postForm<AttendanceScreenshotResponse>('/api/attendance/screenshots', formData);
  },

  async getMyScreenshots(params?: { skip?: number; limit?: number }): Promise<AttendanceScreenshotResponse[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiClient.get<AttendanceScreenshotResponse[]>(`/api/attendance/my/screenshots${query ? `?${query}` : ''}`);
  },

  async getCompanyStats(companyId: string): Promise<CompanyAttendanceStats> {
    return apiClient.get<CompanyAttendanceStats>(`/api/attendance/company/${companyId}/stats`);
  },

  async verify(screenshotId: string): Promise<{ status: string; message: string }> {
    return apiClient.post<{ status: string; message: string }>(`/api/attendance/${screenshotId}/verify`);
  },
};
