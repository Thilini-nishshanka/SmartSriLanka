// API endpoint paths for backend integration

export const API_PATHS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Tour endpoints
  TOURS: {
    LIST: '/tours',
    DETAIL: (id: string) => `/tours/${id}`,
    CREATE: '/tours',
    UPDATE: (id: string) => `/tours/${id}`,
    DELETE: (id: string) => `/tours/${id}`,
    CATEGORIES: '/tours/categories',
  },
  
  // Hotel endpoints
  HOTELS: {
    LIST: '/hotels',
    DETAIL: (id: string) => `/hotels/${id}`,
    CREATE: '/hotels',
    UPDATE: (id: string) => `/hotels/${id}`,
    DELETE: (id: string) => `/hotels/${id}`,
    CHECK_AVAILABILITY: (id: string) => `/hotels/${id}/availability`,
  },
  
  // Booking endpoints
  BOOKINGS: {
    LIST: '/bookings',
    DETAIL: (id: string) => `/bookings/${id}`,
    CREATE: '/bookings',
    UPDATE: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    USER_BOOKINGS: '/bookings/me',
  },
  
  // Hotel Booking endpoints
  HOTEL_BOOKINGS: {
    LIST: '/hotel-bookings',
    DETAIL: (id: string) => `/hotel-bookings/${id}`,
    CREATE: '/hotel-bookings',
    UPDATE: (id: string) => `/hotel-bookings/${id}`,
    CANCEL: (id: string) => `/hotel-bookings/${id}/cancel`,
    USER_BOOKINGS: '/hotel-bookings/user',
  },
  
  // Profile endpoints
  PROFILES: {
    ME: '/profiles/me',
    UPDATE_ME: '/profiles/me',
  },

  
  REVIEWS: {
    LIST: '/reviews',
    TOUR_REVIEWS: (tourId: number | string) => `/reviews/tour/${tourId}`,
    HOTEL_REVIEWS: (hotelId: number | string) => `/reviews/hotel/${hotelId}`,
    CREATE: `/reviews`,
    UPDATE: (id: number | string) => `/reviews/${id}`,
    DELETE: (id: number | string) => `/reviews/${id}`,
  },


  
  // Payment endpoints
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    REFUND: (id: string) => `/payments/${id}/refund`,
  },

  // Policy endpoints
  POLICIES: {
    LIST: '/policies',
    DETAIL: (slug: string) => `/policies/${slug}`,
    UPDATE: (slug: string) => `/policies/${slug}`,
  },
  
  // Analytics endpoints (Admin)
  ANALYTICS: {
    DASHBOARD_SUMMARY: '/analytics/dashboard-summary',
    INCOME: '/analytics/income',
    INCOME_SUMMARY: '/analytics/income-summary',
    BOOKINGS: '/analytics/bookings',
  },

  // Upload endpoints
  UPLOAD: {
    IMAGE: '/upload/image',
  },

  // Chatbot endpoints
  CHATBOT: {
    CHAT: '/chatbot/chat',
  },

  // Recognition endpoints
  RECOGNIZE: {
    IMAGE: '/recognize/image',
  },

  // Contact endpoints
  CONTACT: {
    SEND: '/contact',
  },
} as const;
