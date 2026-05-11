import apiClient from './client';
import type { ScanResult } from '../types';

export const scanApi = {
  async getByBarcode(barcode: string): Promise<ScanResult> {
    return apiClient.get<ScanResult>(`/api/scan/barcode/${encodeURIComponent(barcode)}`);
  },
};
