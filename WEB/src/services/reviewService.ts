import axiosInstance from '@/lib/axios';
import { API_PATHS } from '@/lib/api-paths';
import type { Review, HotelReview } from '@/types';

// Assuming backend ListResponseDTO structure
interface ListResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface CreateReviewData {
  tourId?: string | number;
  hotelId?: string | number;
  rating?: number;
  overallRating?: number;
  locationRating?: number;
  cleanlinessRating?: number;
  serviceRating?: number;
  valueRating?: number;
  comment: string;
}

export const reviewService = {
  async getAllReviews(options: { 
    page?: number;
    limit?: number;
    minRating?: number;
    status?: 'pending' | 'approved' | 'rejected';
  } = {}): Promise<ListResponse<Review | HotelReview>> {
    try {
      const { page = 1, limit = 100 } = options;
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (options.minRating !== undefined) {
        params.append('minRating', options.minRating.toString());
      }
      if (options.status !== undefined) {
        params.append('status', options.status);
      }

      const response = await axiosInstance.get<ApiResponse<ListResponse<Review | HotelReview>>>(
        `${API_PATHS.REVIEWS.LIST}?${params.toString()}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch reviews');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch all reviews:', error);
      
      // Handle 401 errors by redirecting to login
      if (error?.response?.status === 401) {
        window.location.href = '/login';
      }
      
      throw new Error(error?.response?.data?.message || 'Failed to load reviews');
    }
  },
  

  async getTourReviews(tourId: string | number, page: number = 1, limit: number = 10): Promise<ListResponse<Review>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const url = `${API_PATHS.REVIEWS.TOUR_REVIEWS(tourId)}?${params.toString()}`;

      const response = await axiosInstance.get<ApiResponse<ListResponse<Review>>>(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch tour reviews');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch tour reviews:', error);
      throw new Error('Failed to load tour reviews');
    }
  },

  async getHotelReviews(hotelId: string | number, page: number = 1, limit: number = 10): Promise<ListResponse<HotelReview>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const url = `${API_PATHS.REVIEWS.HOTEL_REVIEWS(hotelId)}?${params.toString()}`;

      const response = await axiosInstance.get<ApiResponse<ListResponse<HotelReview>>>(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch hotel reviews');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch hotel reviews:', error);
      throw new Error('Failed to load hotel reviews');
    }
  },

  async createReview(reviewData: CreateReviewData): Promise<Review | HotelReview> {
    try {
      const response = await axiosInstance.post<ApiResponse<Review | HotelReview>>(
        API_PATHS.REVIEWS.CREATE,
        reviewData
      );
      
      if (!response.data.success) {
        // This handles cases where the server returns 200 OK but indicates failure in the body.
        throw new Error(response.data.message || 'Failed to create review');
      }
      
      return response.data.data;
    } catch (error: any) {
      // Standardize the error format to be thrown, so UI components can reliably access the message.
      if (error.response) {
        // Re-throw with a consistent error structure.
        // The backend sends the message in `error.response.data.error`.
        throw { response: { ...error.response, data: { message: error.response.data.error || 'An unknown error occurred' } } };
      }
      throw error;
    }
  },

  async updateReview(id: string | number, data: Partial<Review | HotelReview>) {
    const response = await axiosInstance.put<ApiResponse<Review | HotelReview>>(
      API_PATHS.REVIEWS.UPDATE(id),
      data
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update review');
    }
    
    return response.data.data;
  },

  async deleteReview(id: string | number): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      API_PATHS.REVIEWS.DELETE(id)
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete review');
    }
  },
};
