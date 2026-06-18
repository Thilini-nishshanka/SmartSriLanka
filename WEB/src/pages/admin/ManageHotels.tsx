import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Star, MapPin, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { hotelService } from '@/services/hotelService';
import type { Hotel } from '@/types';
import AddHotelForm from '@/components/admin/AddHotelForm';

const ManageHotels = () => {
  const { toast } = useToast();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hotelService.getHotels({
          search: searchTerm,
        });
        setHotels(data.hotels);
      } catch (error) {
        console.error('Failed to fetch hotels:', error);
        setError('Failed to load hotels. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load hotels',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchHotels, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, toast]);

  const handleDelete = async (id: number) => {
    try {
      await hotelService.deleteHotel(id.toString());
      setHotels(hotels.filter(h => h.id !== id));
      toast({
        title: 'Success',
        description: 'Hotel deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete hotel:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete hotel. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSuccess = (hotel: Hotel) => {
    if (editingHotel) {
      // Update existing hotel in the list
      setHotels(prev => prev.map(h => (h.id === hotel.id ? hotel : h)));
    } else {
      // Add new hotel to the list
      setHotels(prev => [hotel, ...prev]);
    }
  };

  const openAddDialog = () => {
    setEditingHotel(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Hotels</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={openAddDialog}>
                <Plus className="h-4 w-4" />
                Add New Hotel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingHotel ? 'Edit Hotel' : 'Add a New Hotel'}</DialogTitle>
              </DialogHeader>
              <AddHotelForm
                onSuccess={handleSuccess}
                onClose={() => setIsDialogOpen(false)}
                hotelToEdit={editingHotel}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={hotel.image ? `${API_BASE_URL}${hotel.image}` : (hotel.images?.[0] ? `${API_BASE_URL}${hotel.images[0]}` : 'https://via.placeholder.com/400x300?text=No+Image')}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{hotel.name}</h3>
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold text-sm">{hotel.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{hotel.location}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      {hotel.reviewsCount} reviews
                    </span>
                    <span className="text-lg font-bold text-primary">${hotel.priceFrom}/night</span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(hotel)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(hotel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hotels found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageHotels;
