import { Payment, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class PaymentRepository extends BaseRepository<Payment> {
  async findByUserId(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPaymentIntentId(paymentIntentId: string) {
    return this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });
  }

  async findByBookingId(bookingId: bigint) {
    return this.prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: bigint) {
    return this.prisma.payment.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.PaymentCreateInput) {
    return this.prisma.payment.create({
      data,
    });
  }

  async update(id: bigint, data: Prisma.PaymentUpdateInput) {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    });
    return Number(result._sum.amount) || 0;
  }

  async getMonthlyIncome() {
    return this.prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(paid_at, '%Y-%m') as month,
        SUM(amount) as income,
        COUNT(*) as bookings
      FROM payments
      WHERE status = 'completed' AND paid_at IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;
  }

  async getPaymentMethodBreakdown() {
    return this.prisma.$queryRaw`
      SELECT 
        payment_method as method,
        SUM(amount) as amount,
        COUNT(*) as count
      FROM payments
      WHERE status = 'completed'
      GROUP BY payment_method
    `;
  }
}
