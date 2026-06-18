export class HotelCoordinatesDTO {
  lat!: number;
  lng!: number;
}

export class HotelRoomTypeDTO {
  id!: number;
  hotelId!: number;
  name!: string;
  description!: string;
  price!: number;
  maxGuests!: number;
  features!: string[];
  image?: string;
  available!: boolean;
}

export class CreateHotelDTO {
  name!: string;
  location!: string;
  city!: string;
  priceFrom!: number;
  description!: string;
  hotelClass!: string;
  mainImage?: string;
  mapEmbed?: string;
  rating?: number;
  reviewsCount?: number;
  coordinates?: HotelCoordinatesDTO;
  images?: string[];
  hotelStyle?: string[];
  propertyAmenities?: string[];
  roomTypes?: Omit<HotelRoomTypeDTO, 'id' | 'hotelId'>[];
}

export class UpdateHotelDTO {
  name?: string;
  location?: string;
  city?: string;
  priceFrom?: number;
  description?: string;
  hotelClass?: string;
  mainImage?: string;
  mapEmbed?: string;
  coordinates?: HotelCoordinatesDTO;
  images?: string[];
  hotelStyle?: string[];
  propertyAmenities?: string[];
  roomTypes?: Omit<HotelRoomTypeDTO, 'id' | 'hotelId'>[];
  rating?: number;
  reviewsCount?: number;
  isActive?: boolean;
}

export class HotelDTO {
  id!: number;
  name!: string;
  location!: string;
  city!: string;
  rating!: number;
  reviewsCount!: number;
  priceFrom!: number;
  image?: string;
  images!: string[];
  description!: string;
  hotelClass!: string;
  hotelStyle!: string[];
  propertyAmenities!: string[];
  coordinates!: HotelCoordinatesDTO;
  mapEmbed?: string;
  roomTypes!: HotelRoomTypeDTO[];
  createdAt!: Date;
  updatedAt!: Date;
}



export class HotelQueryDTO {
  city?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export class CheckAvailabilityDTO {
  checkInDate!: string;
  checkOutDate!: string;
  numberOfRooms!: number;
  numberOfGuests!: number;
}
