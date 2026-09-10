import { httpClient } from './http';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const data = await httpClient<AuthTokens>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('sih_auth_token', data.access_token);
    localStorage.setItem('sih_refresh_token', data.refresh_token);
    return data;
  },

  async register(email: string, password: string): Promise<UserProfile> {
    return httpClient<UserProfile>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async refresh(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('sih_refresh_token');
    const data = await httpClient<AuthTokens>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    localStorage.setItem('sih_auth_token', data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await httpClient('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('sih_auth_token');
      localStorage.removeItem('sih_refresh_token');
    }
  },

  getToken(): string | null {
    return localStorage.getItem('sih_auth_token');
  },
};
