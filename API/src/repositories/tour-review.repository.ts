import { TourReview, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class TourReviewRepository extends BaseRepository<TourReview> {
  async findByTourId(tourId: bigint, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.tourReview.findMany({
        where: { tourId, status: 'approved' },
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
      this.prisma.tourReview.count({ where: { tourId, status: 'approved' } }),
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
    const where: Prisma.TourReviewWhereInput = {};

    if (status) {
      where.status = status;
    }
    if (minRating) {
      where.rating = { gte: minRating };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.tourReview.findMany({
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
          tour: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tourReview.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }

  async findById(id: bigint) {
    return this.prisma.tourReview.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        tour: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.TourReviewCreateInput) {
    return this.prisma.tourReview.create({
      data,
    });
  }

  async update(id: bigint, data: Prisma.TourReviewUpdateInput) {
    return this.prisma.tourReview.update({
      where: { id },
      data,
    });
  }

  async delete(id: bigint) {
    return this.prisma.tourReview.delete({
      where: { id },
    });
  }

  async checkUserReviewExists(userId: string, tourId: bigint): Promise<boolean> {
    const count = await this.prisma.tourReview.count({
      where: { userId, tourId },
    });
    return count > 0;
  }
}