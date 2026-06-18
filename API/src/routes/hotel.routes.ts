import { Router, Request, Response, NextFunction } from 'express';
import { HotelController } from '../controllers/hotel.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';

const router = Router();
const hotelController = new HotelController();

// Validators
const createHotelValidator = [
  body('name').notEmpty().withMessage('Hotel name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('priceFrom').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('hotelClass').notEmpty().withMessage('Hotel class is required'),
];

const checkAvailabilityValidator = [
  body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOutDate').isISO8601().withMessage('Valid check-out date is required'),
  body('numberOfRooms').isInt({ min: 1 }).withMessage('Number of rooms must be at least 1'),
  body('numberOfGuests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
];

// Public routes
router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);
router.post('/:id/availability', checkAvailabilityValidator, (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
}, hotelController.checkAvailability);

// Protected admin routes
router.post('/', 
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  createHotelValidator, 
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
  hotelController.createHotel
);

router.put('/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  hotelController.updateHotel
);

router.delete('/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  hotelController.deleteHotel
);

export default router;