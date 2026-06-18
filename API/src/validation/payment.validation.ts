import Joi from 'joi';
import { ValidationSchema } from '../middleware/validation';

export const createPaymentIntentSchema: ValidationSchema = {
  body: Joi.object({
    bookingType: Joi.string().valid('tour', 'hotel').required(),
    bookingId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string()
  })
};

export const confirmPaymentSchema: ValidationSchema = {
  body: Joi.object({
    paymentIntentId: Joi.string().required()
  })
};

export const refundPaymentSchema: ValidationSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required()
  })
};