// import axiosInstance from '@/lib/axios';
// import { API_PATHS } from '@/lib/api-paths';
// import type { Booking, UserBooking, HotelBooking } from '@/types';

// interface CreateBookingData {
//   tourId: string;
//   date: string;
//   guests: number;
//   contactName: string;
//   contactEmail: string;
//   contactPhone: string;
//   specialRequests?: string;
//   paymentIntentId?: string;
// }

// interface CreateHotelBookingData {
//   hotelId: string;
//   checkIn: string;
//   checkOut: string;
//   roomType: string;
//   guests: number;
//   contactName: string;
//   contactEmail: string;
//   contactPhone: string;
//   specialRequests?: string;
//   paymentIntentId?: string;
// }

// export const bookingService = {
//   // Tour Bookings
//   async getTourBookings(): Promise<Booking[]> {
//     const response = await axiosInstance.get<{ bookings: Booking[] }>(
//       API_PATHS.BOOKINGS.LIST
//     );
//     return response.data.bookings;
//   },

//   async getUserTourBookings(): Promise<UserBooking[]> {
//     const response = await axiosInstance.get<{ bookings: UserBooking[] }>(
//       API_PATHS.BOOKINGS.USER_BOOKINGS
//     );
//     return response.data.bookings;
//   },

//   async getTourBookingById(id: string): Promise<Booking> {
//     const response = await axiosInstance.get<Booking>(
//       API_PATHS.BOOKINGS.DETAIL(id)
//     );
//     return response.data;
//   },

//   async createTourBooking(bookingData: CreateBookingData): Promise<Booking> {
//     const response = await axiosInstance.post<Booking>(
//       API_PATHS.BOOKINGS.CREATE,
//       bookingData
//     );
//     return response.data;
//   },

//   async updateTourBooking(id: string, data: Partial<Booking>): Promise<Booking> {
//     const response = await axiosInstance.put<Booking>(
//       API_PATHS.BOOKINGS.UPDATE(id),
//       data
//     );
//     return response.data;
//   },

//   async cancelTourBooking(id: string): Promise<void> {
//     await axiosInstance.post(API_PATHS.BOOKINGS.CANCEL(id));
//   },

//   // Hotel Bookings
//   async getHotelBookings(): Promise<HotelBooking[]> {
//     const response = await axiosInstance.get<{ bookings: HotelBooking[] }>(
//       API_PATHS.HOTEL_BOOKINGS.LIST
//     );
//     return response.data.bookings;
//   },

//   async getUserHotelBookings(): Promise<HotelBooking[]> {
//     const response = await axiosInstance.get<{ bookings: HotelBooking[] }>(
//       API_PATHS.HOTEL_BOOKINGS.USER_BOOKINGS
//     );
//     return response.data.bookings;
//   },

//   async getHotelBookingById(id: string): Promise<HotelBooking> {
//     const response = await axiosInstance.get<HotelBooking>(
//       API_PATHS.HOTEL_BOOKINGS.DETAIL(id)
//     );
//     return response.data;
//   },

//   async createHotelBooking(bookingData: CreateHotelBookingData): Promise<HotelBooking> {
//     const response = await axiosInstance.post<HotelBooking>(
//       API_PATHS.HOTEL_BOOKINGS.CREATE,
//       bookingData
//     );
//     return response.data;
//   },

//   async updateHotelBooking(id: string, data: Partial<HotelBooking>): Promise<HotelBooking> {
//     const response = await axiosInstance.put<HotelBooking>(
//       API_PATHS.HOTEL_BOOKINGS.UPDATE(id),
//       data
//     );
//     return response.data;
//   },

//   async cancelHotelBooking(id: string): Promise<void> {
//     await axiosInstance.post(API_PATHS.HOTEL_BOOKINGS.CANCEL(id));
//   },
// };



import axiosInstance from '@/lib/axios';
import { API_PATHS } from '@/lib/api-paths';
import type { UserBooking } from '@/types'; // Ensure UserBooking type is correctly imported

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const bookingService = {
  async getUserBookings(): Promise<UserBooking[]> {
    const response = await axiosInstance.get<ApiResponse<UserBooking[]>>(
      API_PATHS.BOOKINGS.USER_BOOKINGS // Use the new API path
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch bookings');
    }
    return response.data.data;
  },

  // Admin: Get all tour bookings
  async getTourBookings(): Promise<any[]> {
    const response = await axiosInstance.get<ApiResponse<{ items: any[] }>>(API_PATHS.BOOKINGS.LIST);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch tour bookings');
    }
    return response.data.data.items;
  },

  // Admin: Get all hotel bookings (assuming a similar structure)
  async getHotelBookings(): Promise<any[]> {
    // This assumes you have an endpoint for hotel bookings. If not, this can be removed.
    // For now, we'll return an empty array to prevent errors.
    // const response = await axiosInstance.get<ApiResponse<{ items: any[] }>>(API_PATHS.HOTEL_BOOKINGS.LIST);
    // if (!response.data.success) {
    //   throw new Error(response.data.message || 'Failed to fetch hotel bookings');
    // }
    // return response.data.data.items;
    return Promise.resolve([]); // Returning empty array as hotel bookings are not fully implemented
  },

  // Admin: Update tour booking status
  async updateTourBooking(id: string, data: { status: string }): Promise<any> {
    const response = await axiosInstance.put<ApiResponse<any>>(API_PATHS.BOOKINGS.UPDATE(id), data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update tour booking');
    }
    return response.data.data;
  },

  async createBookingAndPaymentIntent(data: {
    tourId: string;
    date: string;
    guests: number;
    name: string;
    email: string;
    phone: string;
  }): Promise<{ clientSecret: string; bookingId: string }> {
    // This endpoint now creates the booking and the payment intent in one go.
    const response = await axiosInstance.post<ApiResponse<{ clientSecret: string; bookingId: string }>>(API_PATHS.PAYMENTS.CREATE_INTENT, data);
    
    const responseData = response.data; // The payload is always in response.data

    if (responseData?.success) {
      return responseData.data;
    } else {
      throw new Error(responseData?.message || 'Failed to create payment intent');
    }
  },
};