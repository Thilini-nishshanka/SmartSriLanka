import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(AuthMiddleware.authenticate);

router.get('/dashboard-summary', analyticsController.getDashboardSummary);
router.get('/income-summary', analyticsController.getIncomeSummary);
router.get('/revenue', analyticsController.getRevenueStats);
router.get('/bookings', analyticsController.getBookingStats);

export default router;