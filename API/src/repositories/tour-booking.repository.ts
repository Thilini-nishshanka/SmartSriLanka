import { Booking, BookingStatus, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class TourBookingRepository extends BaseRepository<Booking> {
  constructor() {
    super();
  }

  async findById(id: bigint) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        tour: true,
      },
    });
  }

  async create(data: Prisma.BookingCreateInput) {
    return this.prisma.booking.create({
      data,
      include: {
        user: true,
        tour: true,
      },
    });
  }

  async update(id: bigint, data: Prisma.BookingUpdateInput) {
    return this.prisma.booking.update({
      where: { id },
      data,
      include: {
        user: true,
        tour: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        tour: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.booking.aggregate({
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
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'completed' } }),
      this.prisma.booking.count({ where: { status: 'cancelled' } }),
      this.prisma.booking.count({ where: { status: 'pending' } }),
    ]);

    return {
      total,
      completed,
      cancelled,
      pending,
    };
  }

  async getTopBookedTours(limit: number = 10) {
    const tours = await this.prisma.tour.findMany({
      take: limit,
      select: {
        id: true,
        name: true,
        location: true,
        price: true,
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

    return tours.map(tour => ({
      id: Number(tour.id),
      name: tour.name,
      location: tour.location,
      price: Number(tour.price),
      totalBookings: tour._count.bookings,
    }));
  }
}