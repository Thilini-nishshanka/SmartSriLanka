import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, User, Calendar, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { profileService } from '@/services/profileService';
import { bookingService } from '@/services/bookingService'; // Import the new booking service
import type { User as UserType, UserBooking } from '@/types'; // Alias User from types to avoid conflict

type FormInputs = {
  name: string;
  phone: string;
  country: string;
};

const UserAccount = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null); // Use UserType for profile data
  const [bookings, setBookings] = useState<UserBooking[]>([]); // State for actual bookings
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormInputs>();

  // Effect to fetch user profile and bookings
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const profileData = await profileService.getMyProfile();
        setUser(profileData);
        // Reset form with fetched data
        reset({
          name: profileData.name || '',
          phone: profileData.phone || '',
          country: profileData.country || '',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load your profile. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const bookingsData = await bookingService.getUserBookings();
        setBookings(bookingsData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load your bookings. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchProfile();
    fetchBookings();
  }, [reset, toast]); // Dependencies for useEffect

  // Handler for profile form submission
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      setIsSubmitting(true);
      const updatedUser = await profileService.updateMyProfile(data);
      setUser(updatedUser);
      reset(data); // Resets the form's dirty state after successful update
      toast({
        title: 'Success!',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function for badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-80px)]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProfile ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...register('name', { required: 'Name is required' })} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user?.email || ''} disabled />
                        <p className="text-sm text-muted-foreground">Email address cannot be changed.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" {...register('phone')} placeholder="Your phone number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" {...register('country')} placeholder="Your country" />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Type</Label>
                        <div>
                          <Badge variant="outline">{user?.role}</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Member Since</Label>
                        <p className="pt-2">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button type="submit" disabled={!isDirty || isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't made any bookings yet</p>
                    <Button>Browse Tours</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Tour</TableHead>
                          <TableHead className="hidden md:table-cell">Tour Date</TableHead>
                          <TableHead className="hidden sm:table-cell">Guests</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">#{booking.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{booking.tour}</div>
                                <div className="text-xs text-muted-foreground md:hidden">{booking.date}</div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{booking.date}</TableCell>
                            <TableCell className="hidden sm:table-cell">{booking.guests}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => setSelectedBooking(booking)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Booking Details - #{booking.id}</DialogTitle>
                                  </DialogHeader>
                                  {selectedBooking && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">Tour</h4>
                                          <p className="text-lg">{selectedBooking.tour}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">Tour Date</h4>
                                          <p className="text-lg">{selectedBooking.date}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">Booking Date</h4>
                                          <p className="text-lg">{selectedBooking.bookingDate}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">Number of Guests</h4>
                                          <p className="text-lg">{selectedBooking.guests} guests</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">Total Price</h4>
                                          <p className="text-lg font-bold">${selectedBooking.totalPrice}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                                          <Badge variant={getStatusColor(selectedBooking.status)} className="text-sm">
                                            {selectedBooking.status.toUpperCase()}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="p-4 bg-muted rounded-lg">
                                        <h4 className="font-semibold mb-2">Booking Information</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedBooking.status === 'confirmed' && 
                                            "Your booking is confirmed! We'll send you a reminder closer to your tour date."}
                                          {selectedBooking.status === 'pending' && 
                                            "Your booking is pending confirmation. We'll notify you once it's confirmed."}
                                          {selectedBooking.status === 'cancelled' && 
                                            "This booking has been cancelled. If you have any questions, please contact support."}
                                        </p>
                                      </div>
                                      {/* Show Cancel button only for pending bookings */}
                                      {/* {selectedBooking.status === 'pending' && (
                                        <div className="flex gap-2 pt-4 border-t">
                                          <Button variant="destructive">Cancel Booking</Button>
                                        </div>
                                      )} */}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserAccount;
