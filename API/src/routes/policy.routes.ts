import { Router } from 'express';
import { PolicyController } from '../controllers/policy.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const policyController = new PolicyController();

// Admin routes
router.get('/list', AuthMiddleware.authenticate, AuthMiddleware.authorize('admin'), policyController.getAllPolicies);

// Public routes
router.get('/:slug', policyController.getPolicyBySlug);
router.put(
  '/:slug',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  policyController.updatePolicy
);

export default router;