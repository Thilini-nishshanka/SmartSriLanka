import axiosInstance from '@/lib/axios';
import axios from 'axios';
import { API_PATHS } from '@/lib/api-paths';
import type { User } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error?: string;
}

interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

type AuthResponse = ApiResponse<AuthResponseData>;

export const authService = {
  // ✅ LOGIN USER
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_PATHS.AUTH.LOGIN,
        credentials
      );

      console.log('🔍 Login API raw response:', response.data);

      const data = response.data?.data;

      if (!response.data.success || !data) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { accessToken, refreshToken, user } = data;

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Invalid login response from server.');
      }

      // ✅ Save tokens and user info
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('current_user', JSON.stringify(user));

      // ✅ Set axios header for all authenticated requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      console.log('✅ Tokens saved successfully!');
      return response.data;
    } catch (error: any) {
      console.error('❌ Login service error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login request failed');
    }
  },

  // ✅ REGISTER NEW USER
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_PATHS.AUTH.REGISTER,
        data
      );

      const resData = response.data?.data;
      if (!response.data.success || !resData) {
        throw new Error(response.data.message || 'Registration failed');
      }

      const { accessToken, refreshToken, user } = resData;

      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('current_user', JSON.stringify(user));

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      return response.data;
    } catch (error: any) {
      console.error('Register service error:', error);
      throw error;
    }
  },

  // ✅ LOGOUT USER
  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Logout service error (ignored):', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      console.log('🚪 Logged out and cleared tokens');
    }
  },

  // ✅ GET CURRENT USER
  async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await axiosInstance.get<ApiResponse<User>>(API_PATHS.AUTH.ME);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get user data');
      }

      localStorage.setItem('current_user', JSON.stringify(response.data.data));
      return response.data.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // ✅ REFRESH TOKEN
  async refreshToken(): Promise<{ token: string; refresh_token: string }> {
    const currentRefreshToken = localStorage.getItem('refresh_token');
    if (!currentRefreshToken) {
      console.error('No refresh token found in localStorage');
      throw new Error('No refresh token available');
    }

    try {
      const tempApi = axios.create({
        baseURL: 'http://localhost:3000/api/v1',
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await tempApi.post<
        ApiResponse<{ accessToken: string; refreshToken: string }>
      >(API_PATHS.AUTH.REFRESH, { refreshToken: currentRefreshToken });

      const resData = response.data?.data;
      if (!response.data.success || !resData) {
        throw new Error(response.data.message || 'Token refresh failed');
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = resData;

      localStorage.setItem('auth_token', newAccessToken);
      localStorage.setItem('refresh_token', newRefreshToken);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

      console.log('♻️ Token refreshed successfully!');
      return {
        token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error: any) {
      console.error('Token refresh service error:', error);
      throw error;
    }
  },
};
