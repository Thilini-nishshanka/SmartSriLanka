import { Router, Request, Response, NextFunction } from 'express';
import { TourController } from '../controllers/tour.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';

const router = Router();
const tourController = new TourController();

// Validators
const createTourValidator = [
  body('name').notEmpty().withMessage('Tour name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('numberOfDays').isInt({ min: 1 }).withMessage('Number of days must be at least 1'),
];

// Public routes
router.get('/', tourController.getAllTours);
router.get('/categories', tourController.getCategories);
router.get('/:id', tourController.getTourById);

// Protected admin routes
router.post('/', 
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  createTourValidator,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
  tourController.createTour
);

router.put('/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  tourController.updateTour
);

router.delete('/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  tourController.deleteTour
);

export default router;