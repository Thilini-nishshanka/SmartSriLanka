import { Request, Response } from 'express';
import { HotelBookingService } from '../services/hotel-booking.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { CreateHotelBookingDTO, UpdateHotelBookingDTO } from '../types/dto/hotel-booking.dto';

export class HotelBookingController {
  private hotelBookingService: HotelBookingService;

  constructor() {
    this.hotelBookingService = new HotelBookingService();
  }

  getAllBookings = async (req: Request, res: Response) => {
    try {
      const page = req.query['page'] ? parseInt(req.query['page'] as string) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 10;

      const result = await this.hotelBookingService.getAllBookings(page, limit);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  getUserBookings = async (req: Request, res: Response) => {
    try {
      const page = req.query['page'] ? parseInt(req.query['page'] as string) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 10;

      const result = await this.hotelBookingService.getUserBookings(req.user!.id, page, limit);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  getBookingById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Booking ID is required');
      }
      const booking = await this.hotelBookingService.getBookingById(id);
      sendSuccess(res, booking);
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Hotel booking not found' ? 404 : 500);
    }
  };

  createBooking = async (req: Request, res: Response) => {
    try {
      const dto: CreateHotelBookingDTO = req.body;
      const booking = await this.hotelBookingService.createBooking(req.user!.id, dto);
      sendSuccess(res, booking, 'Hotel booking created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  updateBooking = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Booking ID is required');
      }
      const dto: UpdateHotelBookingDTO = req.body;
      const booking = await this.hotelBookingService.updateBooking(id, req.user!.id, dto);
      sendSuccess(res, booking, 'Hotel booking updated successfully');
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 500);
    }
  };

  cancelBooking = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Booking ID is required');
      }
      await this.hotelBookingService.cancelBooking(id, req.user!.id);
      sendSuccess(res, null, 'Hotel booking cancelled successfully');
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 500);
    }
  };
}