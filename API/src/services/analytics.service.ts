import { PrismaClient } from '@prisma/client';
import {
  startOfToday,
  endOfToday,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths
} from 'date-fns';

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async getIncomeSummary() {
    const [incomeStats, monthlyBreakdown, topTours] = await Promise.all([
      this.getIncomeStats(),
      this.getMonthlyBreakdown(),
      this.getTopTours(),
    ]);

    return {
      ...incomeStats,
      monthlyBreakdown,
      topTours,
    };
  }

  public async getDashboardSummary() {
    const [stats, recentBookings, recentReviews] = await Promise.all([
      this.getDashboardStats(),
      this.getRecentBookings(),
      this.getRecentReviews(),
    ]);

    return {
      ...stats,
      recentBookings,
      recentReviews,
    };
  }

  private async getDashboardStats() {
    const [
      totalTourBookings,
      totalHotelBookings,
      activeTours,
      totalTourReviews,
      totalHotelReviews,
      revenueResult,
    ] = await this.prisma.$transaction([
      this.prisma.booking.count(),
      this.prisma.hotelBooking.count(),
      this.prisma.tour.count({ where: { isActive: true } }),
      this.prisma.tourReview.count(),
      this.prisma.hotelReview.count(),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'succeeded' },
      }),
    ]);

    return {
      totalBookings: totalTourBookings + totalHotelBookings,
      activeTours,
      totalReviews: totalTourReviews + totalHotelReviews,
      totalRevenue: Number(revenueResult._sum.amount) || 0,
    };
  }

  private async getRecentBookings() {
    const bookings = await this.prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { tour: { select: { name: true } } },
    });

    return bookings.map(b => ({
      id: Number(b.id),
      serviceName: b.tour?.name || 'Unknown Tour',
      amount: Number(b.totalPrice),
    }));
  }

  private async getRecentReviews() {
    const reviews = await this.prisma.tourReview.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });

    return reviews.map(r => ({ id: Number(r.id), userName: r.user?.name || 'Anonymous', rating: r.rating, comment: r.comment }));
  }

  private async getIncomeStats() {
    const now = new Date();

    const todayRange = { gte: startOfToday(), lte: endOfToday() };
    const thisMonthRange = { gte: startOfMonth(now), lte: endOfMonth(now) };
    const lastMonthRange = {
      gte: startOfMonth(subMonths(now, 1)),
      lte: endOfMonth(subMonths(now, 1)),
    };
    const thisYearRange = { gte: startOfYear(now), lte: endOfYear(now) };

    const successfulPaymentFilter = {
      status: 'succeeded',
      paidAt: { not: null },
    };

    const getSum = async (dateRange: { gte: Date; lte: Date }) => {
      const result = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { ...successfulPaymentFilter, paidAt: dateRange },
      });
      return Number(result._sum.amount) || 0;
    };

    const [todayIncome, monthlyIncome, lastMonthIncome, yearlyIncome] =
      await Promise.all([
        getSum(todayRange),
        getSum(thisMonthRange),
        getSum(lastMonthRange),
        getSum(thisYearRange),
      ]);

    const monthlyGrowth =
      lastMonthIncome > 0
        ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100
        : monthlyIncome > 0
        ? 100
        : 0;

    return {
      todayIncome,
      monthlyIncome,
      yearlyIncome,
      monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
    };
  }

  /**
   * => FIXED: You cannot use Prisma.groupBy with Date fields.
   * => So we fetch all in current year and manually sum per month.
   */
  private async getMonthlyBreakdown() {
    const now = new Date();
    const year = now.getFullYear();

    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'succeeded',
        paidAt: {
          gte: startOfYear(now),
          lte: endOfYear(now),
        },
      },
      select: {
        amount: true,
        paidAt: true,
      },
    });

    const monthlyData = Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(year, i).toLocaleString('default', { month: 'short' }),
      income: 0,
    }));

    payments.forEach((p) => {
      if (!p.paidAt) return;
      const monthIndex = p.paidAt.getMonth(); // 0–11
      const monthData = monthlyData[monthIndex];
      if (monthData) {
        monthData.income += Number(p.amount);
      }
    });

    return monthlyData;
  }

  private async getTopTours() {
    const topTours = await this.prisma.payment.groupBy({
      by: ['bookingId'],
      _sum: { amount: true },
      where: { status: 'succeeded', bookingId: { not: null } },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    const bookingIds = topTours.map((t) => t.bookingId!);

    const tourBookings = await this.prisma.booking.findMany({
      where: { id: { in: bookingIds } },
      include: { tour: { select: { name: true } } },
    });

    const bookingMap = new Map(tourBookings.map((b) => [b.id, b]));

    return topTours.map((t) => ({
      name: bookingMap.get(t.bookingId!)?.tour.name || 'Unknown Tour',
      revenue: Number(t._sum.amount) || 0,
    }));
  }
}
