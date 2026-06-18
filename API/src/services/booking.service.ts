// import { BookingRepository } from '../repositories/booking.repository';
// import { TourRepository } from '../repositories/tour.repository';
// import { BigIntUtil } from '../utils/bigint.util';
// import { CreateBookingDTO, UpdateBookingDTO, BookingDTO } from '../types/dto/booking.dto';

// export class BookingService {
//   private bookingRepository: BookingRepository;
//   private tourRepository: TourRepository;

//   constructor() {
//     this.bookingRepository = new BookingRepository();
//     this.tourRepository = new TourRepository();
//   }

//   async getAllBookings(page: number = 1, limit: number = 10) {
//     const result = await this.bookingRepository.findAll(page, limit);

//     return {
//       items: result.bookings.map((b) => this.mapBookingToDTO(b)),
//       pagination: {
//         total: result.total,
//         page: result.page,
//         limit: result.limit,
//         totalPages: Math.ceil(result.total / result.limit),
//       },
//     };
//   }

//   async getUserBookings(userId: string, page: number = 1, limit: number = 10) {
//     const result = await this.bookingRepository.findByUserId(userId, page, limit);

//     return {
//       items: result.bookings.map((b) => this.mapBookingToDTO(b)),
//       pagination: {
//         total: result.total,
//         page: result.page,
//         limit: result.limit,
//         totalPages: Math.ceil(result.total / result.limit),
//       },
//     };
//   }

//   async getBookingById(id: string): Promise<BookingDTO> {
//     const booking = await this.bookingRepository.findById(BigIntUtil.toBigInt(id));

//     if (!booking) {
//       throw new Error('Booking not found');
//     }

//     return this.mapBookingToDTO(booking);
//   }

//   async createBooking(userId: string, dto: CreateBookingDTO): Promise<BookingDTO> {
//     const tour = await this.tourRepository.findById(BigIntUtil.toBigInt(dto.tourId));

//     if (!tour) {
//       throw new Error('Tour not found');
//     }

//     const totalPrice = Number(tour.price) * dto.guests;

//     const booking = await this.bookingRepository.create({
//       user: { connect: { id: userId } },
//       tour: { connect: { id: BigIntUtil.toBigInt(dto.tourId) } },
//       bookingDate: new Date(dto.date),
//       numberOfPeople: dto.guests,
//       totalPrice,
//       contactName: dto.name,
//       contactEmail: dto.email,
//       contactPhone: dto.phone,
//       status: 'pending',
//     });

//     return this.mapBookingToDTO(booking);
//   }

//   async updateBooking(id: string, userId: string, dto: UpdateBookingDTO): Promise<BookingDTO> {
//     const existingBooking = await this.bookingRepository.findById(BigIntUtil.toBigInt(id));

//     if (!existingBooking) {
//       throw new Error('Booking not found');
//     }

//     if (existingBooking.userId !== userId) {
//       throw new Error('Unauthorized');
//     }

//     const updateData: any = {};
//     if (dto.date) updateData.bookingDate = new Date(dto.date);
//     if (dto.guests) updateData.numberOfPeople = dto.guests;
//     if (dto.name) updateData.contactName = dto.name;
//     if (dto.email) updateData.contactEmail = dto.email;
//     if (dto.phone) updateData.contactPhone = dto.phone;
//     if (dto.status) updateData.status = dto.status;

//     const booking = await this.bookingRepository.update(BigIntUtil.toBigInt(id), updateData);
//     return this.mapBookingToDTO(booking);
//   }

//   async cancelBooking(id: string, userId: string): Promise<void> {
//     const existingBooking = await this.bookingRepository.findById(BigIntUtil.toBigInt(id));

//     if (!existingBooking) {
//       throw new Error('Booking not found');
//     }

//     if (existingBooking.userId !== userId) {
//       throw new Error('Unauthorized');
//     }

//     await this.bookingRepository.cancel(BigIntUtil.toBigInt(id));
//   }

//   private mapBookingToDTO(booking: any): BookingDTO {
//     if (!booking.tour) {
//       throw new Error('Booking has no tour data');
//     }

//     return {
//       id: booking.id.toString(),
//       name: booking.contactName,
//       email: booking.contactEmail,
//       phone: booking.contactPhone,
//       tour: booking.tour.name,
//       tourId: Number(booking.tour.id),
//       tourName: booking.tour.name,
//       userName: booking.user?.name || '',
//       guests: booking.numberOfPeople,
//       date: booking.bookingDate.toISOString().split('T')[0],
//       totalPrice: Number(booking.totalPrice),
//       status: booking.status,
//       amount: booking.totalPrice.toString(),
//       bookingDate: booking.createdAt.toISOString().split('T')[0],
//       createdAt: booking.createdAt,
//       updatedAt: booking.updatedAt,
//     };
//   }
// }


import { BookingRepository } from '../repositories/booking.repository';
import { BigIntUtil } from '../utils/bigint.util';

export class BookingService { // Renamed from BookingService to avoid conflict if another BookingService exists
  private bookingRepository: BookingRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async getUserBookings(userId: string) {
    const bookings = await this.bookingRepository.findByUserId(userId);
    // Map to a DTO (Data Transfer Object) to shape the response for the frontend
    return bookings.map(booking => ({
      id: BigIntUtil.toBigInt(booking.id).toString(), // Ensure ID is string for frontend
      tour: booking.tour.name,
      date: booking.bookingDate.toISOString().split('T')[0],
      guests: booking.numberOfPeople,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      bookingDate: booking.createdAt.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));
  }

  async getAllBookings(page: number = 1, limit: number = 10) {
    const bookings = await this.bookingRepository.findAllWithDetails(page, limit);

    const items = bookings.map(booking => ({
      id: BigIntUtil.toBigInt(booking.id).toString(),
      name: booking.contactName,
      email: booking.contactEmail,
      phone: booking.contactPhone,
      tour: booking.tour.name,
      tourId: BigIntUtil.toBigInt(booking.tour.id).toString(),
      userName: booking.user.name,
      guests: booking.numberOfPeople,
      date: booking.bookingDate.toISOString().split('T')[0],
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      amount: booking.totalPrice.toString(),
      bookingDate: booking.createdAt.toISOString().split('T')[0],
    }));

    const total = await this.bookingRepository.countAll();

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
    const booking = await this.bookingRepository.update(BigIntUtil.toBigInt(id), { status });
    return { id: booking.id.toString(), status: booking.status };
  }
}