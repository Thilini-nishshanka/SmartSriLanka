// import { Booking, Prisma } from '@prisma/client';
// import { BaseRepository } from './baseRepository';

// export class BookingRepository extends BaseRepository<Booking> {
//   async findAll(page: number = 1, limit: number = 10) {
//     const skip = (page - 1) * limit;

//     const [bookings, total] = await Promise.all([
//       this.prisma.booking.findMany({
//         skip,
//         take: limit,
//         include: {
//           tour: {
//             select: {
//               id: true,
//               name: true,
//               mainImage: true,
//               category: true,
//               location: true,
//               duration: true,
//               price: true,
//             },
//           },
//           user: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//             },
//           },
//           payments: true,
//         },
//         orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.booking.count(),
//     ]);

//     return { bookings, total, page, limit };
//   }

//   async findByUserId(userId: string, page: number = 1, limit: number = 10) {
//     const skip = (page - 1) * limit;

//     const [bookings, total] = await Promise.all([
//       this.prisma.booking.findMany({
//         where: { userId },
//         skip,
//         take: limit,
//         include: {
//           tour: {
//             select: {
//               id: true,
//               name: true,
//               mainImage: true,
//               category: true,
//               location: true,
//               duration: true,
//               price: true,
//             },
//           },
//           payments: true,
//         },
//         orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.booking.count({ where: { userId } }),
//     ]);

//     return { bookings, total, page, limit };
//   }

//   async findById(id: bigint) {
//     return this.prisma.booking.findUnique({
//       where: { id },
//       include: {
//         tour: true,
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             phone: true,
//           },
//         },
//         payments: true,
//       },
//     });
//   }

//   async create(data: Prisma.BookingCreateInput) {
//     return this.prisma.booking.create({
//       data,
//       include: {
//         tour: true,
//       },
//     });
//   }

//   async update(id: bigint, data: Prisma.BookingUpdateInput) {
//     return this.prisma.booking.update({
//       where: { id },
//       data,
//       include: {
//         tour: true,
//         payments: true,
//       },
//     });
//   }

//   async cancel(id: bigint) {
//     return this.prisma.booking.update({
//       where: { id },
//       data: { status: 'cancelled' },
//     });
//   }

//   async countAll(): Promise<number> {
//     return this.prisma.booking.count();
//   }

//   async countByStatus(status: string): Promise<number> {
//     return this.prisma.booking.count({ where: { status: status as any } });
//   }

//   async getRecentBookings(limit: number = 10) {
//     return this.prisma.booking.findMany({
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//       include: {
//         tour: {
//           select: {
//             id: true,
//             name: true,
//             mainImage: true,
//           },
//         },
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//       },
//     });
//   }
// }




import { Prisma, Booking } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class BookingRepository extends BaseRepository<Booking> {
  constructor() {
    super();
  }

  async findByUserId(userId: string): Promise<
    (Booking & {
      tour: { name: string };
    })[]
  > {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        tour: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { bookingDate: 'desc' }, // Order by booking date for user display
    });
  }

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.prisma.booking.create({
      data,
    });
  }

  async update(id: bigint, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id },
      data,
    });
  }

  async findAllWithDetails(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.prisma.booking.findMany({
      skip,
      take: limit,
      include: {
        tour: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countAll(): Promise<number> {
    return this.prisma.booking.count();
  }

  // You can add other methods like findById if needed in the future
  // async findById(id: bigint) { ... }
}