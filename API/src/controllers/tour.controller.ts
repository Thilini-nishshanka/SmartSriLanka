import { Request, Response } from 'express';
import { TourService } from '../services/tour.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { CreateTourDTO, UpdateTourDTO, TourQueryDTO } from '../types/dto/tour.dto';

export class TourController {
  private tourService: TourService;

  constructor() {
    this.tourService = new TourService();
  }

  getAllTours = async (req: Request, res: Response) => {
    try {
      const query: TourQueryDTO = {};

      if (req.query['category']) {
        query.category = req.query['category'] as string;
      }
      if (req.query['location']) {
        query.location = req.query['location'] as string;
      }
      if (req.query['minPrice']) {
        query.minPrice = parseFloat(req.query['minPrice'] as string);
      }
      if (req.query['maxPrice']) {
        query.maxPrice = parseFloat(req.query['maxPrice'] as string);
      }
      if (req.query['page']) {
        query.page = parseInt(req.query['page'] as string);
      } else {
        query.page = 1;
      }
      if (req.query['limit']) {
        query.limit = parseInt(req.query['limit'] as string);
      } else {
        query.limit = 10;
      }
      if (req.query['featured']) {
        query.featured = req.query['featured'] === 'true';
      }

      const result = await this.tourService.getAllTours(query);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  getTourById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Tour ID is required');
      }
      const tour = await this.tourService.getTourById(id);
      sendSuccess(res, tour);
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Tour not found' ? 404 : 500);
    }
  };

  createTour = async (req: Request, res: Response) => {
    try {
      const dto: CreateTourDTO = req.body;
      const tour = await this.tourService.createTour(dto);
      sendSuccess(res, tour, 'Tour created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  updateTour = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dto: UpdateTourDTO = req.body;
      if (!id) {
        throw new Error('Tour ID is required');
      }
      const tour = await this.tourService.updateTour(id, dto);
      sendSuccess(res, tour, 'Tour updated successfully');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  deleteTour = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Tour ID is required');
      }
      await this.tourService.deleteTour(id);
      sendSuccess(res, null, 'Tour deleted successfully');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  getCategories = async (_req: Request, res: Response) => {
    try {
      const categories = await this.tourService.getCategories();
      sendSuccess(res, { categories });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };
}