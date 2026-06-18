import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { body } from 'express-validator';

const router = Router();
const reviewController = new ReviewController();

// Validators
const createTourReviewValidator = [
  body('tourId').isInt().withMessage('Valid tour ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
];

const createHotelReviewValidator = [
  body('hotelId').isInt().withMessage('Valid hotel ID is required'),
  body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('locationRating').isInt({ min: 1, max: 5 }).withMessage('Location rating must be between 1 and 5'),
  body('roomsRating').isInt({ min: 1, max: 5 }).withMessage('Rooms rating must be between 1 and 5'),
  body('valueRating').isInt({ min: 1, max: 5 }).withMessage('Value rating must be between 1 and 5'),
  body('cleanlinessRating').isInt({ min: 1, max: 5 }).withMessage('Cleanliness rating must be between 1 and 5'),
  body('serviceRating').isInt({ min: 1, max: 5 }).withMessage('Service rating must be between 1 and 5'),
  body('sleepQualityRating').isInt({ min: 1, max: 5 }).withMessage('Sleep quality rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
];

// Routes
router.get('/', reviewController.getAllReviews); 
router.get('/tour/:tourId', reviewController.getTourReviews);
router.get('/hotel/:hotelId', reviewController.getHotelReviews);
router.post('/', AuthMiddleware.authenticate, reviewController.createReview);
router.put('/:id', AuthMiddleware.authenticate, reviewController.updateReview);
router.delete('/:id', AuthMiddleware.authenticate, reviewController.deleteReview);

export default router;