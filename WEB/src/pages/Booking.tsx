import { useState, useEffect } from "react";
import { Calendar, Users, Mail, Phone, User, Loader2, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import StripePaymentForm from "@/components/StripePaymentForm";
import { tourService } from "@/services/tourService";
import { bookingService } from "@/services/bookingService";
import type { Tour } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const Booking = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ clientSecret: string; bookingId: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<{
    tour: Tour;
    totalPrice: number;
  } | null>(null);

  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tourId: "",
    guests: "1",
    date: "",
  });

  useEffect(() => {
    const fetchTours = async () => {
      try {
        // Fetch ALL tours for the dropdown by setting a high limit
        const response = await tourService.getTours({ limit: 1000 });
        setTours(response.tours || []); // Correctly access the 'tours' array
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch tours. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingTours(false);
      }
    };

    fetchTours();
  }, [toast]);

  useEffect(() => {
    if (location.state?.tourId) {
      setFormData((prev) => ({ ...prev, tourId: String(location.state.tourId) }));
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Use a type-insensitive comparison to prevent mismatches (e.g., '1' vs 1)
    const currentTour = tours.find((t) => String(t.id) === String(formData.tourId));
    if (!currentTour) {
      toast({ title: "Error", description: "Please select a valid tour.", variant: "destructive" });
      setIsProcessing(false);
      return;
    }

    try {
      const response = await bookingService.createBookingAndPaymentIntent({
        ...formData,
        guests: Number(formData.guests),
        date: new Date(formData.date).toISOString(), // Ensure date is in a valid format
      });
      // Lock in the booking details for the payment form
      setBookingSummary({ tour: currentTour, totalPrice: Number(currentTour.price) * Number(formData.guests) });
      setPaymentInfo(response);
      setShowPayment(true);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Could not initiate the booking process. Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setShowSuccessModal(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      tourId: formData.tourId, // Keep tour selected
      guests: "1",
      date: "",
    });
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    // Optionally, you could add logic here to cancel the pending booking on the backend.
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedTour = tours.find((t) => t.id === Number(formData.tourId));

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const imageUrl = selectedTour?.image ? `${API_BASE_URL}${selectedTour.image}` : '/placeholder.jpg';

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Book Your Adventure</h1>
          <p className="text-lg text-muted-foreground">
            Fill out the form below and we'll confirm your booking within 24 hours
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showPayment ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Form */}
                <div className="lg:col-span-2">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="guests">Number of Guests *</Label>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="guests"
                                name="guests"
                                type="number"
                                min="1"
                                value={formData.guests}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="tourId">Select Tour *</Label>
                            <select
                              id="tourId"
                              name="tourId"
                              value={formData.tourId}
                              onChange={handleChange}
                              className="w-full p-2 border rounded-md bg-background"
                              required
                            >
                              <option value="">Choose a tour...</option>
                              {tours.map((tour) => (
                                <option key={tour.id} value={tour.id}>
                                  {tour.name} - ${Number(tour.price)} per person
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="date">Preferred Date *</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full bg-gradient-sunset hover:shadow-glow"
                        >
                          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Booking Summary */}
                <div className="lg:col-span-1">
                  <Card className="shadow-card sticky top-24">
                    <CardHeader>
                      <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTour ? (
                        <>
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={selectedTour.description}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{selectedTour.name}</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Price per person</span>
                                <span className="font-medium">${Number(selectedTour.price)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Guests</span>
                                <span className="font-medium">{formData.guests}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="font-semibold">Total</span>
                                <span className="font-bold text-primary text-lg">
                                  ${Number(selectedTour.price) * Number(formData.guests)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Select a tour to see booking summary
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg mx-auto"
            >
              {paymentInfo && bookingSummary && (
                <StripePaymentForm
                  clientSecret={paymentInfo.clientSecret}
                  bookingId={paymentInfo.bookingId}
                  amount={bookingSummary.totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <PartyPopper className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your payment was successful. Your adventure awaits! You can view your booking details in your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full" onClick={() => navigate('/account')}>
              Go to My Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Booking;
