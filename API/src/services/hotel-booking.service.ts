import { HotelBookingRepository } from '../repositories/hotel-booking.repository';
import { HotelRepository } from '../repositories/hotel.repository';
import { BigIntUtil } from '../utils/bigint.util';
import { CreateHotelBookingDTO, UpdateHotelBookingDTO, HotelBookingDTO } from '../types/dto/hotel-booking.dto';

export class HotelBookingService {
  private hotelBookingRepository: HotelBookingRepository;
  private hotelRepository: HotelRepository;

  constructor() {
    this.hotelBookingRepository = new HotelBookingRepository();
    this.hotelRepository = new HotelRepository();
  }

  async getAllBookings(page: number = 1, limit: number = 10) {
    const result = await this.hotelBookingRepository.findAll(page, limit);

    return {
      items: result.bookings.map((b) => this.mapBookingToDTO(b)),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getUserBookings(userId: string, page: number = 1, limit: number = 10) {
    const result = await this.hotelBookingRepository.findByUserId(userId, page, limit);

    return {
      items: result.bookings.map((b) => this.mapBookingToDTO(b)),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getBookingById(id: string): Promise<HotelBookingDTO> {
    const booking = await this.hotelBookingRepository.findById(BigIntUtil.toBigInt(id));

    if (!booking) {
      throw new Error('Hotel booking not found');
    }

    return this.mapBookingToDTO(booking);
  }

  async createBooking(userId: string, dto: CreateHotelBookingDTO): Promise<HotelBookingDTO> {
    const hotel = await this.hotelRepository.findById(BigIntUtil.toBigInt(dto.hotelId));

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const roomType = hotel.roomTypes?.find((rt: any) => Number(rt.id) === dto.roomTypeId);
    if (!roomType) {
      throw new Error('Room type not found');
    }

    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = Number(roomType.price) * dto.numberOfRooms * nights;

    const booking = await this.hotelBookingRepository.create({
      user: { connect: { id: userId } },
      hotel: { connect: { id: BigIntUtil.toBigInt(dto.hotelId) } },
      roomType: { connect: { id: BigIntUtil.toBigInt(dto.roomTypeId) } },
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfRooms: dto.numberOfRooms,
      numberOfGuests: dto.numberOfGuests,
      totalPrice,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      status: 'pending',
    });

    return this.mapBookingToDTO(booking);
  }

  async updateBooking(id: string, userId: string, dto: UpdateHotelBookingDTO): Promise<HotelBookingDTO> {
    const existingBooking = await this.hotelBookingRepository.findById(BigIntUtil.toBigInt(id));

    if (!existingBooking) {
      throw new Error('Hotel booking not found');
    }

    if (existingBooking.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updateData: any = {};
    if (dto.checkInDate) updateData.checkInDate = new Date(dto.checkInDate);
    if (dto.checkOutDate) updateData.checkOutDate = new Date(dto.checkOutDate);
    if (dto.numberOfRooms) updateData.numberOfRooms = dto.numberOfRooms;
    if (dto.numberOfGuests) updateData.numberOfGuests = dto.numberOfGuests;
    if (dto.contactName) updateData.contactName = dto.contactName;
    if (dto.contactEmail) updateData.contactEmail = dto.contactEmail;
    if (dto.contactPhone) updateData.contactPhone = dto.contactPhone;
    if (dto.status) updateData.status = dto.status;

    const booking = await this.hotelBookingRepository.update(BigIntUtil.toBigInt(id), updateData);
    return this.mapBookingToDTO(booking);
  }

  async cancelBooking(id: string, userId: string): Promise<void> {
    const existingBooking = await this.hotelBookingRepository.findById(BigIntUtil.toBigInt(id));

    if (!existingBooking) {
      throw new Error('Hotel booking not found');
    }

    if (existingBooking.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.hotelBookingRepository.cancel(BigIntUtil.toBigInt(id));
  }

  private mapBookingToDTO(booking: any): HotelBookingDTO {
    return {
      id: booking.id.toString(),
      hotelId: Number(booking.hotelId),
      hotelName: booking.hotel?.name || '',
      roomTypeId: Number(booking.roomTypeId),
      roomTypeName: booking.roomType?.name || '',
      userId: booking.userId,
      userName: booking.user?.name,
      userEmail: booking.contactEmail,
      userPhone: booking.contactPhone,
      checkInDate: booking.checkInDate.toISOString().split('T')[0],
      checkOutDate: booking.checkOutDate.toISOString().split('T')[0],
      numberOfRooms: booking.numberOfRooms,
      numberOfGuests: booking.numberOfGuests,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      bookingDate: booking.createdAt.toISOString().split('T')[0],
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
