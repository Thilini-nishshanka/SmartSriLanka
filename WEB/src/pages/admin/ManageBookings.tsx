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
import { bookingService } from '@/services/bookingService';
import type { Booking, HotelBooking } from '@/types';

type BookingStatus = 'confirmed' | 'pending' | 'cancelled';
type CombinedBooking = (Booking | HotelBooking) & {
  type: 'tour' | 'hotel';
  displayName: string;
  displayDate: string;
  displayAmount: string;
  displayService: string;
};

const BookingDetailsDialog = ({ 
  booking,
  onStatusChange
}: { 
  booking: CombinedBooking;
  onStatusChange: (id: string, status: BookingStatus) => Promise<void>;
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="icon">
        <Eye className="h-4 w-4" />
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {booking.type === 'tour' ? 'Tour' : 'Hotel'} Booking #{booking.id}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm text-muted-foreground">Customer</h4>
            <p>{booking.displayName}</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground">
              {booking.type === 'tour' ? 'Tour' : 'Hotel'}
            </h4>
            <p>{booking.displayService}</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground">
              {booking.type === 'tour' ? 'Date' : 'Check-in'}
            </h4>
            <p>{booking.displayDate}</p>
          </div>
          {booking.type === 'hotel' && (
            <div>
              <h4 className="text-sm text-muted-foreground">Check-out</h4>
              <p>{(booking as HotelBooking).checkOutDate}</p>
            </div>
          )}
          <div>
            <h4 className="text-sm text-muted-foreground">Guests</h4>
            <p>
              {booking.type === 'tour' 
                ? (booking as Booking).guests
                : (booking as HotelBooking).numberOfGuests}
            </p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground">Amount</h4>
            <p className="font-bold">{booking.displayAmount}</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground">Contact</h4>
            <p>
              {booking.type === 'tour'
                ? (booking as Booking).email
                : (booking as HotelBooking).userEmail}
            </p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground">Phone</h4>
            <p>
              {booking.type === 'tour'
                ? (booking as Booking).phone
                : (booking as HotelBooking).userPhone}
            </p>
          </div>
          <div className="col-span-2">
            <h4 className="text-sm text-muted-foreground mb-2">Status</h4>
            <Select 
              value={booking.status} 
              onValueChange={(v: BookingStatus) => onStatusChange(booking.id, v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="pending">Pending</SelectItem> */}
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const ManageBookings = () => {
  const [bookings, setBookings] = useState<CombinedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both tour and hotel bookings
        const [tourBookingsResponse, hotelBookingsResponse] = await Promise.all([
          bookingService.getTourBookings().catch(err => {
            if (err?.response?.status === 404) return [];
            throw err;
          }),
          bookingService.getHotelBookings().catch(err => {
            if (err?.response?.status === 404) return [];
            throw err;
          })
        ]);

        const tourBookings = tourBookingsResponse || [];
        const hotelBookings = hotelBookingsResponse || [];

        // Combine and transform the bookings
        const transformedTourBookings = tourBookings.map((booking: Booking) => ({
          ...booking,
          type: 'tour' as const,
          displayName: booking.name,
          displayDate: booking.date,
          displayAmount: `$${booking.amount}`,
          displayService: booking.tour,
        }));

        const transformedHotelBookings = hotelBookings.map((booking: HotelBooking) => ({
          ...booking,
          type: 'hotel' as const,
          displayName: booking.userName || 'Guest',
          displayDate: booking.checkInDate,
          displayAmount: `$${booking.totalPrice}`,
          displayService: `${booking.hotelName} - ${booking.roomTypeName}`,
        }));

        // Combine and sort by date
        const allBookings = [...transformedTourBookings, ...transformedHotelBookings]
          .sort((a, b) => new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime());
        
        setBookings(allBookings);
      } catch (error: any) {
        console.error('Failed to fetch bookings:', error);
        if (error?.response?.status === 404) {
          setBookings([]);
        } else {
          setError(error?.response?.data?.message || 'Failed to load bookings. Please try again later.');
          setBookings([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      const booking = bookings.find(b => b.id === id);
      if (!booking) return;

      // Update booking based on type
      if (booking.type === 'tour') {
        await bookingService.updateTourBooking(id, { status: newStatus });
      } else {
        await bookingService.updateHotelBooking(id, { status: newStatus });
      }

      // Update local state
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
      
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update booking status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update booking status. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Service</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-destructive">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>#{booking.id}</TableCell>
                        <TableCell>{booking.displayName}</TableCell>
                        <TableCell className="hidden md:table-cell">{booking.displayService}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <BookingDetailsDialog 
                            booking={booking}
                            onStatusChange={handleStatusChange}
                          />
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

export default ManageBookings;
