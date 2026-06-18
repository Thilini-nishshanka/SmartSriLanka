export class CreateHotelBookingDTO {
  hotelId!: number;
  roomTypeId!: number;
  checkInDate!: string;
  checkOutDate!: string;
  numberOfRooms!: number;
  numberOfGuests!: number;
  contactName!: string;
  contactEmail!: string;
  contactPhone!: string;
}

export class UpdateHotelBookingDTO {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfRooms?: number;
  numberOfGuests?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export class HotelBookingDTO {
  id!: string;
  hotelId!: number;
  hotelName!: string;
  roomTypeId!: number;
  roomTypeName!: string;
  userId?: string;
  userName?: string;
  userEmail!: string;
  userPhone!: string;
  checkInDate!: string;
  checkOutDate!: string;
  numberOfRooms!: number;
  numberOfGuests!: number;
  totalPrice!: number;
  status!: 'confirmed' | 'pending' | 'cancelled';
  bookingDate!: string;
  createdAt!: Date;
  updatedAt!: Date;
}