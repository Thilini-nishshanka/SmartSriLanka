import { TourReviewRepository } from '../repositories/tour-review.repository';
import { HotelReviewRepository } from '../repositories/hotel-review.repository';
import { TourRepository } from '../repositories/tour.repository';
import { BigIntUtil } from '../utils/bigint.util';
import { CreateTourReviewDTO, CreateHotelReviewDTO, TourReviewDTO, HotelReviewDTO } from '../types/dto/review.dto';

export class ReviewService {
  private tourReviewRepository: TourReviewRepository;
  private hotelReviewRepository: HotelReviewRepository;
  private tourRepository: TourRepository;

  constructor() {
    this.tourReviewRepository = new TourReviewRepository();
    this.hotelReviewRepository = new HotelReviewRepository();
    this.tourRepository = new TourRepository();
  }

  async getAllReviews(options: {
    page?: number;
    limit?: number;
    minRating?: number;
    status?: 'approved' | 'pending' | 'rejected';
  }) {
    const { page = 1, limit = 10, minRating, status } = options;

    // Fetch both tour and hotel reviews with filters
    const repoOptions: {
      page: number;
      limit: number;
      minRating?: number;
      status?: 'approved' | 'pending' | 'rejected';
    } = { page, limit };
    if (minRating !== undefined) repoOptions.minRating = minRating;
    if (status !== undefined) repoOptions.status = status;
    const [tourReviewsResult, hotelReviewsResult] = await Promise.all([
      this.tourReviewRepository.findAll(repoOptions),
      this.hotelReviewRepository.findAll(repoOptions),
    ]);

    // Combine and sort by creation date
    const combinedReviews = [
      ...tourReviewsResult.reviews.map((r) => this.mapTourReviewToDTO(r)),
      ...hotelReviewsResult.reviews.map((r) => this.mapHotelReviewToDTO(r)),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Since we're combining two paginated sources, the pagination logic is simplified.
    // For a more robust solution, you might consider a more complex aggregation or a view in the database.
    const total = tourReviewsResult.total + hotelReviewsResult.total;
    const paginatedItems = combinedReviews.slice(0, limit);

    return {
      items: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTourReviews(tourId: string, page: number = 1, limit: number = 10) {
    const result = await this.tourReviewRepository.findByTourId(BigIntUtil.toBigInt(tourId), page, limit);

    return {
      items: result.reviews.map((r) => this.mapTourReviewToDTO(r)),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getHotelReviews(hotelId: string, page: number = 1, limit: number = 10) {
    const result = await this.hotelReviewRepository.findByHotelId(BigIntUtil.toBigInt(hotelId), page, limit);

    return {
      items: result.reviews.map((r) => this.mapHotelReviewToDTO(r)),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async createTourReview(userId: string, dto: CreateTourReviewDTO): Promise<TourReviewDTO> {
    // const exists = await this.tourReviewRepository.checkUserReviewExists(userId, BigIntUtil.toBigInt(dto.tourId));

    // if (exists) {
    //   throw new Error('You have already reviewed this tour');
    // }

    const createData: any = {
      user: { connect: { id: userId } },
      tour: { connect: { id: BigIntUtil.toBigInt(dto.tourId) } },
      rating: dto.rating,
      comment: dto.comment,
      isVerified: !!dto.bookingId,
    };

    if (dto.bookingId) {
      createData.booking = { connect: { id: BigIntUtil.toBigInt(dto.bookingId) } };
    }

    const review = await this.tourReviewRepository.create(createData);

    // After creating, update the tour's average rating
    await this.tourRepository.updateTourRating(BigIntUtil.toBigInt(dto.tourId));

    return this.mapTourReviewToDTO(review);
  }

  async createHotelReview(userId: string, dto: CreateHotelReviewDTO): Promise<HotelReviewDTO> {
    // const exists = await this.hotelReviewRepository.checkUserReviewExists(userId, BigIntUtil.toBigInt(dto.hotelId));

    // if (exists) {
    //   throw new Error('You have already reviewed this hotel');
    // }

    const review = await this.hotelReviewRepository.create({
      user: { connect: { id: userId } },
      hotel: { connect: { id: BigIntUtil.toBigInt(dto.hotelId) } },
      overallRating: dto.overallRating,
      locationRating: dto.locationRating,
      roomsRating: dto.roomsRating,
      valueRating: dto.valueRating,
      cleanlinessRating: dto.cleanlinessRating,
      serviceRating: dto.serviceRating,
      sleepQualityRating: dto.sleepQualityRating,
      comment: dto.comment,
    });

    return this.mapHotelReviewToDTO(review);
  }

  async updateReview(id: string, userId: string, data: { rating?: number; comment?: string; status?: 'approved' | 'pending' | 'rejected' }) {
    // Try to find as a tour review first
    let review: any = await this.tourReviewRepository.findById(BigIntUtil.toBigInt(id));
    let reviewType: 'tour' | 'hotel' = 'tour';

    if (!review) {
      // If not found, try to find as a hotel review
      review = await this.hotelReviewRepository.findById(BigIntUtil.toBigInt(id));
      reviewType = 'hotel';
    }

    if (!review) {
      throw new Error('Review not found');
    }

    // Authorization check can be added here if non-admins can update their own reviews
    // if (review.userId !== userId) {
    //   throw new Error('Not authorized to update this review');
    // }

    if (reviewType === 'tour') {
      const updatedReview = await this.tourReviewRepository.update(BigIntUtil.toBigInt(id), data);
      // If the review status was changed, we need to recalculate the tour's average rating.
      if (data.status) {
        await this.tourRepository.updateTourRating(updatedReview.tourId);
      }
      return this.mapTourReviewToDTO(updatedReview);
    } else {
      const updatedReview = await this.hotelReviewRepository.update(BigIntUtil.toBigInt(id), data);
      return this.mapHotelReviewToDTO(updatedReview);
    }
  }

  async deleteReview(id: string, userId: string) {
    let review: any = await this.tourReviewRepository.findById(BigIntUtil.toBigInt(id));
    let reviewType: 'tour' | 'hotel' = 'tour';

    if (!review) {
      review = await this.hotelReviewRepository.findById(BigIntUtil.toBigInt(id));
      reviewType = 'hotel';
    }

    if (!review) {
      throw new Error('Review not found'); // Neither tour nor hotel review found
    }

    // Authorization check: ensure the user owns the review
    if (review.userId !== userId) {
      throw new Error('Unauthorized to delete this review');
    }

    // Delete from the correct repository
    if (reviewType === 'tour') {
      await this.tourReviewRepository.delete(BigIntUtil.toBigInt(id));
    } else {
      await this.hotelReviewRepository.delete(BigIntUtil.toBigInt(id));
    }
  }

  private mapTourReviewToDTO(review: any): TourReviewDTO {
    return {
      id: Number(review.id),
      tourId: Number(review.tourId),
      tourName: review.tour?.name || '',
      userName: review.user?.name || 'Anonymous',
      userAvatar: review.user?.avatarUrl || '',
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split('T')[0],
      status: review.status,
    };
  }

  private mapHotelReviewToDTO(review: any): HotelReviewDTO {
    return {
      id: Number(review.id),
      hotelId: Number(review.hotelId),
      hotelName: review.hotel?.name || '',
      userName: review.user?.name || 'Anonymous',
      userAvatar: review.user?.avatarUrl || '',
      overallRating: review.overallRating,
      locationRating: review.locationRating,
      roomsRating: review.roomsRating,
      valueRating: review.valueRating,
      cleanlinessRating: review.cleanlinessRating,
      serviceRating: review.serviceRating,
      sleepQualityRating: review.sleepQualityRating,
      comment: review.comment,
      date: review.createdAt.toISOString().split('T')[0],
      status: review.status,
    };
  }
} 