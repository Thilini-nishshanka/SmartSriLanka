import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';

const router = Router();
const authController = new AuthController();

// Validators
const registerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post(
  '/register',
  registerValidator,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
  authController.register
);

router.post(
  '/login',
  loginValidator,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
  authController.login
);

// ✅ Use the proper middleware
router.post('/logout', AuthMiddleware.authenticate, authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/me', AuthMiddleware.authenticate, authController.getMe);

export default router;
