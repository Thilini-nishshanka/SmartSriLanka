// import { Router } from 'express';
// import { HotelBookingController } from '../controllers/hotelBookingController';
// import { authenticate } from '../middleware/auth';
// import { validate } from '../middleware/validation';
// import { createHotelBookingSchema } from '../validation';

// const router = Router();
// const hotelBookingController = new HotelBookingController();

// /**
//  * @route   GET /api/v1/hotel-bookings
//  * @desc    Get all user hotel bookings (alias for /user)
//  * @access  Private
//  */
// router.get('/', authenticate, hotelBookingController.getAll);

// /**
//  * @route   GET /api/v1/hotel-bookings/user
//  * @desc    Get current user's hotel bookings
//  * @access  Private
//  */
// router.get('/user', authenticate, hotelBookingController.getAll);

// /**
//  * @route   GET /api/v1/hotel-bookings/:id
//  * @desc    Get hotel booking by ID
//  * @access  Private
//  */
// router.get('/:id', authenticate, hotelBookingController.getById);

// /**
//  * @route   POST /api/v1/hotel-bookings
//  * @desc    Create new hotel booking
//  * @access  Private
//  */
// router.post(
//   '/',
//   authenticate,
//   validate(createHotelBookingSchema),
//   hotelBookingController.create
// );

// /**
//  * @route   POST /api/v1/hotel-bookings/:id/cancel
//  * @desc    Cancel hotel booking
//  * @access  Private
//  */
// router.post('/:id/cancel', authenticate, hotelBookingController.cancel);

// export default router;

import { Router } from 'express';
import { HotelBookingController } from '../controllers/hotelBookingController';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { body } from 'express-validator';

const router = Router();
const hotelBookingController = new HotelBookingController();

// Validators
const createHotelBookingValidator = [
  body('hotelId').isInt().withMessage('Valid hotel ID is required'),
  body('roomTypeId').isInt().withMessage('Valid room type ID is required'),
  body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOutDate').isISO8601().withMessage('Valid check-out date is required'),
  body('numberOfRooms').isInt({ min: 1 }).withMessage('Number of rooms must be at least 1'),
  body('numberOfGuests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
  body('contactName').notEmpty().withMessage('Contact name is required'),
  body('contactEmail').isEmail().withMessage('Valid email is required'),
  body('contactPhone').notEmpty().withMessage('Phone is required'),
];

// Admin routes
router.get('/',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  hotelBookingController.getAllBookings
);

// User routes
router.get('/user',
  AuthMiddleware.authenticate,
  hotelBookingController.getUserBookings
);

router.get('/:id',
  AuthMiddleware.authenticate,
  hotelBookingController.getBookingById
);

router.post('/',
  AuthMiddleware.authenticate,
  createHotelBookingValidator,
  ValidationMiddleware.validate,
  hotelBookingController.createBooking
);

// User can only update/cancel their own bookings (controller should check ownership)
router.put('/:id',
  AuthMiddleware.authenticate,
  hotelBookingController.updateBooking
);

router.post('/:id/cancel',
  AuthMiddleware.authenticate,
  hotelBookingController.cancelBooking
);

export default router;