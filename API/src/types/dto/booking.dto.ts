export class CreateBookingDTO {
  tourId!: number;
  date!: string;
  guests!: number;
  name!: string;
  email!: string;
  phone!: string;
}

export class UpdateBookingDTO {
  date?: string;
  guests?: number;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export class BookingDTO {
  id!: string;
  name!: string;
  email!: string;
  phone!: string;
  tour!: string;
  tourId!: number;
  tourName?: string;
  userName?: string;
  guests!: number;
  date!: string;
  totalPrice?: number;
  status!: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount!: string;
  bookingDate?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class UserBookingDTO {
  id!: number;
  tour!: string;
  date!: string;
  guests!: number;
  status!: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice!: number;
  bookingDate!: string;
}
