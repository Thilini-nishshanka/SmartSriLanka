import axiosInstance from '@/lib/axios';
import { API_PATHS } from '@/lib/api-paths';
import type { User } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  country?: string;
}

export const profileService = {
  async getMyProfile(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(API_PATHS.PROFILES.ME);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch profile');
    }
    return response.data.data;
  },

  async updateMyProfile(data: UpdateProfileData): Promise<User> {
    const response = await axiosInstance.put<ApiResponse<User>>(API_PATHS.PROFILES.ME, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update profile');
    }
    return response.data.data;
  },
};