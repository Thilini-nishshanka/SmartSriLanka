import { HotelReview, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class HotelReviewRepository extends BaseRepository<HotelReview> {
  async findByHotelId(hotelId: bigint, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.hotelReview.findMany({
        where: { hotelId, status: 'approved' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hotelReview.count({ where: { hotelId, status: 'approved' } }),
    ]);

    return { reviews, total, page, limit };
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    minRating?: number;
    status?: 'approved' | 'pending' | 'rejected';
  }) {
    const { page = 1, limit = 10, minRating, status } = options;
    const skip = (page - 1) * limit;
    const where: Prisma.HotelReviewWhereInput = {};

    if (status) {
      where.status = status;
    }
    if (minRating) {
      where.overallRating = { gte: minRating };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.hotelReview.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          hotel: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hotelReview.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }

  async findById(id: bigint) {
    return this.prisma.hotelReview.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.HotelReviewCreateInput) {
    return this.prisma.hotelReview.create({
      data,
    });
  }

  async update(id: bigint, data: Prisma.HotelReviewUpdateInput) {
    return this.prisma.hotelReview.update({
      where: { id },
      data,
    });
  }

  async delete(id: bigint) {
    return this.prisma.hotelReview.delete({
      where: { id },
    });
  }

  async checkUserReviewExists(userId: string, hotelId: bigint): Promise<boolean> {
    const count = await this.prisma.hotelReview.count({
      where: { userId, hotelId },
    });
    return count > 0;
  }
}