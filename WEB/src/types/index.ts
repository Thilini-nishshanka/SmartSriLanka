// ========================================
// Authentication Types
// ========================================
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  phone: string;
  country: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

// ========================================
// Tour Types
// ========================================

export interface Tour {
  id: number;
  name: string;
  category: string;
  location: string;
  duration: string;
  price: number; // Decimals from Prisma are often serialized as strings
  rating: number;
  reviewsCount: number;
  image?: string;
  images: string[];
  description: string;
  highlights: string[];
  included: string[];
  numberOfDays: number;
  mapEmbed?: string;
  itinerary: DayItinerary[];
}

export interface TourLocation {
  lat: number;
  lng: number;
}

export interface ItineraryStop {
  name: string;
  duration: string;
  description?: string;
  admissionIncluded?: boolean;
  location?: TourLocation;
}

export interface DayItinerary {
  day: number;
  title: string;
  stops: ItineraryStop[];
  meals?: string[];
  accommodation?: string;
}

// ========================================
// Booking Types
// ========================================

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  tour: string;
  tourId?: number;
  tourName?: string;
  userName?: string;
  guests: number;
  date: string;
  totalPrice?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: string;
  bookingDate?: string;
}

export interface UserBooking {
  id: string;
  tour: string;
  date: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  bookingDate: string;
}

// ========================================
// Review Types
// ========================================

export interface Review {
  id: number;
  tourId: number;
  tourName: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

// ========================================
// Payment Types
// ========================================

export interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  clientSecret: string;
  bookingId: string;
}

export interface CardDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  country: string;
}

// ========================================
// Component Props Types
// ========================================

export interface TourCardProps {
  tour: Tour;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export interface TourFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour?: Tour;
  onSave: (tour: Tour) => void;
}

// ========================================
// Chatbot Types
// ========================================

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isError?: boolean; // This property is optional
}

// ========================================
// AR Image Recognition Types
// ========================================

export interface LocationDetails {
  name: string;
  description: string;
  history: string;
  bestTime: string;
  activities: string[];
  tips: string[];
}

// ========================================
// Hotel Types
// ========================================

export interface Hotel {
  id: number;
  name: string;
  location: string;
  city: string;
  rating: number;
  reviewsCount: number;
  priceFrom: number;
  image?: string;
  images: string[];
  description: string;
  hotelClass: string;
  hotelStyle: string[];
  propertyAmenities: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  mapEmbed?: string;
  roomTypes: HotelRoomType[];
  createdAt: string;
  updatedAt: string;
}

export interface HotelRoomType {
  id: number;
  hotelId: number;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  features: string[];
  image?: string;
  available: boolean;
}

export interface HotelBooking {
  id: string;
  hotelId: number;
  hotelName: string;
  roomTypeId: number;
  roomTypeName: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  userPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  numberOfGuests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingDate: string;
}

export interface HotelReview {
  id: number;
  hotelId: number;
  hotelName: string;
  userName: string;
  userAvatar: string;
  overallRating: number;
  locationRating: number;
  roomsRating: number;
  valueRating: number;
  cleanlinessRating: number;
  serviceRating: number;
  sleepQualityRating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface HotelCardProps {
  hotel: Hotel;
}

export interface HotelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel?: Hotel;
  onSave: (hotel: Hotel) => void;
}
