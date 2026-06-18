import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HotelCard from '@/components/HotelCard';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hotelService } from '@/services/hotelService';
import type { Hotel } from '@/types';

const Hotels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hotelService.getHotels({
          search: searchTerm,
          city: selectedCity !== 'all' ? selectedCity : undefined,
        });
        setHotels(data.hotels);
      } catch (error: any) {
        console.error('Failed to fetch hotels:', error);
        if (error.response?.status === 401) {
          setError('Please log in to view hotels');
        } else {
          setError('Failed to load hotels. Please try again later.');
        }
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Small delay to prevent too many requests while typing
    const timeoutId = setTimeout(fetchHotels, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCity]);

  const cities = ['all', ...Array.from(new Set((hotels || []).map(h => h.city)))];
  const filteredHotels = hotels || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-sunset opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-sunset bg-clip-text text-transparent">
                Discover Hotels in Sri Lanka
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Find the perfect accommodation for your stay
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filter Section */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search hotels by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-background"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city === 'all' ? 'All Cities' : city}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Hotels Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <p className="text-muted-foreground">
                {filteredHotels.length} {filteredHotels.length === 1 ? 'hotel' : 'hotels'} found
              </p>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Loading hotels...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
                {filteredHotels.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No hotels found matching your criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

    
    </div>
  );
};

export default Hotels;
