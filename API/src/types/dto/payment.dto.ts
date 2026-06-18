export class CreatePaymentIntentDTO {
  tourId!: string;
  date!: string;
  guests!: number;
  name!: string;
  email!: string;
  phone!: string;
}

export class ConfirmPaymentDTO {
  paymentIntentId!: string;
}

export class PaymentDTO {
  id!: string;
  userId!: string;
  bookingType!: 'tour' | 'hotel';
  bookingId!: string;
  amount!: number;
  currency!: string;
  paymentMethod!: string;
  status!: string;
  paidAt?: Date;
  transactionId?: string;
  createdAt!: Date;
}
