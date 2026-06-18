import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { CreateHotelDTO, UpdateHotelDTO, HotelQueryDTO, CheckAvailabilityDTO } from '../types/dto/hotel.dto';

export class HotelController {
  private hotelService: HotelService;

  constructor() {
    this.hotelService = new HotelService();
  }

  getAllHotels = async (req: Request, res: Response) => {
    try {
      const query: HotelQueryDTO = {
        city: req.query['city'] as string,
        minPrice: req.query['minPrice'] ? parseFloat(req.query['minPrice'] as string) : 0,
        maxPrice: req.query['maxPrice'] ? parseFloat(req.query['maxPrice'] as string) : 0,
        page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10,
      };

      const result = await this.hotelService.getAllHotels(query);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  getHotelById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Hotel ID is required');
      }
      const hotel = await this.hotelService.getHotelById(id);
      sendSuccess(res, hotel);
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Hotel not found' ? 404 : 500);
    }
  };

  createHotel = async (req: Request, res: Response) => {
    try {
      const dto: CreateHotelDTO = req.body;
      const hotel = await this.hotelService.createHotel(dto);
      sendSuccess(res, hotel, 'Hotel created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  updateHotel = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Hotel ID is required');
      }
      const dto: UpdateHotelDTO = req.body;
      const hotel = await this.hotelService.updateHotel(id, dto);
      sendSuccess(res, hotel, 'Hotel updated successfully');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  deleteHotel = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Hotel ID is required');
      }
      await this.hotelService.deleteHotel(id);
      sendSuccess(res, null, 'Hotel deleted successfully');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  checkAvailability = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Hotel ID is required');
      }
      const dto: CheckAvailabilityDTO = req.body;
      const result = await this.hotelService.checkAvailability(id, dto);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };
}