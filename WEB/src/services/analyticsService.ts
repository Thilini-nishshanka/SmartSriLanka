import axiosInstance from '@/lib/axios';
import { API_PATHS } from '@/lib/api-paths';

interface DashboardSummary {
  totalBookings: number;
  activeTours: number;
  totalReviews: number;
  totalRevenue: number;
  recentBookings: { id: number; serviceName: string; amount: number }[];
  recentReviews: { id: number; userName: string; rating: number; comment: string }[];
}



interface IncomeData {
  date: string;
  amount: number;
  bookings: number;
}

interface BookingAnalytics {
  tourBookings: number;
  hotelBookings: number;
  totalBookings: number;
  byStatus: Record<string, number>;
}

interface IncomeSummary {
  todayIncome: number;
  monthlyIncome: number;
  yearlyIncome: number;
  monthlyGrowth: number;
  monthlyBreakdown: { month: string; income: number }[];
  topTours: { name: string; revenue: number }[];
}

export const analyticsService = {
  // Get all data for the income analytics page
  async getIncomeSummary(): Promise<IncomeSummary> {
    const response = await axiosInstance.get<{ data: IncomeSummary }>(
      API_PATHS.ANALYTICS.INCOME_SUMMARY
    );
    return response.data.data;
  },

  // Get dashboard statistics
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await axiosInstance.get<{ data: DashboardSummary }>(
      API_PATHS.ANALYTICS.DASHBOARD_SUMMARY
    );
    return response.data.data;
  },

  // Get income analytics
  async getIncomeAnalytics(params?: { 
    startDate?: string; 
    endDate?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<IncomeData[]> {
    const response = await axiosInstance.get<{ data: IncomeData[] }>(
      API_PATHS.ANALYTICS.INCOME,
      { params }
    );
    return response.data.data;
  },

  // Get booking analytics
  async getBookingAnalytics(params?: { 
    startDate?: string; 
    endDate?: string;
  }): Promise<{ data: BookingAnalytics }> {
    const response = await axiosInstance.get<{ data: BookingAnalytics }>(
      API_PATHS.ANALYTICS.BOOKINGS,
      { params }
    );
    return response.data;
  },
};
