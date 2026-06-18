export class DashboardStatsDTO {
  totalBookings!: number;
  totalRevenue!: number;
  totalUsers!: number;
  totalTours!: number;
  totalHotels!: number;
  recentBookings!: any[];
  topTours!: any[];
}

export class IncomeStatsDTO {
  totalIncome!: number;
  monthlyIncome!: MonthlyIncomeDTO[];
  paymentMethodBreakdown!: PaymentMethodBreakdownDTO[];
}

export class MonthlyIncomeDTO {
  month!: string;
  income!: number;
  bookings!: number;
}

export class PaymentMethodBreakdownDTO {
  method!: string;
  amount!: number;
  count!: number;
}

export class BookingStatsDTO {
  totalBookings!: number;
  confirmedBookings!: number;
  pendingBookings!: number;
  cancelledBookings!: number;
  completedBookings!: number;
  bookingsByMonth!: BookingsByMonthDTO[];
  bookingsByCategory!: BookingsByCategoryDTO[];
}

export class BookingsByMonthDTO {
  month!: string;
  count!: number;
}

export class BookingsByCategoryDTO {
  category!: string;
  count!: number;
}