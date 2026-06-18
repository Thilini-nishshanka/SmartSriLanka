import axiosInstance from '@/lib/axios';
import { API_PATHS } from '@/lib/api-paths';

interface Policy {
  id: number;
  slug: string;
  title: string;
  content: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const policyService = {
  async getAllPolicies(): Promise<Policy[]> {
    const response = await axiosInstance.get<ApiResponse<Policy[]>>(`${API_PATHS.POLICIES.LIST}/list`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch policies');
    }
    return response.data.data;
  },

  async getPolicyBySlug(slug: string): Promise<Policy> {
    const response = await axiosInstance.get<ApiResponse<Policy>>(API_PATHS.POLICIES.DETAIL(slug));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch policy page');
    }
    return response.data.data;
  },

  async updatePolicy(slug: string, content: string): Promise<Policy> {
    const response = await axiosInstance.put<ApiResponse<Policy>>(API_PATHS.POLICIES.UPDATE(slug), { content });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update policy page');
    }
    return response.data.data;
  },
};