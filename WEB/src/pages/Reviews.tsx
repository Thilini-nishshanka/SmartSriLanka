import { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { reviewService } from "@/services/reviewService";
import { tourService } from "@/services/tourService";
import type { Review, HotelReview, Tour } from "@/types";

const Reviews = () => {
  const { toast } = useToast();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviews, setReviews] = useState<(Review | HotelReview)[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tourId: '',
    rating: 5,
    comment: ''
    
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reviewsData, toursData] = await Promise.all([
          reviewService.getAllReviews({ status: 'approved' }),
          tourService.getTours()
        ]);
        setReviews(reviewsData.items);
        setTours(toursData.tours ?? []); // Access the tours array, fallback to empty array
        setError(null);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const review = await reviewService.createReview({
        tourId: formData.tourId,
        rating: formData.rating,
        comment: formData.comment,
      });
      
      setReviews(prev => [review, ...prev]);
      setIsReviewOpen(false);
      setFormData({ tourId: '', rating: 5, comment: '' });
      
      toast({
        title: "Review Submitted!",
        description: "Thank you for sharing your experience with us.",
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

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Real experiences from travelers who explored Sri Lanka with Smart Travel
          </p>
          <Button onClick={() => setIsReviewOpen(true)} className="bg-gradient-primary">
            <MessageSquare className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
        </motion.div>

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No reviews found. Be the first to write one!</p>
          </div>
        )}

        <div className="space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="shadow-card hover:shadow-glow transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-14 h-14 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-lg">{review.userName}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {new Date(review.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 'rating' in review ? review.rating : (review as HotelReview).overallRating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          ))}
                          <span className="text-sm text-muted-foreground ml-1">
                            {'rating' in review ? review.rating : (review as HotelReview).overallRating}
                            /5
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {'tourId' in review ? review.tourName : (review as HotelReview).hotelName}
                        </div>
                      </div> 
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
              <Label htmlFor="tourName">Tour Name</Label>
              <Select 
                value={formData.tourId} 
                onValueChange={value => setFormData(prev => ({ ...prev, tourId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the tour you took" />
                </SelectTrigger>
                <SelectContent>
                  {tours.map((tour) => (
                    <SelectItem key={tour.id} value={String(tour.id)}>
                      {tour.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <select 
                id="rating" 
                className="w-full p-2 border rounded-md" 
                value={formData.rating}
                onChange={e => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
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
                rows={5} 
                placeholder="Share your experience..." 
                value={formData.comment}
                onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
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

export default Reviews;