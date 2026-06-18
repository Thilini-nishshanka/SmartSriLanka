import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  getUserBookings = async (req: Request, res: Response) => {
    try {
      const bookings = await this.bookingService.getUserBookings(req.user!.id);
      sendSuccess(res, bookings);
    } catch (error: any) {
      sendError(res, error.message);
    }
  };

  getAllBookings = async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const bookings = await this.bookingService.getAllBookings(page, limit);
      sendSuccess(res, bookings);
    } catch (error: any) {
      sendError(res, error.message);
    }
  };

  updateBooking = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return sendError(res, 'Invalid status provided', 400);
      }

      const updatedBooking = await this.bookingService.updateBookingStatus(id, status);
      sendSuccess(res, updatedBooking);
    } catch (error: any) {
      sendError(res, error.message);
    }
  };

}