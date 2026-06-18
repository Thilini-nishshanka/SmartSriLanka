import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../utils/response.util';
import { HotelBookingRepository } from '../repositories/hotel-booking.repository';
import { TourBookingRepository } from '../repositories/tour-booking.repository';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  private hotelBookingRepository: HotelBookingRepository;
  private tourBookingRepository: TourBookingRepository;
  private analyticsService: AnalyticsService;

  constructor() {
    this.hotelBookingRepository = new HotelBookingRepository();
    this.tourBookingRepository = new TourBookingRepository();
    this.analyticsService = new AnalyticsService();
  }

  getDashboardSummary = async (_req: Request, res: Response) => {
    try {
      const summary = await this.analyticsService.getDashboardSummary();
      sendSuccess(res, summary);
    } catch (error: any) {
      console.error('Error fetching dashboard summary:', error);
      sendError(res, 'Failed to fetch dashboard summary', 500);
    }
  };

  getIncomeSummary = async (_req: Request, res: Response) => {
    try {
      const summary = await this.analyticsService.getIncomeSummary();
      sendSuccess(res, summary);
    } catch (error: any) {
      throw new Error('Failed to fetch income summary');
    }
  };

  getRevenueStats = async (_req: Request, res: Response) => {
    try {
      const hotelRevenue = await this.hotelBookingRepository.getTotalRevenue();
      const tourRevenue = await this.tourBookingRepository.getTotalRevenue();

      const stats = {
        totalRevenue: hotelRevenue + tourRevenue,
        hotelRevenue,
        tourRevenue,
      };

      sendSuccess(res, stats);
    } catch (error: any) {
      throw new Error('Failed to fetch revenue stats');
    }
  };

  getBookingStats = async (_req: Request, res: Response) => {
    try {
      const hotelStats = await this.hotelBookingRepository.getBookingStats();
      const tourStats = await this.tourBookingRepository.getBookingStats();

      const stats = {
        hotels: hotelStats,
        tours: tourStats,
      };

      sendSuccess(res, stats);
    } catch (error: any) {
      throw new Error('Failed to fetch booking stats');
    }
  };

  getTopHotels = async (_req: Request, res: Response) => {
    try {
      const hotels = await this.hotelBookingRepository.getTopBookedHotels(10);
      sendSuccess(res, hotels);
    } catch (error: any) {
      throw new Error('Failed to fetch top hotels');
    }
  };

  getTopTours = async (_req: Request, res: Response) => {
    try {
      const tours = await this.tourBookingRepository.getTopBookedTours(10);
      sendSuccess(res, tours);
    } catch (error: any) {
      throw new Error('Failed to fetch top tours');
    }
  };
}