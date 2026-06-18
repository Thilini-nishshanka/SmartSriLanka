export class CreateTourReviewDTO {
  tourId!: number;
  bookingId?: number;
  rating!: number;
  comment!: string;
}

export class UpdateTourReviewDTO {
  rating?: number;
  comment?: string;
  status?: 'approved' | 'pending' | 'rejected';
}

  id!: number;
  tourId!: number;
  tourName!: string;
  userName!: string;
  userAvatar!: string;
  rating!: number;
  comment!: string;
  date!: string;
  status!: 'approved' | 'pending' | 'rejected';
}

export class CreateHotelReviewDTO {
  hotelId!: number;
  overallRating!: number;
  locationRating!: number;
  roomsRating!: number;
  valueRating!: number;
  cleanlinessRating!: number;
  serviceRating!: number;
  sleepQualityRating!: number;
  comment!: string;
}

export class UpdateHotelReviewDTO {
  overallRating?: number;
  locationRating?: number;
  roomsRating?: number;
  valueRating?: number;
  cleanlinessRating?: number;
  serviceRating?: number;
  sleepQualityRating?: number;
  comment?: string;
  status?: 'approved' | 'pending' | 'rejected';
}

export class HotelReviewDTO {
  id!: number;
  hotelId!: number;
  hotelName!: string;
  userName!: string;
  userAvatar!: string;
  overallRating!: number;
  locationRating!: number;
  roomsRating!: number;
  valueRating!: number;
  cleanlinessRating!: number;
  serviceRating!: number;
  sleepQualityRating!: number;
  comment!: string;
  date!: string;
  status!: 'approved' | 'pending' | 'rejected';
}
