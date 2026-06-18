import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, Star, Check, ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { tourService } from "@/services/tourService";
import { reviewService } from "@/services/reviewService";
import type { Tour, Review } from "@/types";
import { getImageUrl } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: ''
  });
  const mapIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [tourData, reviewsData] = await Promise.all([
          tourService.getTourById(id),
          reviewService.getTourReviews(id)
        ]);

        if (tourData) {
          setTour(tourData);
          console.log("✅ Tour Data Received from API:", tourData); // <-- ADD THIS LINE
          setReviews(reviewsData.items);
          setError(null);
        } else {
          setError('Tour not found');
        }
      } catch (err) {
        console.error('Failed to fetch tour details:', err);
        setError('Failed to load tour details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{error || 'Tour Not Found'}</h1>
          <Link to="/tours">
            <Button>Back to Tours</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    navigate('/booking', { state: { tourId: tour.id } });
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const review = await reviewService.createReview({
        tourId: id,
        rating: reviewFormData.rating,
        comment: reviewFormData.comment
      });

      setReviews(prev => [review as Review, ...prev]);
      setIsReviewOpen(false);
      setReviewFormData({ rating: 5, comment: '' });
      
      toast({
        title: "Review Submitted!",
        description: "Thank you for sharing your experience.",
      });
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      if (err.response?.status === 409) {
        toast({
          title: "Already Reviewed",
          description: "You have already submitted a review for this tour.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit review. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Calculate rating from approved reviews
  const approvedReviews = reviews.filter(review => review.status === 'approved');
  const reviewsCount = approvedReviews.length;
  const averageRating = reviewsCount > 0 
    ? Math.floor(approvedReviews.reduce((acc, review) => acc + review.rating, 0) / reviewsCount)
    : 0;



  const handleStopClick = (stopIndex: number) => {
    setSelectedStopIndex(stopIndex);
    // We only need to set the state. The component will re-render and `getCurrentMapUrl` will generate the correct URL.
  };

  // Get current map URL based on selected stop or default
  const getCurrentMapUrl = () => {
    const selectedDayData = tour?.itinerary?.find((d) => d.day === selectedDay);
    const stopsWithLocation = selectedDayData?.stops.filter((s) => s.location?.lat && s.location?.lng) || [];

    // If a specific stop is selected, show only that stop.
    if (selectedStopIndex !== null && selectedDayData?.stops[selectedStopIndex]?.location) {
      const stop = selectedDayData.stops[selectedStopIndex];
      // Create a URL for a single marker, zoomed in.
      const bbox = `${stop.location!.lng - 0.01},${stop.location!.lat - 0.01},${stop.location!.lng + 0.01},${stop.location!.lat + 0.01}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${stop.location!.lat},${stop.location!.lng}`;
    }

    // If no specific stop is selected, show all stops for the day.
    if (stopsWithLocation.length > 0) {
      // Create markers for each stop with a number
      const markers = stopsWithLocation
        .map((stop) => `marker=${stop.location!.lat},${stop.location!.lng}`)
        .join('&');

      // Calculate a bounding box that encompasses all stops
      const latitudes = stopsWithLocation.map((s) => s.location!.lat);
      const longitudes = stopsWithLocation.map((s) => s.location!.lng);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      // Add some padding to the bounding box
      const latPadding = (maxLat - minLat) * 0.1 || 0.02;
      const lngPadding = (maxLng - minLng) * 0.1 || 0.02;

      const bbox = [minLng - lngPadding, minLat - latPadding, maxLng + lngPadding, maxLat + latPadding].join(',');

      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&${markers}`;
    }

    // Fallback to a default map of Sri Lanka if no stops have locations.
    const defaultBbox = '79.6,5.9,81.9,9.9'; // A bounding box covering Sri Lanka
    return `https://www.openstreetmap.org/export/embed.html?bbox=${defaultBbox}&layer=mapnik`;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link to="/tours">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tours
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-card">
                <img
                  src={getImageUrl(tour.images && tour.images.length > 0 ? tour.images[selectedImageIndex] : tour.image)}
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                  {tour.category}
                </Badge>
              </div>
              {tour.images && tour.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {tour.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                      }`}
                    > 
                      <img src={getImageUrl(img)} alt={`${tour.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Tour Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold mb-4">{tour.name}</h1>
              <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {tour.location}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {tour.duration}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">{averageRating}</span>
                  <span>({reviewsCount} reviews)</span>
                </div>
              </div>
              <p className="text-lg leading-relaxed">{tour.description}</p>
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">Tour Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tour.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tour.included.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
                <Tabs defaultValue="day-1" className="w-full" onValueChange={(value) => setSelectedDay(Number(value.split('-')[1]))}>
                  <TabsList className="w-full flex-wrap h-auto">
                    {tour.itinerary.map((day) => (
                      <TabsTrigger key={day.day} value={`day-${day.day}`} className="flex-1 min-w-[100px]">
                        Day {day.day}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {tour.itinerary.map((day) => (
                    <TabsContent key={day.day} value={`day-${day.day}`} className="mt-4">
                      <Card>
                        <CardContent className="p-6 space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-primary mb-2">{day.title}</h3>
                          </div>
                          
                          {day.stops && day.stops.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="font-semibold">Stops</h4>
                              {day.stops.map((stop, index) => (
                                <div key={index} className="border-l-2 border-primary pl-4 space-y-2">
                                  <div className="flex items-start gap-2">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold">{stop.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Duration: {stop.duration}
                                        {stop.admissionIncluded && ' • Admission included'}
                                      </div>
                                      {stop.description && (
                                        <p className="text-sm mt-1">{stop.description}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {day.meals && day.meals.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Meals Included</h4>
                              <p className="text-muted-foreground">{day.meals.join(', ')}</p>
                            </div>
                          )}

                          {day.accommodation && (
                            <div>
                              <h4 className="font-semibold mb-2">Accommodation</h4>
                              <p className="text-muted-foreground">{day.accommodation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            )}

            {/* Map with Day Markers */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-4">Tour Route Map - Day {selectedDay}</h2>
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <div className="h-96 rounded-lg overflow-hidden mb-4">
                      <iframe
                        ref={mapIframeRef}
                        key={getCurrentMapUrl()} // Add key to force re-render on src change
                        src={getCurrentMapUrl()}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title={`Map of Day ${selectedDay} stops`}
                        className="rounded-lg"
                      />
                    </div>
                    
                    {/* Day stops list - Clickable */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Day {selectedDay} Stops:</h4>
                      {tour.itinerary
                        .find((d) => d.day === selectedDay)
                        ?.stops.map((stop, index) => (
                          <button
                            key={index}
                            onClick={() => handleStopClick(index)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-md ${
                              selectedStopIndex === index
                                ? 'bg-primary/10 border-2 border-primary'
                                : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              selectedStopIndex === index
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted-foreground/20 text-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">{stop.name}</div>
                              <div className="text-xs text-muted-foreground">{stop.duration}</div>
                            </div>
                            {selectedStopIndex === index && (
                              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
                <Button onClick={() => setIsReviewOpen(true)} variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Review
                </Button>
              </div>
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userName}`}
                            alt={review.userName}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-semibold">{review.userName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(review.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this tour!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <Card className="shadow-card">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      ${tour.price}
                    </div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>
                  <Button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-sunset hover:shadow-glow"
                    size="lg"
                  >
                    Book Now
                  </Button>
                  <div className="pt-4 border-t space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{tour.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{tour.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium">{tour.rating}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReview} className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <select 
                id="rating" 
                className="w-full p-2 border rounded-md"
                value={reviewFormData.rating}
                onChange={(e) => setReviewFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                required
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Good</option>
                <option value="2">2 Stars - Fair</option>
                <option value="1">1 Star - Poor</option>
              </select>
            </div>
            <div>
              <Label htmlFor="comment">Your Review</Label>
              <Textarea 
                id="comment" 
                rows={4}
                value={reviewFormData.comment}
                onChange={(e) => setReviewFormData(prev => ({ ...prev, comment: e.target.value }))}
                required 
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary">
              Submit Review
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourDetails;