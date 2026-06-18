
// import { Router, Request, Response, NextFunction } from 'express';
// import { BookingController } from '../controllers/booking.controller';
// import { AuthMiddleware } from '../middleware/auth.middleware';
// import { body, validationResult } from 'express-validator';

// const router = Router();
// const bookingController = new BookingController();

// // Validators
// const createBookingValidator = [
//   body('tourId').isInt().withMessage('Valid tour ID is required'),
//   body('date').isISO8601().withMessage('Valid date is required'),
//   body('guests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
//   body('name').notEmpty().withMessage('Name is required'),
//   body('email').isEmail().withMessage('Valid email is required'),
//   body('phone').notEmpty().withMessage('Phone is required'),
// ];

// // Validation middleware
// const validateBooking = (req: Request, res: Response, next: NextFunction) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   return next();
// };

// // Admin routes
// router.get('/',
//   AuthMiddleware.authenticate,
//   AuthMiddleware.authorize('admin'),
//   bookingController.getAllBookings
// );

// // User routes
// router.get('/user',
//   AuthMiddleware.authenticate,
//   bookingController.getUserBookings
// );

// router.get('/:id',
//   AuthMiddleware.authenticate,
//   bookingController.getBookingById
// );

// router.post('/',
//   AuthMiddleware.authenticate,
//   createBookingValidator,
//   validateBooking,
//   bookingController.createBooking
// );

// // User can only update/cancel their own bookings (controller should check ownership)
// router.put('/:id',
//   AuthMiddleware.authenticate,
//   bookingController.updateBooking
// );

// router.post('/:id/cancel',
//   AuthMiddleware.authenticate,
//   bookingController.cancelBooking
// );

// export default router;


import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';
import { AuthMiddleware } from '../middleware/auth.middleware';
const router = Router();
const bookingController = new BookingController();

// All booking routes are protected
router.use(AuthMiddleware.authenticate);

router.get('/me', bookingController.getUserBookings); // Changed to /me for consistency with profiles

// Admin routes
router.get('/', AuthMiddleware.authorize('admin'), bookingController.getAllBookings);
router.put(
  '/:id',
  AuthMiddleware.authorize('admin'),
  bookingController.updateBooking
);

export default router;