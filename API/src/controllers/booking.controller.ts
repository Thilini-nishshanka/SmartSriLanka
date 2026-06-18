// import { Request, Response } from 'express';
// import { BaseController } from './baseController';
// import { TourBookingRepository, TourRepository } from '../repositories';
// import { AppError } from '../middleware/errorHandler';
// import { CreateTourBookingDto, UpdateBookingDto } from '../types/dto';

// export class BookingController extends BaseController {
//   private bookingRepo: TourBookingRepository;
//   private tourRepo: TourRepository;

//   constructor() {
//     super();
//     this.bookingRepo = new TourBookingRepository();
//     this.tourRepo = new TourRepository();
//   }

//   getAll = this.asyncHandler(async (req: Request, res: Response) => {
//     if (!req.user) {
//       throw new AppError(401, 'Not authenticated');
//     }

//     const bookings = await this.bookingRepo.findByUserId(req.user.id);
//     this.sendSuccess(res, bookings, 'Bookings retrieved successfully');
//   });

//   getById = this.asyncHandler(async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const booking = await this.bookingRepo.findByIdWithDetails(BigInt(id));

//     if (!booking) {
//       throw new AppError(404, 'Booking not found');
//     }

//     // Check authorization
//     if (req.user?.id !== booking.userId && !req.user?.roles.includes('admin')) {
//       throw new AppError(403, 'Not authorized to view this booking');
//     }

//     this.sendSuccess(res, booking, 'Booking retrieved successfully');
//   });

//   create = this.asyncHandler(async (req: Request, res: Response) => {
//     if (!req.user) {
//       throw new AppError(401, 'Not authenticated');
//     }

//     const data: CreateTourBookingDto = req.body;

//     // Verify tour exists
//     const tour = await this.tourRepo.findById(BigInt(data.tourId));
//     if (!tour) {
//       throw new AppError(404, 'Tour not found');
//     }

//     // Calculate total price
//     const totalPrice = Number(tour.price) * data.numberOfPeople;

//     const booking = await this.bookingRepo.create({
//       userId: req.user.id,
//       tourId: BigInt(data.tourId),
//       bookingDate: new Date(data.bookingDate),
//       numberOfPeople: data.numberOfPeople,
//       totalPrice,
//       specialRequests: data.specialRequests,
//       contactName: data.contactName,
//       contactEmail: data.contactEmail,
//       contactPhone: data.contactPhone,
//       status: 'pending',
//     });

//     this.sendSuccess(res, booking, 'Booking created successfully', 201);
//   });

//   update = this.asyncHandler(async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const data: UpdateBookingDto = req.body;

//     const booking = await this.bookingRepo.findById(BigInt(id));
//     if (!booking) {
//       throw new AppError(404, 'Booking not found');
//     }

//     // Check authorization
//     if (req.user?.id !== booking.userId && !req.user?.roles.includes('admin')) {
//       throw new AppError(403, 'Not authorized to update this booking');
//     }

//     const updatedBooking = await this.bookingRepo.update(BigInt(id), data);

//     this.sendSuccess(res, updatedBooking, 'Booking updated successfully');
//   });

//   cancel = this.asyncHandler(async (req: Request, res: Response) => {
//     const { id } = req.params;

//     const booking = await this.bookingRepo.findById(BigInt(id));
//     if (!booking) {
//       throw new AppError(404, 'Booking not found');
//     }

//     // Check authorization
//     if (req.user?.id !== booking.userId && !req.user?.roles.includes('admin')) {
//       throw new AppError(403, 'Not authorized to cancel this booking');
//     }

//     const updatedBooking = await this.bookingRepo.update(BigInt(id), {
//       status: 'cancelled',
//     });

//     this.sendSuccess(res, updatedBooking, 'Booking cancelled successfully');
//   });
// }


// import { Request, Response } from 'express';
// import { BookingService } from '../services/booking.service';
// import { sendSuccess, sendError } from '../utils/response.util';
// import { CreateBookingDTO, UpdateBookingDTO } from '../dtos/booking.dto';

// export class BookingController {
//   private bookingService: BookingService;

