import { Request, Response } from 'express';
import Stripe from 'stripe';
import { BaseController } from './baseController';
import {
  PaymentRepository,
  BookingRepository,
  TourRepository,
  HotelBookingRepository,
} from '../repositories';
import { AppError } from '../utils/error.util';
import { CreatePaymentIntentDTO, ConfirmPaymentDTO } from '../types/dto';
import { BigIntUtil } from '../utils/bigint.util';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-10-29.clover',
});

export class PaymentController extends BaseController {
  private paymentRepo: PaymentRepository;
  private bookingRepo: BookingRepository;
  private tourRepo: TourRepository;
  private hotelBookingRepo: HotelBookingRepository;

  constructor() {
    super();
    this.paymentRepo = new PaymentRepository();
    this.bookingRepo = new BookingRepository();
    this.tourRepo = new TourRepository();
    this.hotelBookingRepo = new HotelBookingRepository();
  }

  createPaymentIntent = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { tourId, date, guests, name, email, phone }: CreatePaymentIntentDTO =
        req.body;

      // 1. Find the tour and calculate total price
      const tour = await this.tourRepo.findById(BigIntUtil.toBigInt(tourId));
      if (!tour) {
        throw new AppError('Tour not found', 404);
      }
      const totalPrice = Number(tour.price) * guests;

      // 2. Create a booking with 'pending' status
      const booking = await this.bookingRepo.create({
        user: { connect: { id: req.user.id } },
        tour: { connect: { id: tour.id } },
        bookingDate: new Date(date),
        numberOfPeople: guests,
        totalPrice,
        status: 'confirmed',
        contactName: name,
        contactEmail: email,
        contactPhone: phone,
      });

      // 3. Create a Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100), // Amount in cents
        currency: 'usd',
        metadata: {
          bookingId: booking.id.toString(),
          userId: req.user.id,
        },
      });

      // 4. Create a payment record in our database
      const payment = await this.paymentRepo.create({
        user: { connect: { id: req.user.id } },
        booking: { connect: { id: booking.id } },
        amount: totalPrice,
        currency: 'usd',
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
      });

      // 5. Send the client secret and booking ID to the frontend
      BaseController.sendSuccess(res, {
        clientSecret: paymentIntent.client_secret,
        bookingId: booking.id.toString(),
      }, 201);
    } catch (error) {
      BaseController.logError('createPaymentIntent', error);
      throw error;
    }
  };

  confirmPayment = async (req: Request, res: Response) => {
    try {
      const { paymentIntentId }: ConfirmPaymentDTO = req.body;

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update payment record
        const payment = await this.paymentRepo.findByPaymentIntentId(paymentIntentId);

        if (payment) {
          await this.paymentRepo.update(payment.id, {
            status: 'succeeded',
            paidAt: new Date(),
            transactionId: paymentIntent.id,
          });

          // Update booking status
          if (payment.bookingId) {
            await this.bookingRepo.update(payment.bookingId, {
              status: 'confirmed',
            });
          }

          // Update hotel booking status
          if (payment.hotelBookingId) {
            await this.hotelBookingRepo.update(payment.hotelBookingId, { status: 'confirmed' });
          }
        }

        BaseController.sendSuccess(res, {
          success: true,
          message: 'Payment confirmed successfully.',
        });
      } else {
        throw new AppError('Payment not completed', 400);
      }
    } catch (error) {
      BaseController.logError('confirmPayment', error);
      throw error;
    }
  };

  refund = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Payment ID is required', 400);
      }

      const payment = await this.paymentRepo.findById(BigInt(id));
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (payment.status !== 'succeeded') {
        throw new AppError('Only completed payments can be refunded', 400);
      }

      if (!payment.stripePaymentIntentId) {
        throw new AppError('Payment cannot be refunded - no payment intent found', 400);
      }

      // Create Stripe refund
      await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      });

      // Update payment status
      await this.paymentRepo.update(payment.id, {
        status: 'refunded',
      });

      BaseController.sendSuccess(res, null);
    } catch (error) {
      BaseController.logError('refund', error);
      throw error;
    }
  };
}
