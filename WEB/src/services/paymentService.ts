import axiosInstance from '@/lib/axios';
import { API_PATHS } from '@/lib/api-paths';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface CreatePaymentIntentData {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface PaymentIntentResponse {
  clientSecret: string;
  bookingId: string;
}

interface ConfirmPaymentData {
  paymentIntentId: string;
}

interface PaymentConfirmationResponse {
  success: boolean;
  paymentIntentId: string;
  status: string;
}

export const paymentService = {
  // Create payment intent
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntentResponse> {
    const response = await axiosInstance.post<ApiResponse<PaymentIntentResponse>>(
      API_PATHS.PAYMENTS.CREATE_INTENT,
      {
        ...data,
        currency: data.currency || 'usd',
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create payment intent');
    }
    return response.data.data;
  },

  // Confirm payment
  async confirmPayment(data: ConfirmPaymentData): Promise<PaymentConfirmationResponse> {
    const response = await axiosInstance.post<ApiResponse<PaymentConfirmationResponse>>(
      API_PATHS.PAYMENTS.CONFIRM,
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to confirm payment');
    }
    // The API returns { success: true, data: { success: true, ... } }
    return response.data.data;
  },

  // Request refund (Admin)
  async requestRefund(paymentIntentId: string): Promise<void> {
    await axiosInstance.post(API_PATHS.PAYMENTS.REFUND(paymentIntentId));
  },
};
