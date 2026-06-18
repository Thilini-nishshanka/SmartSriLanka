import { HotelBooking, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class HotelBookingRepository extends BaseRepository<HotelBooking> {
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.hotelBooking.findMany({
        skip,
        take: limit,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              mainImage: true,
              city: true,
              location: true,
            },
          },
          roomType: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hotelBooking.count(),
    ]);

    return { bookings, total, page, limit };
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.hotelBooking.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              mainImage: true,
              city: true,
              location: true,
            },
          },
          roomType: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hotelBooking.count({ where: { userId } }),
    ]);

    return { bookings, total, page, limit };
  }

  async findById(id: bigint) {
    return this.prisma.hotelBooking.findUnique({
      where: { id },
      include: {
        hotel: true,
        roomType: {
          include: {
            features: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: true,
      },
    });
  }

  async create(data: Prisma.HotelBookingCreateInput) {
    return this.prisma.hotelBooking.create({
      data,
      include: {
        hotel: true,
        roomType: true,
      },
    });
  }

  async update(id: bigint, data: Prisma.HotelBookingUpdateInput) {
    return this.prisma.hotelBooking.update({
      where: { id },
      data,
      include: {
        hotel: true,
        roomType: true,
        payments: true,
      },
    });
  }

  async cancel(id: bigint) {
    return this.prisma.hotelBooking.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.hotelBooking.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: 'completed',
      },
    });

    return Number(result._sum.totalPrice || 0);
  }

  async getBookingStats() {
    const [total, completed, cancelled, pending] = await Promise.all([
      this.prisma.hotelBooking.count(),
      this.prisma.hotelBooking.count({ where: { status: 'completed' } }),
      this.prisma.hotelBooking.count({ where: { status: 'cancelled' } }),
      this.prisma.hotelBooking.count({ where: { status: 'pending' } }),
    ]);

    return {
      total,
      completed,
      cancelled,
      pending,
    };
  }

  async getTopBookedHotels(limit: number = 10) {
    const hotels = await this.prisma.hotel.findMany({
      take: limit,
      select: {
        id: true,
        name: true,
        city: true,
        mainImage: true,
        _count: {
          select: {
            bookings: {
              where: {
                status: 'completed',
              },
            },
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
    });

    return hotels.map(hotel => ({
      id: Number(hotel.id),
      name: hotel.name,
      city: hotel.city,
      mainImage: hotel.mainImage,
      totalBookings: hotel._count.bookings,
    }));
  }
}
