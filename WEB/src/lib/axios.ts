import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
} from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

let isRefreshing = false;
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void; }[] = [];

// Process queued requests after token refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Extend axios request config to include retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log(`✅ Response: ${response.status} ${response.config.url}`);
    }

    // Handle tokens from response body
    const token = response.data?.data?.accessToken || 
                  response.headers['authorization']?.replace('Bearer ', '');
    const refreshToken = response.data?.data?.refreshToken || 
                         response.headers['refresh-token'];

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 🔐 Handle 401 Unauthorized - Token Expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints to prevent infinite loops
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh') ||
          originalRequest._skipAuthRefresh) {
        if (import.meta.env.DEV) {
          console.log('Skipping token refresh for auth endpoint');
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        if (import.meta.env.DEV) {
          console.log('Queueing request while token refresh in progress...');
        }
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          console.error('No refresh token available for token refresh');
          throw new Error('No refresh token available');
        }

        console.log('🔄 Attempting to refresh token...');

        // Use a clean axios instance to avoid interceptor recursion
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { 
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 
          }
        );

        if (!refreshResponse.data?.success || !refreshResponse.data?.data?.accessToken) {
          console.error('Invalid refresh response:', refreshResponse.data);
          throw new Error('Invalid refresh response');
        }

        const { accessToken: newToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

        // Update stored tokens
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        // Update axios default header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        console.log('✅ Token refreshed successfully');

        // Process queued requests with new token
        processQueue(null, newToken);

        // Retry original request with new token
        return apiClient(originalRequest);

      } catch (refreshError: any) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Clear failed queue
        processQueue(refreshError, null);

        // Determine if we should clear auth and redirect
        const shouldClearAuth = 
          refreshError?.response?.status === 401 || 
          refreshError?.response?.status === 403 ||
          refreshError?.message?.includes('No refresh token');

        if (shouldClearAuth) {
          console.log('Clearing auth state and redirecting to login...');
          
          // Clear auth state
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          sessionStorage.removeItem('currentUser');
          delete apiClient.defaults.headers.common['Authorization'];
          
          // Only show toast if not already on auth page
          if (!window.location.pathname.includes('/auth')) {
            toast.error('Session expired. Please log in again.');
            
            // Small delay to ensure toast is visible
            setTimeout(() => {
              window.location.href = '/auth';
            }, 100);
          }
        } else {
          // Network error or temporary issue - don't clear auth
          console.log('Temporary error during refresh, keeping auth state');
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other error statuses
    if (error.response) {
      const status = error.response.status;
      const url = originalRequest.url || '';

      switch (status) {
        case 403:
          toast.error('Access denied. You do not have permission.');
          break;
        case 409: // Conflict
          toast.error('Access denied. You do not have permission.');
          break;
        case 404:
          if (import.meta.env.DEV) {
            toast.error('Resource not found.');
          }
          break;
        case 422:
          // Validation errors
          const errors = error.response.data?.errors;
          if (errors) {
            Object.values(errors).flat().forEach(msg => toast.error(msg));
          } else {
            toast.error(error.response.data?.message || 'Validation error');
          }
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        case 503:
          toast.error('Service temporarily unavailable.');
          break;
        default:
          // Don't show generic errors for auth endpoints
          if (!url.includes('/auth/')) {
            toast.error(error.response.data?.message || 'An unexpected error occurred.');
          }
      }
    } else if (error.request) {
      // Network error - don't show toast on page load
      console.error('Network error:', error.message);
      
      // Only show network error toast if user is interacting (not on initial load)
      if (originalRequest.url && !originalRequest.url.includes('/auth/me')) {
        toast.error('Network error. Please check your connection.');
      }
    }

    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, 
        error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;