import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';
import type { Tour } from '@/types';

interface TourCardProps {
  tour: Tour;
}

const TourCard = ({ tour }: TourCardProps) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const imageUrl = tour.image ? `${API_BASE_URL}${tour.image}` : '/placeholder.svg'; // This line is correct.

  return (
    <Link to={`/tours/${tour.id}`}>
      <Card className="overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 group">
        <div className="relative h-56">
          <img
            src={imageUrl}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{tour.location}</span>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{tour.name}</h3>
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-sm">{Math.floor(Number(tour.rating))}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm text-muted-foreground">
              {tour.duration}
            </span>
            <span className="text-lg font-bold text-primary">${tour.price}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TourCard;