//   constructor() {
//     this.bookingService = new BookingService();
//   }

//   getAllBookings = async (req: Request, res: Response) => {
//     try {
//       const page = req.query.page ? parseInt(req.query.page as string) : 1;
//       const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

//       const result = await this.bookingService.getAllBookings(page, limit);
//       sendSuccess(res, result);
//     } catch (error: any) {
//       sendError(res, error.message, 500);
//     }
//   };

//   getUserBookings = async (req: Request, res: Response) => {
//     try {
//       const page = req.query.page ? parseInt(req.query.page as string) : 1;
//       const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

//       const result = await this.bookingService.getUserBookings(req.user!.id, page, limit);
//       sendSuccess(res, result);
//     } catch (error: any) {
//       sendError(res, error.message, 500);
//     }
//   };

//   getBookingById = async (req: Request, res: Response) => {
//     try {
//       const { id } = req.params;
//       const booking = await this.bookingService.getBookingById(id);
//       sendSuccess(res, booking);
//     } catch (error: any) {
//       sendError(res, error.message, error.message === 'Booking not found' ? 404 : 500);
//     }
//   };

//   createBooking = async (req: Request, res: Response) => {
//     try {
//       const dto: CreateBookingDTO = req.body;
//       const booking = await this.bookingService.createBooking(req.user!.id, dto);
//       sendSuccess(res, booking, 'Booking created successfully', 201);
//     } catch (error: any) {
//       sendError(res, error.message, 500);
//     }
//   };

//   updateBooking = async (req: Request, res: Response) => {
//     try {
//       const { id } = req.params;
//       const dto: UpdateBookingDTO = req.body;
//       const booking = await this.bookingService.updateBooking(id, req.user!.id, dto);
//       sendSuccess(res, booking, 'Booking updated successfully');
//     } catch (error: any) {
//       sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 500);
//     }
//   };

//   cancelBooking = async (req: Request, res: Response) => {
//     try {
//       const { id } = req.params;
//       await this.bookingService.cancelBooking(id, req.user!.id);
//       sendSuccess(res, null, 'Booking cancelled successfully');
//     } catch (error: any) {
//       sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 500);
//     }
//   };
// }



import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { sendSuccess } from '../utils/response.util';
import { handleAppError } from '../utils/error.util';
import { CreateBookingDTO, UpdateBookingDTO } from '../types/dto/booking.dto';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  getAllBookings = async (req: Request, res: Response) => {
    try {
      const page = req.query['page'] ? parseInt(req.query['page'] as string) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 10;

      const result = await this.bookingService.getAllBookings(page, limit);
      sendSuccess(res, result);
    } catch (error: any) {
      handleAppError(res, error);
    }
  };

  getUserBookings = async (req: Request, res: Response) => {
    try {
      const page = req.query['page'] ? parseInt(req.query['page'] as string) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 10;

      const result = await this.bookingService.getUserBookings(req.user!.id!, page, limit);
      sendSuccess(res, result);
    } catch (error: any) {
      handleAppError(res, error);
    }
  };

  getBookingById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Booking ID is required');
      }
      const booking = await this.bookingService.getBookingById(id);
      sendSuccess(res, booking);
    } catch (error: any) {
      handleAppError(res, error);
    }
  };

  createBooking = async (req: Request, res: Response) => {
    try {
      const dto: CreateBookingDTO = req.body;
      const booking = await this.bookingService.createBooking(req.user!.id!, dto);
      sendSuccess(res, booking, 'Booking created successfully', 201);
    } catch (error: any) {
      handleAppError(res, error);
    }
  };

  updateBooking = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Booking ID is required');
      }
      const dto: UpdateBookingDTO = req.body;
      const booking = await this.bookingService.updateBooking(id, req.user!.id!, dto);
      sendSuccess(res, booking, 'Booking updated successfully');
    } catch (error: any) {
      handleAppError(res, error);
    }
  };

  cancelBooking = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Booking ID is required');
      }
      await this.bookingService.cancelBooking(id, req.user!.id!);
      sendSuccess(res, null, 'Booking cancelled successfully');
    } catch (error: any) {
      handleAppError(res, error);
    }
  };
}