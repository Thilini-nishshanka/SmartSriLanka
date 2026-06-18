import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { User, AuthContextType } from '@/types';
import { authService } from '@/services/authService';
import axiosInstance from '@/lib/axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Clear any existing refresh interval
  const clearRefreshInterval = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  // Set up token refresh interval (refresh every 13 minutes, token expires in 15)
  const setupRefreshInterval = () => {
    clearRefreshInterval();
    
    refreshIntervalRef.current = setInterval(async () => {
      if (isRefreshingRef.current) {
        console.log('Token refresh already in progress, skipping...');
        return;
      }

      try {
        isRefreshingRef.current = true;
        console.log('Auto-refreshing token...');
        await authService.refreshToken();
        
        // Verify the user session is still valid
        const userData = await authService.getCurrentUser();
        setUser(userData);
        console.log('Token refreshed successfully');
      } catch (error: any) {
        console.error('Failed to refresh token:', error);
        
        // Only clear auth on authentication errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          clearAuthState();
          window.location.href = '/auth';
        }
      } finally {
        isRefreshingRef.current = false;
      }
    }, 13 * 60 * 1000); // Refresh every 13 minutes
  };

  const clearAuthState = () => {
    console.log('Clearing auth state...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('currentUser');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
    clearRefreshInterval();
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // Prevent multiple initializations
      if (initialized) {
        console.log('Auth already initialized, skipping...');
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        console.log('Initializing auth...', { 
          hasToken: !!token, 
          hasRefreshToken: !!refreshToken 
        });
        
        // If no tokens at all, user is not authenticated
        if (!refreshToken) {
          console.log('No refresh token found, user not authenticated');
          setLoading(false);
          setInitialized(true);
          return;
        }

        // Load cached user for instant UI (optimistic)
        const cachedUser = sessionStorage.getItem('currentUser');
        if (cachedUser && isMounted) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            setUser(parsedUser);
            console.log('Loaded cached user:', parsedUser);
          } catch (e) {
            console.error('Failed to parse cached user:', e);
          }
        }

        // If we have a token, set it
        if (token) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Try to get current user - the axios interceptor will handle token refresh automatically
        try {
          console.log('Fetching current user (axios will handle token refresh if needed)...');
          const userData = await authService.getCurrentUser();
          if (isMounted) {
            setUser(userData);
            setupRefreshInterval();
            console.log('User authenticated successfully');
          }
        } catch (error: any) {
          console.error('Failed to authenticate user:', error);
          
          // Only clear if it's a definitive auth failure (after axios tried refresh)
          if (error?.response?.status === 401 || 
              error?.response?.status === 403 ||
              error?.message?.includes('No refresh token')) {
            console.log('Authentication failed, clearing auth state');
            clearAuthState();
          } else {
            // Network error or temporary issue - keep cached user if available
            console.log('Network error during auth check, keeping cached state');
          }
        }

      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (isMounted) {
          // Don't clear auth on network errors, only on explicit auth failures
          console.log('Keeping cached auth state despite error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Handle visibility change - verify session when tab becomes visible
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user && !isRefreshingRef.current) {
        console.log('Tab became visible, verifying session...');
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error: any) {
          console.error('Session verification failed:', error);
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            // Try refresh before giving up
            try {
              await authService.refreshToken();
              const userData = await authService.getCurrentUser();
              setUser(userData);
            } catch (refreshError) {
              clearAuthState();
              window.location.href = '/auth';
            }
          }
        }
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize auth only once
    initAuth();

    // Cleanup function
    return () => {
      isMounted = false;
      clearRefreshInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array - run only once

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Logging in...');
      
      // Clear any existing auth state first
      clearAuthState();
      isRefreshingRef.current = false;

      const response = await authService.login({ email, password });
      
      console.log('Login response:', response);

      if (!response.success || !response.data) {
        console.error('Invalid login response:', response);
        throw new Error(response.message || 'Invalid response from server');
      }

      const { user, accessToken, refreshToken } = response.data;
      
      if (!user || !accessToken || !refreshToken) {
        console.error('Missing required data in login response:', response.data);
        throw new Error('Missing required authentication data');
      }

      // Set new tokens and user
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(user);
      
      console.log('Login successful, setting up refresh interval');
      setupRefreshInterval();
      
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      clearAuthState();
      
      if (error?.response?.status === 404) {
        console.log('User not found');
      }
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('Signing up...');
      
      // Clear any existing auth state
      clearAuthState();
      isRefreshingRef.current = false;

      const response = await authService.register({ name, email, password });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed');
      }

      const { user, accessToken, refreshToken } = response.data;
      
      if (!user || !accessToken || !refreshToken) {
        throw new Error('Missing required registration data');
      }
      
      // Set new tokens and user
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(user);
      
      console.log('Signup successful, setting up refresh interval');
      setupRefreshInterval();
      
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      clearAuthState();
      
      if (error?.response?.status === 409) {
        console.log('User already exists');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthState();
    }
  };

  const isAdmin = user?.role === 'admin';

  // Show loading spinner while initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};