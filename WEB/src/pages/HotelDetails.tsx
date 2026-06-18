import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Wifi, Car, Coffee, Waves, Dumbbell, Utensils, Loader2 } from 'lucide-react';
import { hotelService } from '@/services/hotelService';
import { reviewService } from '@/services/reviewService';
import type { Hotel, HotelReview } from '@/types';

const amenityIcons: Record<string, any> = {
  'Free High Speed Internet (WiFi)': Wifi,
  'Free parking': Car,
  'Free breakfast': Coffee,
  'Pool': Waves,
  'Fitness center': Dumbbell,
  'Restaurant': Utensils,
};

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<HotelReview[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [hotelData, reviewsData] = await Promise.all([
          hotelService.getHotelById(id), // Assuming this returns the hotel object directly
          reviewService.getHotelReviews(id) // Assuming this returns { data: [...] }
        ]);

        if (hotelData) {
          setHotel(hotelData); 
          // The review service returns an object, not an array directly.
          // We need to access the array within that object.
          const reviewsArray = (reviewsData as any)?.data || (reviewsData as any)?.reviews || [];
          setReviews(reviewsArray.filter((r: HotelReview) => r.status === 'approved'));
          setError(null);
        } else {
          setError('Hotel not found');
        }
      } catch (err) {
        console.error('Failed to fetch hotel details:', err);
        setError('Failed to load hotel details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading hotel details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error || 'Hotel not found'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const avgRatings = reviews.length > 0 ? {
    location: reviews.reduce((sum, r) => sum + r.locationRating, 0) / reviews.length,
    rooms: reviews.reduce((sum, r) => sum + r.roomsRating, 0) / reviews.length,
    value: reviews.reduce((sum, r) => sum + r.valueRating, 0) / reviews.length,
    cleanliness: reviews.reduce((sum, r) => sum + r.cleanlinessRating, 0) / reviews.length,
    service: reviews.reduce((sum, r) => sum + r.serviceRating, 0) / reviews.length,
    sleepQuality: reviews.reduce((sum, r) => sum + r.sleepQualityRating, 0) / reviews.length,
  } : null;

  const getMapUrl = () => {
    if (hotel.mapEmbed) {
      return hotel.mapEmbed;
    }
    if (hotel.coordinates && hotel.coordinates.lat && hotel.coordinates.lng) {
      const { lat, lng } = hotel.coordinates;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      
      
      <main className="flex-1">
        {/* Image Gallery */}
        <section className="container mx-auto px-4 py-8">
          {hotel.images && hotel.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[500px]">
              <div className="md:col-span-3 h-full">
                <img
                  src={`${API_BASE_URL}${hotel.images[selectedImage]}`}
                  alt={hotel.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                {hotel.images.slice(0, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={`${API_BASE_URL}${img}`}
                    alt={`${hotel.name} ${idx + 1}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-full h-[160px] object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                      selectedImage === idx ? 'ring-2 ring-primary' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* Hotel Info */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{hotel.location}</span>
                    </div>
                  </div>
                  <Badge className="text-lg px-4 py-2">{hotel.hotelClass}</Badge>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {(hotel.hotelStyle ?? []).map(style => (
                    <Badge key={style} variant="secondary">{style}</Badge>
                  ))}
                </div>
              </div>

              {/* Ratings */}
              {avgRatings && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-8 w-8 fill-primary text-primary" />
                        <span className="text-4xl font-bold">{hotel.rating}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Excellent</p>
                        <p className="text-sm text-muted-foreground">({hotel.reviewsCount} reviews)</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Location</span>
                        <span className="font-semibold">{avgRatings.location.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Rooms</span>
                        <span className="font-semibold">{avgRatings.rooms.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Value</span>
                        <span className="font-semibold">{avgRatings.value.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cleanliness</span>
                        <span className="font-semibold">{avgRatings.cleanliness.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Service</span>
                        <span className="font-semibold">{avgRatings.service.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Sleep Quality</span>
                        <span className="font-semibold">{avgRatings.sleepQuality.toFixed(1)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* About */}
              <div>
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Property Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(hotel.propertyAmenities ?? []).map(amenity => {
                    const Icon = amenityIcons[amenity];
                    return (
                      <div key={amenity} className="flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5 text-primary" />}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Room Types */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Room Types</h2>
                <div className="space-y-4">
                  {(hotel.roomTypes ?? []).map(room => (
                    <Card key={room.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={room.image ? `${API_BASE_URL}${room.image}` : 'https://via.placeholder.com/128x128?text=No+Image'}
                            alt={room.name}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{room.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{room.description}</p>
                            <p className="text-sm text-muted-foreground mb-2">Max guests: {room.maxGuests}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-primary">${room.price}/night</span>
                              <Button
                                onClick={() => navigate(`/hotels/${hotel.id}/booking?roomType=${room.id}`)}
                                disabled={!room.available}
                              >
                                {room.available ? 'Book Now' : 'Not Available'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{review.userName}</h4>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="font-semibold">{review.overallRating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{review.date}</p>
                            <p className="text-sm">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="text-sm text-muted-foreground mb-1">From</div>
                    <div className="text-3xl font-bold text-primary">${hotel.priceFrom}</div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>

                  <Button
                    className="w-full mb-4"
                    size="lg"
                    onClick={() => navigate(`/hotels/${hotel.id}/booking`)}
                  >
                    Check Availability
                  </Button>

                  {/* Map */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Location</h3>
                    {hotel.mapEmbed ? (
                      <div
                        className="w-full h-[200px] [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:rounded-lg"
                        dangerouslySetInnerHTML={{ __html: hotel.mapEmbed }}
                      />
                    ) : getMapUrl() ? (
                      <iframe
                        src={getMapUrl() as string}
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        className="rounded-lg"
                      ></iframe>
                    ) : (
                      <div className="w-full h-[200px] bg-muted rounded-lg flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

     
    </div>
  );
};

export default HotelDetails;
