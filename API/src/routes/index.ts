import { Router } from 'express';
import authRoutes from './auth.routes';
import tourRoutes from './tour.routes';
import hotelRoutes from './hotel.routes';
import bookingRoutes from './booking.routes';
import hotelBookingRoutes from './hotelBooking.routes';
import reviewRoutes from './review.routes';
import paymentRoutes from './payment.routes';
import analyticsRoutes from './analytics.routes';
import uploadRoutes from './upload.routes';
import profileRoutes from './profile.routes';
import policyRoutes from './policy.routes';
import recognitionRoutes from './recognition.routes';
import contactRoutes from './contact.routes';
import chatbotRoutes from './chatbot.route';
import AnalyticsRoutes from './analytics.routes';


const router = Router();

router.use('/auth', authRoutes);
router.use('/tours', tourRoutes);
router.use('/hotels', hotelRoutes);
router.use('/bookings', bookingRoutes);
router.use('/hotel-bookings', hotelBookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/upload', uploadRoutes);
router.use('/profiles', profileRoutes);
router.use('/policies', policyRoutes);
router.use('/recognize', recognitionRoutes);
router.use('/contact', contactRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/analytics', AnalyticsRoutes);

export default router;