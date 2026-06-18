import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight, Quote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TourCard from "@/components/TourCard";
import { motion } from "framer-motion";
import { tourService } from "@/services/tourService";
import { reviewService } from "@/services/reviewService";
import type { Tour, Review, HotelReview } from '@/types';
import heroImage from "@/assets/hero-sri-lanka.jpg";

const Home = () => {
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([]);
  const [testimonials, setTestimonials] = useState<Array<Review | HotelReview>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get featured tours and reviews in parallel
        const [toursResponse, reviewsData] = await Promise.all([
          tourService.getTours({ featured: true, limit: 3 }), // Get only featured tours
          reviewService.getAllReviews({ limit: 10, minRating: 4 }) // Get well-rated reviews
        ]);

        // Set featured tours
        setFeaturedTours(toursResponse?.tours || []); // Access the tours array from the paginated response

        // Process and set testimonials
        if (reviewsData.items && reviewsData.items.length > 0) {
          const highRatedReviews = reviewsData.items
            .filter(review => {
              if ('rating' in review) {
                return (review as Review).rating >= 4 && review.status === 'approved';
              } else if ('overallRating' in review) {
                return (review as HotelReview).overallRating >= 4 && review.status === 'approved';
              }
              return false;
            })
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
          setTestimonials(highRatedReviews);
        } else {
          setTestimonials([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err?.message || 'Failed to load content. Please try again later.');
        
        // Handle authentication errors
        if (err?.response?.status === 401) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderLoadingState = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading amazing experiences...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Sri Lanka landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Discover Sri Lanka with{" "}
              <span className="bg-gradient-sunset bg-clip-text text-transparent">
                Smart Travel
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-200 mb-8"
            >
              Experience the pearl of the Indian Ocean through expertly curated tours.
              From ancient temples to pristine beaches, adventure awaits.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/tours">
                <Button size="lg" className="bg-gradient-sunset hover:shadow-glow text-lg px-8">
                  Explore Tours
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Featured Tours</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked experiences showcasing the best of Sri Lanka's natural beauty and rich heritage
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading featured tours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : featuredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TourCard tour={tour} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured tours available.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/tours">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow">
                View All Tours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

          {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">What Our Travelers Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real experiences from real travelers who discovered Sri Lanka with us
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading testimonials...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full shadow-card hover:shadow-glow transition-all">
                    <CardContent className="p-6 space-y-4">
                      <Quote className="h-8 w-8 text-primary opacity-50" />
                      <p className="text-sm text-muted-foreground italic">{testimonial.comment}</p>
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.userName}`}
                          alt={testimonial.userName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="font-semibold">{testimonial.userName}</div>
                          {/* <div className="text-xs text-muted-foreground">{testimonial.tourName}</div> */}
                          <div className="flex gap-1 mt-1">
                            {[...Array('rating' in testimonial ? testimonial.rating : testimonial.overallRating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No testimonials available yet.</p>
            </div>
          )}
        </div>
      </section>      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready for Your Sri Lankan Adventure?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Book your dream tour today and create memories that will last a lifetime
            </p>
            <Link to="/booking">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              >
                Book Your Tour Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;