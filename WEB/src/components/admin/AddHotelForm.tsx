import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { hotelService } from '@/services/hotelService';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import type { Hotel } from '@/types';
import { Loader2, PlusCircle, Trash2, UploadCloud, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AddHotelFormProps {
  onSuccess: (newHotel: Hotel) => void;
  onClose: () => void;
  hotelToEdit?: Hotel | null;
}

interface RoomTypeFormData {
  id: number | string; // Temporary client-side ID for list management
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  features: string; // Comma-separated
  image: File | null;
}

const AddHotelForm = ({ onSuccess, onClose, hotelToEdit }: AddHotelFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    priceFrom: 0,
    description: '',
    hotelClass: '',
    hotelStyle: '', // Comma-separated styles
    propertyAmenities: '', // Comma-separated amenities
    latitude: 0,
    longitude: 0,
    mapEmbed: '',
  });
  const [imageFiles, setImageFiles] = useState<(File | string)[]>([]);
  const [draggedImage, setDraggedImage] = useState<number | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomTypeFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!hotelToEdit;

  useEffect(() => {
    if (isEditMode && hotelToEdit) {
      setFormData({
        name: hotelToEdit.name,
        location: hotelToEdit.location,
        city: hotelToEdit.city,
        priceFrom: hotelToEdit.priceFrom,
        description: hotelToEdit.description,
        hotelClass: hotelToEdit.hotelClass,
        hotelStyle: hotelToEdit.hotelStyle.join(', '),
        propertyAmenities: hotelToEdit.propertyAmenities.join(', '),
        latitude: hotelToEdit.coordinates?.lat || 0,
        longitude: hotelToEdit.coordinates?.lng || 0,
        mapEmbed: hotelToEdit.mapEmbed || '',
      });
      setImageFiles(hotelToEdit.images || []);
      setRoomTypes(hotelToEdit.roomTypes.map(rt => ({
        ...rt,
        features: rt.features.join(', '),
        image: null, // Existing images are strings, new ones are Files
      })));
    }
  }, [hotelToEdit, isEditMode]);

  const onDrop = (acceptedFiles: File[]) => {
    setImageFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleRoomTypeChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const updatedRoomTypes = [...roomTypes];
    const roomToUpdate = updatedRoomTypes[index];
    if (roomToUpdate) {
      (roomToUpdate as any)[name] = type === 'number' ? parseFloat(value) : value;
      setRoomTypes(updatedRoomTypes);
    }
  };

  const addRoomType = () => {
    setRoomTypes([...roomTypes, {
      id: Date.now(), // Use timestamp for unique key
      name: '',
      description: '',
      price: 0,
      maxGuests: 1,
      features: '',
      image: null,
    }]);
  };

  const removeRoomType = (index: number) => {
    setRoomTypes(roomTypes.filter((_, i) => i !== index));
  };

  const handleRoomImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const updatedRoomTypes = [...roomTypes];
    const roomToUpdate = updatedRoomTypes[index];
    if (roomToUpdate) {
      roomToUpdate.image = file;
      setRoomTypes(updatedRoomTypes);
    }
  };
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => setDraggedImage(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedImage === null) return;

    const newImageFiles = [...imageFiles];
    const draggedFile = newImageFiles[draggedImage];
    if (draggedFile) {
      newImageFiles.splice(draggedImage, 1);
      newImageFiles.splice(index, 0, draggedFile);
      setImageFiles(newImageFiles);
    }
    setDraggedImage(null);
  };

  const handleGeocodeLocation = async () => {
    if (!formData.location) {
      toast({ title: 'Please enter a location to search.', variant: 'destructive' });
      return;
    }
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.location)}, Sri Lanka&format=json&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
        toast({ title: 'Location Found!', description: `Coordinates updated for ${formData.location}.` });
      } else {
        toast({ title: 'Location not found.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Geocoding service failed.', variant: 'destructive' });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const uploadedImageUrls = await Promise.all(
        imageFiles.map(file => (file instanceof File ? hotelService.uploadImage(file).then(res => res.url) : Promise.resolve(file)))
      );

      const uploadedRoomImageUrls = await Promise.all(
        roomTypes.map(rt => {
          if (rt.image instanceof File) {
            return hotelService.uploadImage(rt.image).then(res => res.url);
          }
          return Promise.resolve(null); // No new image to upload
        })
      );

      const newHotelData = {
        ...formData,
        mainImage: uploadedImageUrls[0] || '',
        images: uploadedImageUrls,
        hotelStyle: formData.hotelStyle.split(',').map(s => s.trim()).filter(Boolean),
        propertyAmenities: formData.propertyAmenities.split(',').map(s => s.trim()).filter(Boolean),
        coordinates: { lat: formData.latitude, lng: formData.longitude },
        roomTypes: roomTypes.map((rt, index) => ({
          name: rt.name,
          description: rt.description,
          price: rt.price,
          maxGuests: rt.maxGuests,
          features: rt.features.split(',').map(f => f.trim()).filter(Boolean),
          image: uploadedRoomImageUrls[index] || (isEditMode ? hotelToEdit?.roomTypes[index]?.image : undefined),
          available: true, // Set default availability
        })),
        rating: 0, // Initialize rating
        reviewsCount: 0, // Initialize reviews count
      };

      if (isEditMode && hotelToEdit) {
        const updatedHotel = await hotelService.updateHotel(hotelToEdit.id.toString(), newHotelData);
        toast({
          title: 'Success!',
          description: `Hotel "${updatedHotel.name}" has been updated.`,
        });
        onSuccess(updatedHotel);
      } else {
        const createdHotel = await hotelService.createHotel(newHotelData);
        toast({
          title: 'Success!',
          description: `Hotel "${createdHotel.name}" has been created.`,
        });
        onSuccess(createdHotel);
      }

      onClose(); 
    } catch (error) {
      console.error('Failed to create hotel:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} hotel. Please check the details and try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {/* Hotel Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location (Address)</Label>
          <div className="flex gap-2">
            <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
            <Button type="button" variant="outline" size="icon" onClick={handleGeocodeLocation} disabled={isGeocoding}>
              {isGeocoding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceFrom">Price From ($)</Label>
          <Input id="priceFrom" name="priceFrom" type="number" value={formData.priceFrom} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hotelClass">Hotel Class</Label>
          <Input id="hotelClass" name="hotelClass" value={formData.hotelClass} onChange={handleChange} placeholder="e.g., 5-star" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hotelStyle">Hotel Styles</Label>
          <Input id="hotelStyle" name="hotelStyle" value={formData.hotelStyle} onChange={handleChange} placeholder="e.g., Boutique, Luxury" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} />
        </div>
      </div>

      {/* Full-width Textareas and Inputs */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hotel Images</h3>
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="h-8 w-8" />
            <p>{isDragActive ? 'Drop the files here...' : 'Drag & drop images here, or click to select'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageFiles.map((file, index) => {
            const imageUrl = file instanceof File ? URL.createObjectURL(file) : `${API_BASE_URL}${file}`;
            return ( 
              <div key={index} draggable onDragStart={() => handleDragStart(index)} onDragOver={handleDragOver} onDrop={() => handleDrop(index)} className="relative group aspect-square border rounded-lg overflow-hidden cursor-move">
                <img src={imageUrl} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {index === 0 && <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">Main</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="propertyAmenities">Amenities (comma-separated)</Label>
        <Textarea id="propertyAmenities" name="propertyAmenities" value={formData.propertyAmenities} onChange={handleChange} placeholder="e.g., Free Wifi, Pool, Spa" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mapEmbed">Map Embed URL</Label>
        <Textarea id="mapEmbed" name="mapEmbed" value={formData.mapEmbed} onChange={handleChange} />
      </div>

      {/* Dynamic Room Types Section */}
      <Card>
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roomTypes.map((room, index) => (
            <div key={room.id} className="p-4 border rounded-lg space-y-4 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeRoomType(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`roomName-${index}`}>Room Name</Label>
                  <Input id={`roomName-${index}`} name="name" value={room.name} onChange={(e) => handleRoomTypeChange(index, e)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`roomPrice-${index}`}>Price ($)</Label>
                  <Input id={`roomPrice-${index}`} name="price" type="number" value={room.price} onChange={(e) => handleRoomTypeChange(index, e)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`roomMaxGuests-${index}`}>Max Guests</Label>
                  <Input id={`roomMaxGuests-${index}`} name="maxGuests" type="number" value={room.maxGuests} onChange={(e) => handleRoomTypeChange(index, e)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`roomDesc-${index}`}>Description</Label>
                <Textarea id={`roomDesc-${index}`} name="description" value={room.description} onChange={(e) => handleRoomTypeChange(index, e)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`roomFeatures-${index}`}>Features (comma-separated)</Label>
                <Input id={`roomFeatures-${index}`} name="features" value={room.features} onChange={(e) => handleRoomTypeChange(index, e)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`roomImage-${index}`}>Room Image</Label>
                {room.image && (
                  <div className="relative w-32 h-32 mb-2">
                    <img src={URL.createObjectURL(room.image)} alt="Room preview" className="w-full h-full object-cover rounded-md" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => handleRoomImageChange(index, { target: { files: null } } as any)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Input id={`roomImage-${index}`} type="file" accept="image/*" onChange={(e) => handleRoomImageChange(index, e)} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addRoomType} className="w-full gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Room Type
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Update Hotel' : 'Create Hotel'}
        </Button>
      </div>
    </form>
  );
};

export default AddHotelForm;