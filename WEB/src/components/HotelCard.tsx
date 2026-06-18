import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HotelCardProps } from '@/types';

const HotelCard = ({ hotel }: HotelCardProps) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const imageUrl = hotel.image ? `${API_BASE_URL}${hotel.image}` : (hotel.images?.[0] ? `${API_BASE_URL}${hotel.images[0]}` : 'https://via.placeholder.com/400x300?text=No+Image');

  return (
    <Link to={`/hotels/${hotel.id}`}>
      <Card className="overflow-hidden hover:shadow-card transition-all duration-300 group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm">
            {hotel.hotelClass}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{hotel.name}</h3>
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-sm">{hotel.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{hotel.location}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {hotel.description}
          </p>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {hotel.hotelStyle.slice(0, 3).map((style) => (
              <Badge key={style} variant="secondary" className="text-xs">
                {style}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm text-muted-foreground">
              {hotel.reviewsCount} reviews
            </span>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">From </span>
              <span className="text-xl font-bold text-primary">${hotel.priceFrom}</span>
              <span className="text-sm text-muted-foreground">/night</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default HotelCard;
