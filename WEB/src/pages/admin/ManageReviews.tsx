import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { reviewService } from '@/services/reviewService';
import type { Review, HotelReview } from '@/types';

type ReviewStatus = 'approved' | 'pending' | 'rejected';
type CombinedReview = (Review | HotelReview) & {
  type: 'tour' | 'hotel';
  serviceName: string; // Common property for both types
};

const ManageReviews = () => {
  const [reviews, setReviews] = useState<CombinedReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<CombinedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all reviews from the API
        const response = await reviewService.getAllReviews();
        
        // Map reviews to their respective types
        const allReviews = response.items.map(review => {
          if ('rating' in review) {
            // This is a tour review
            return {
              ...review,
              type: 'tour' as const,
              serviceName: review.tourName,
            };
          } else {
            // This is a hotel review
            return {
              ...review,
              type: 'hotel' as const,
              serviceName: review.hotelName,
            };
          }
        });

        // Sort reviews by date
        allReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setReviews(allReviews);
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
        setError(err?.response?.data?.message || 'Failed to load reviews. Please try again later.');
        toast.error('Failed to load reviews');
        
        // Handle unauthorized access
        if (err?.response?.status === 401) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we're initialized
    fetchReviews();
  }, []);

  const handleStatusChange = async (id: number, newStatus: ReviewStatus) => {
    try {
      // Update the review
      const updatedReview = await reviewService.updateReview(id.toString(), { status: newStatus });
      
      // Update local state with the full updated review data
      setReviews(reviews.map(r => r.id === id ? { 
        ...r, 
        ...updatedReview,
        // Preserve the type and serviceName from the original review
        type: r.type,
        serviceName: r.serviceName
      } : r));

      if (selectedReview?.id === id) {
        setSelectedReview(prev => prev ? {
          ...prev,
          ...updatedReview,
          type: prev.type,
          serviceName: prev.serviceName
        } : null);
      }

      toast.success(`Review status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update review status:', err);
      toast.error(err?.response?.data?.message || 'Failed to update review status');
      
      // Handle unauthorized access
      if (err?.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Manage Reviews</h1>
        <Card className="shadow-card">
          <CardHeader><CardTitle>All Reviews</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Tour</TableHead>
                    <TableHead className="hidden sm:table-cell">Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-destructive">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>#{review.id}</TableCell>
                        <TableCell>{review.userName}</TableCell>
                        <TableCell className="hidden md:table-cell">{review.serviceName}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          ★ {review.type === 'tour' 
                            ? (review as Review).rating 
                            : (review as HotelReview).overallRating}
                        </TableCell>
                        <TableCell>
                          <Badge variant={review.status === 'approved' ? 'default' : review.status === 'pending' ? 'secondary' : 'destructive'}>
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => setSelectedReview(review)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {review.type === 'tour' ? 'Tour' : 'Hotel'} Review #{review.id}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedReview && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm text-muted-foreground">User</h4>
                                      <p>{selectedReview.userName}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm text-muted-foreground">
                                        {selectedReview.type === 'tour' ? 'Tour' : 'Hotel'}
                                      </h4>
                                      <p>{selectedReview.serviceName}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm text-muted-foreground">Rating</h4>
                                      <p>★ {selectedReview.type === 'tour'
                                        ? `${(selectedReview as Review).rating}/5`
                                        : `${(selectedReview as HotelReview).overallRating}/5`}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm text-muted-foreground">Date</h4>
                                      <p>{selectedReview.date}</p>
                                    </div>
                                  </div>
                                  {selectedReview.type === 'hotel' && (
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-sm text-muted-foreground">Location Rating</h4>
                                        <p>★ {(selectedReview as HotelReview).locationRating}/5</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm text-muted-foreground">Cleanliness Rating</h4>
                                        <p>★ {(selectedReview as HotelReview).cleanlinessRating}/5</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm text-muted-foreground">Service Rating</h4>
                                        <p>★ {(selectedReview as HotelReview).serviceRating}/5</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm text-muted-foreground">Value Rating</h4>
                                        <p>★ {(selectedReview as HotelReview).valueRating}/5</p>
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="text-sm text-muted-foreground">Comment</h4>
                                    <p className="bg-muted p-4 rounded-lg">{selectedReview.comment}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm text-muted-foreground mb-2">Status</h4>
                                    <Select 
                                      value={selectedReview.status} 
                                      onValueChange={(v: ReviewStatus) => handleStatusChange(selectedReview.id, v)}
                                    >
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ManageReviews;
