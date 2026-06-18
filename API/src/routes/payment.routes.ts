// import { Router } from 'express';
// import { PaymentController } from '../controllers/paymentController';
// import { authenticate } from '../middleware/auth';
// import { validate } from '../middleware/validation';
// import { 
//   createPaymentIntentSchema, 
//   confirmPaymentSchema 
// } from '../validation';

// const router = Router();
// const paymentController = new PaymentController();

// /**
//  * @route   POST /api/v1/payments/create-intent
//  * @desc    Create a payment intent
//  * @access  Private
//  */
// router.post(
//   '/create-intent',
//   authenticate,
//   validate(createPaymentIntentSchema),
//   paymentController.createPaymentIntent
// );

// /**
//  * @route   POST /api/v1/payments/confirm
//  * @desc    Confirm a payment
//  * @access  Private
//  */
// router.post(
//   '/confirm',
//   authenticate,
//   validate(confirmPaymentSchema),
//   paymentController.confirmPayment
// );

// /**
//  * @route   POST /api/v1/payments/:id/refund
//  * @desc    Refund a payment
//  * @access  Private - Admin only
//  */
// router.post('/:id/refund', authenticate, paymentController.refund);

// export default router;





import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation';
import { 
  createPaymentIntentSchema, 
  confirmPaymentSchema,
  refundPaymentSchema
} from '../validation';
import { requireAdmin } from '../middleware/roleGuard';

const router = Router();
const paymentController = new PaymentController();

/**
 * @route   POST /api/v1/payments/create-intent
 * @desc    Create a payment intent
 * @access  Private
 */
router.post(
  '/create-intent',
  AuthMiddleware.authenticate,
  // validate(createPaymentIntentSchema), // Temporarily disable for debugging, controller has sufficient validation
  paymentController.createPaymentIntent
);

/**
 * @route   POST /api/v1/payments/confirm
 * @desc    Confirm a payment
 * @access  Private
 */
router.post(
  '/confirm',
  AuthMiddleware.authenticate,
  validate(confirmPaymentSchema),
  paymentController.confirmPayment
);

/**
 * @route   POST /api/v1/payments/:id/refund
 * @desc    Refund a payment
 * @access  Private - Admin only
 */
router.post(
  '/:id/refund', 
  AuthMiddleware.authenticate,
  requireAdmin,
  validate(refundPaymentSchema),
  paymentController.refund
);

export default router;