import axiosInstance from '@/lib/axios';
import { API_PATHS } from '@/lib/api-paths';
import type { Hotel } from '@/types';

interface HotelsListParams {
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  hotels: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface AvailabilityParams {
  checkIn: string;
  checkOut: string;
  roomType: string;
  guests: number;
}

interface AvailabilityResponse {
  available: boolean;
  price: number;
  roomsAvailable: number;
}

// This type represents the data needed to create a hotel, matching the backend DTO. It correctly
// omits server-generated fields from the top-level Hotel and the nested HotelRoomType.
type CreateHotelPayload = Omit<Hotel, 'id' | 'createdAt' | 'updatedAt' | 'roomTypes'> & {
  roomTypes?: (Omit<Hotel['roomTypes'][0], 'id' | 'hotelId'>)[];
};



export const hotelService = {
  // Get all hotels with filters
  async getHotels(params?: HotelsListParams): Promise<PaginatedResponse<Hotel>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Hotel>>>(
      API_PATHS.HOTELS.LIST,
      { params }
    );
    if (response.data && response.data.success) {
      return response.data.data as PaginatedResponse<Hotel>;
    }
    // Return an empty array on failure to prevent crashes
    return { hotels: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  // Get single hotel by ID
  async getHotelById(id: string): Promise<Hotel | undefined> {
    const response = await axiosInstance.get<ApiResponse<Hotel>>(
      API_PATHS.HOTELS.DETAIL(id)
    );
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return undefined;
  },

  // Check room availability
  async checkAvailability(
    hotelId: string,
    params: AvailabilityParams
  ): Promise<AvailabilityResponse> {
    const response = await axiosInstance.post<AvailabilityResponse>(
      API_PATHS.HOTELS.CHECK_AVAILABILITY(hotelId),
      params
    );
    return response.data;
  },

  // Create new hotel (Admin)
  async createHotel(hotelData: CreateHotelPayload): Promise<Hotel> {
    const response = await axiosInstance.post<ApiResponse<Hotel>>(
      API_PATHS.HOTELS.CREATE,
      hotelData
    );
    return response.data.data;
  },

  // Update hotel (Admin)
  async updateHotel(id: string, hotelData: Partial<CreateHotelPayload>): Promise<Hotel> {
    const response = await axiosInstance.put<ApiResponse<Hotel>>(
      API_PATHS.HOTELS.UPDATE(id),
      hotelData
    );
    return response.data.data;
  },

  // Delete hotel (Admin)
  async deleteHotel(id: string): Promise<void> {
    await axiosInstance.delete(API_PATHS.HOTELS.DELETE(id));
  },

  // Upload an image
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosInstance.post<{ data: { url: string } }>(
      API_PATHS.UPLOAD.IMAGE,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  },
};
