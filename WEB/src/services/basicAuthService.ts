import axios from 'axios';
import type { User } from '@/types';

const API_BASE_URL = 'http://localhost:3000/api/v1';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  } | null;
}

export const basicAuthService = {
  // Login
  async login(email: string, password: string): Promise<User | null> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/basic/login`,
        { email, password }
      );

      if (response.data.success && response.data.data?.user) {
        // Store user data in sessionStorage
        const user = response.data.data.user;
        sessionStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },

  // Logout
  logout(): void {
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
};