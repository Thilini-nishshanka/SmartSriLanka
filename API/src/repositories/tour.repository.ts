import { Tour, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class TourRepository extends BaseRepository<Tour> {
  async findAll(query: {
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const { category, location, minPrice, maxPrice, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.TourWhereInput = { isActive: true };

    if (category) where.category = category;
    if (location) where.location = { contains: location };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [tours, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        skip,
        take: limit,
        include: {
          // Explicitly include the mainImage field to ensure it's always returned
          // This is a good practice even if it's a scalar field.
          // In this case, we need to ensure the DTO mapping has access to it.
          images: { orderBy: { displayOrder: 'asc' } },
          highlights: { orderBy: { displayOrder: 'asc' } },
          inclusions: { orderBy: { displayOrder: 'asc' } },
          itineraryDays: {
            orderBy: { dayNumber: 'asc' },
            include: { stops: { orderBy: { stopOrder: 'asc' } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tour.count({ where }),
    ]);

    return { tours, total, page, limit };
  }

  async findById(id: bigint) {
    return this.prisma.tour.findFirst({
      where: { id, isActive: true },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        highlights: { orderBy: { displayOrder: 'asc' } },
        inclusions: { orderBy: { displayOrder: 'asc' } },
        itineraryDays: {
          orderBy: { dayNumber: 'asc' },
          include: {
            stops: { orderBy: { stopOrder: 'asc' } },
          },
        },
      },
    });
  }

  async create(data: Prisma.TourCreateInput) {
    return this.prisma.tour.create({
      data,
      include: {
        images: true,
        highlights: true,
        inclusions: true,
        itineraryDays: {
          include: { stops: true },
        },
      },
    });
  }

  async update(id: bigint, data: Prisma.TourUpdateInput) {
    return this.prisma.tour.update({
      where: { id },
      data,
      include: {
        images: true,
        highlights: true,
        inclusions: true,
        itineraryDays: {
          include: { stops: true },
        },
      },
    });
  }

  async softDelete(id: bigint) {
    return this.prisma.tour.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getCategories() {
    return this.prisma.tour.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
  }

  async count(): Promise<number> {
    return this.prisma.tour.count({ where: { isActive: true } });
  }

  async getTopRatedTours(limit: number = 5) {
    return this.prisma.tour.findMany({
      where: { isActive: true },
      orderBy: { rating: 'desc' },
      take: limit,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
      },
    });
  }

  async updateTourRating(tourId: bigint): Promise<void> {
    const stats = await this.prisma.tourReview.aggregate({
      where: {
        tourId: tourId,
        status: 'approved',
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    const newRating = stats._avg.rating || 0;
    const newReviewsCount = stats._count.id || 0;

    await this.prisma.tour.update({
      where: { id: tourId },
      data: { rating: newRating, reviewsCount: newReviewsCount },
    });
  }
}
