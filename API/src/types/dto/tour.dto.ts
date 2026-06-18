export class TourLocationDTO {
  lat!: number;
  lng!: number;
}

export class ItineraryStopDTO {
  name!: string;
  duration!: string;
  description?: string;
  admissionIncluded?: boolean;
  location?: TourLocationDTO;
}

export class DayItineraryDTO {
  day!: number;
  title!: string;
  stops!: ItineraryStopDTO[];
  meals?: string[];
  accommodation?: string;
}

export class CreateTourDTO {
  name!: string;
  category!: string;
  location!: string;
  duration!: string;
  price!: number;
  description!: string;
  numberOfDays!: number;
  mainImage?: string;
  mapEmbed?: string;
  images?: string[];
  highlights?: string[];
  included?: string[];
  itinerary?: DayItineraryDTO[];
}

export class UpdateTourDTO {
  name?: string;
  category?: string;
  location?: string;
  duration?: string;
  price?: number;
  description?: string;
  numberOfDays?: number;
  mainImage?: string;
  mapEmbed?: string;
  images?: string[];
  highlights?: string[];
  included?: string[];
  itinerary?: DayItineraryDTO[];
  isActive?: boolean;
}

export class TourDTO {
  id!: number;
  name!: string;
  category!: string;
  location!: string;
  duration!: string;
  price!: number;
  rating!: number;
  reviewsCount!: number;
  image?: string;
  images!: string[];
  description!: string;
  highlights!: string[];
  included!: string[];
  numberOfDays!: number;
  mapEmbed?: string;
  itinerary!: DayItineraryDTO[];
  createdAt!: Date;
  updatedAt!: Date;
}

export class TourQueryDTO {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  featured?: boolean;
}
