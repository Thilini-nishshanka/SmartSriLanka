import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { CreateTourReviewDTO, CreateHotelReviewDTO } from '../types/dto/review.dto';

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }
  
  getAllReviews = async (req: Request, res: Response) => {
    try {
      const page = req.query['page'] ? parseInt(req.query['page'] as string) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 10;
      const minRating = req.query['minRating'] ? parseInt(req.query['minRating'] as string) : undefined;
      const status = req.query['status'] as 'approved' | 'pending' | 'rejected' | undefined;
 
      const options: {
        page: number;
        limit: number;
        minRating?: number;
        status?: 'approved' | 'pending' | 'rejected';
      } = { page, limit };
      if (minRating !== undefined) options.minRating = minRating;
      if (status !== undefined) options.status = status;

      const result = await this.reviewService.getAllReviews(options);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  getTourReviews = async (req: Request, res: Response) => {
    try {
      const { tourId } = req.params;
      if (!tourId) {
        throw new Error('Tour ID is required');
      }
      const page = req.query['page'] ? parseInt(req.query['page'] as string) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 10;

      const result = await this.reviewService.getTourReviews(tourId, page, limit);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  getHotelReviews = async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;
      if (!hotelId) {
        throw new Error('Hotel ID is required');
      }
      const page = req.query['page'] ? parseInt(req.query['page'] as string) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 10;

      const result = await this.reviewService.getHotelReviews(hotelId, page, limit);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  createReview = async (req: Request, res: Response) => {
    try {
      const { tourId, hotelId, ...data } = req.body;

      if (tourId) {
        const dto: CreateTourReviewDTO = { tourId, ...data };
        const review = await this.reviewService.createTourReview(req.user!.id, dto);
        sendSuccess(res, review, 'Tour review created successfully', 201);
      } else if (hotelId) {
        const dto: CreateHotelReviewDTO = { hotelId, ...data };
        const review = await this.reviewService.createHotelReview(req.user!.id, dto);
        sendSuccess(res, review, 'Hotel review created successfully', 201);
      } else {
        sendError(res, 'Either tourId or hotelId is required', 400);
      }
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };
  

  updateReview = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Review ID is required');
      }
      const review = await this.reviewService.updateReview(id, req.user!.id, req.body);
      sendSuccess(res, review, 'Review updated successfully');
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 500);
    }
  };

  deleteReview = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Review ID is required');
      }
      await this.reviewService.deleteReview(id, req.user!.id);
      sendSuccess(res, null, 'Review deleted successfully');
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 500);
    }
  };
}
