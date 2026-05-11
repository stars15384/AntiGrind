import apiClient from './client';
import type { User, UserCreate, UserLogin, Token } from '../types';

export interface CaptchaResponse {
  image: string;
  session_id: string;
  expires_in: number;
}

export const authApi = {
  async register(data: UserCreate & { captcha_code?: string; captcha_session_id?: string }): Promise<User> {
    return apiClient.post<User>('/api/auth/register', data);
  },

  async login(data: UserLogin & { captcha_code?: string; captcha_session_id?: string }): Promise<Token> {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    if (data.captcha_code) {
      formData.append('captcha_code', data.captcha_code);
    }
    if (data.captcha_session_id) {
      formData.append('captcha_session_id', data.captcha_session_id);
    }

    const response = await apiClient.postForm<Token>('/api/auth/login', formData);
    apiClient.setToken(response.access_token);
    return response;
  },

  async getCaptcha(): Promise<CaptchaResponse> {
    return apiClient.get<CaptchaResponse>('/api/auth/captcha');
  },

  async getProfile(): Promise<User> {
    return apiClient.get<User>('/api/auth/profile');
  },

  logout() {
    apiClient.setToken(null);
  },
};
