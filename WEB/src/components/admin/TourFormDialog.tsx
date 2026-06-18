import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { tourService } from '@/services/tourService';
import { X, Plus, UploadCloud, Search, Loader2 } from 'lucide-react';
import type { Tour, DayItinerary, TourFormDialogProps } from '@/types';

const TourFormDialog = ({ open, onOpenChange, tour, onSave }: TourFormDialogProps) => {
  const [formData, setFormData] = useState<Tour>({
    id: 0,
    name: '',
    category: '',
    location: '',
    price: 0,
    duration: '',
    rating: 5.0,
    reviewsCount: 0,
    images: [],
    description: '',
    highlights: [''],
    included: [''],
    numberOfDays: 1,
    itinerary: [{
      day: 1,
      title: '',
      stops: [{ name: '', duration: '', admissionIncluded: false, description: '', location: { lat: 0, lng: 0 } }],
      meals: [],
      accommodation: ''
    }],
  });

  const [imageFiles, setImageFiles] = useState<(File | string)[]>([]);
  const [draggedImage, setDraggedImage] = useState<number | null>(null);
  const [geocodingStop, setGeocodingStop] = useState<string | null>(null); // To track which stop is being geocoded
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const onDrop = (acceptedFiles: File[]) => {
    const newImageFiles = [...imageFiles, ...acceptedFiles];
    setImageFiles(newImageFiles);

    // This part is for demonstration. In a real app, you would upload the files
    // and get back URLs to save in formData.images.
    const newImageUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImageUrls]
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  useEffect(() => {
    if (tour) {
      setFormData(tour);
      setImageFiles(tour.images);
    } else {
      setFormData({
        id: 0, // Use 0 or a temporary ID for new tours
        name: '',
        category: '',
        location: '',
        price: 0,
        duration: '',
        rating: 5.0,
        reviewsCount: 0,
        images: [],
        description: '',
        highlights: [''],
        included: [''],
        numberOfDays: 1,
        itinerary: [{
          day: 1,
          title: '',
          stops: [{ name: '', duration: '', admissionIncluded: false, description: '', location: { lat: 0, lng: 0 } }],
          meals: [],
          accommodation: ''
        }],
      });
      setImageFiles([]);
    }
  }, [tour, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const uploadedImageUrls = await Promise.all(
        imageFiles.map(async (fileOrUrl) => {
          // If it's a File object, it's a new image that needs to be uploaded.
          if (fileOrUrl instanceof File) {
            const uploadResponse = await tourService.uploadImage(fileOrUrl);
            return uploadResponse.url; // Just use the relative path from the API
          }
          // If it's a string, it's an existing image URL. Keep it.
          return fileOrUrl;
        })
      );

      const finalTourData = {
        ...formData,
        images: uploadedImageUrls,
      };

      await onSave(finalTourData);
    } catch (error) {
      console.error('Failed to upload images or save tour:', error);
      toast.error('Failed to save tour. Please check image uploads and try again.');
    }
  };

  const handleArrayChange = (field: 'highlights' | 'included', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: 'highlights' | 'included') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field: 'highlights' | 'included', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleNumberOfDaysChange = (days: number) => {
    const currentItinerary = formData.itinerary;
    const newItinerary: DayItinerary[] = [];

    for (let i = 0; i < days; i++) {
      if (currentItinerary[i]) {
        newItinerary.push(currentItinerary[i]);
      } else {
        newItinerary.push({
          day: i + 1,
          title: '',
          stops: [{ name: '', duration: '', admissionIncluded: false, description: '' }],
          meals: [],
          accommodation: ''
        });
      }
    }

    setFormData({ ...formData, numberOfDays: days, itinerary: newItinerary });
  };

  const updateItineraryDay = (dayIndex: number, field: keyof DayItinerary, value: any) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[dayIndex] = { ...newItinerary[dayIndex], [field]: value };
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const addStop = (dayIndex: number) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[dayIndex].stops.push({ name: '', duration: '', admissionIncluded: false, description: '', location: { lat: 0, lng: 0 } });
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const removeStop = (dayIndex: number, stopIndex: number) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[dayIndex].stops = newItinerary[dayIndex].stops.filter((_, i) => i !== stopIndex);
    setFormData({ ...formData, itinerary: newItinerary });
  };


  const updateStop = (dayIndex: number, stopIndex: number, field: string, value: any) => {
    const newItinerary = [...formData.itinerary];
    const stop = newItinerary[dayIndex].stops[stopIndex] as any;

    if (field === 'lat' || field === 'lng') {
      stop.location = { ...(stop.location || {}), [field]: value };
    } else {
      stop[field] = value;
    }

    setFormData({ ...formData, itinerary: newItinerary });
  };

  const handleGeocodeStop = async (dayIndex: number, stopIndex: number) => {
    const stopName = formData.itinerary[dayIndex].stops[stopIndex].name;
    if (!stopName) {
      toast.warning('Please enter a stop name before searching.');
      return;
    }

    const uniqueId = `${dayIndex}-${stopIndex}`;
    setGeocodingStop(uniqueId);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(stopName)}, Sri Lanka&format=json&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        updateStop(dayIndex, stopIndex, 'lat', parseFloat(lat));
        updateStop(dayIndex, stopIndex, 'lng', parseFloat(lon));
        toast.success(`Location found for "${stopName}"`);
      } else {
        toast.error(`Could not find location for "${stopName}"`);
      }
    } catch (error) {
      toast.error('Geocoding service failed. Please try again.');
    } finally {
      setGeocodingStop(null);
    }
  };

  const removeImage = (index: number) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newImageFiles);

    // Also update the formData.images which holds the URLs
    const newImageUrls = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImageUrls }));

    // If the removed image was a blob URL, revoke it to free memory
    const imageToRemove = formData.images[index];
    if (imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedImage(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedImage === null) return;
    
    const newImageFiles = [...imageFiles];
    const draggedFile = newImageFiles[draggedImage];
    newImageFiles.splice(draggedImage, 1);
    newImageFiles.splice(index, 0, draggedFile);
    setImageFiles(newImageFiles);
    
    const newImageUrls = [...formData.images];
    const draggedUrl = newImageUrls[draggedImage];
    newImageUrls.splice(draggedImage, 1);
    newImageUrls.splice(index, 0, draggedUrl);
    
    setFormData({ ...formData, images: newImageUrls });
    setDraggedImage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tour ? 'Edit Tour' : 'Add New Tour'}</DialogTitle>
          <DialogDescription>
            Create a detailed multi-day tour with itinerary, images, and all tour information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tour Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Nature">Nature</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.valueAsNumber || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfDays">Number of Days *</Label>
                <Input
                  id="numberOfDays"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.numberOfDays}
                  onChange={(e) => handleNumberOfDaysChange(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration Description *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 8 Days / 7 Nights"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
          </div>

          {/* Images with Drag and Drop */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tour Images</h3>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-8 w-8" />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <p>Drag & drop some files here, or click to select files</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageFiles.map((file, index) => {
                let imageUrl = '';
                if (file instanceof File) {
                  imageUrl = URL.createObjectURL(file);
                } else if (typeof file === 'string' && file) {
                  imageUrl = file.startsWith('blob:') ? file : `${API_BASE_URL}${file}`;
                }
                return (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className="relative group aspect-square border rounded-lg overflow-hidden cursor-move"
                >
                  <img src={imageUrl} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Highlights</h3>
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={highlight}
                  onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                  placeholder="Enter highlight"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('highlights', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem('highlights')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Highlight
            </Button>
          </div>

          {/* What's Included */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What's Included</h3>
            {formData.included.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleArrayChange('included', index, e.target.value)}
                  placeholder="Enter included item"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('included', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem('included')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Included Item
            </Button>
          </div>

          {/* Day-by-Day Itinerary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Day-by-Day Itinerary</h3>
            {formData.itinerary.map((day, dayIndex) => (
              <div key={dayIndex} className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <h4 className="font-semibold text-primary">Day {day.day}</h4>
                
                <div className="space-y-2">
                  <Label>Day Title</Label>
                  <Input
                    value={day.title}
                    onChange={(e) => updateItineraryDay(dayIndex, 'title', e.target.value)}
                    placeholder="e.g., Airport to Sigiriya / Dambulla"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Stops</Label>
                  {day.stops.map((stop, stopIndex) => (
                    <div key={stopIndex} className="border rounded p-3 space-y-2 bg-background">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Stop {stopIndex + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStop(dayIndex, stopIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={stop.name}
                          onChange={(e) => updateStop(dayIndex, stopIndex, 'name', e.target.value)}
                          placeholder="Stop name (e.g., Dambulla Cave Temple)"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleGeocodeStop(dayIndex, stopIndex)}
                          disabled={geocodingStop === `${dayIndex}-${stopIndex}`}
                        >
                          {geocodingStop === `${dayIndex}-${stopIndex}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Input
                        value={stop.duration}
                        onChange={(e) => updateStop(dayIndex, stopIndex, 'duration', e.target.value)}
                        placeholder="Duration (e.g., 2 hours)"
                      />
                      <Textarea
                        value={stop.description || ''}
                        onChange={(e) => updateStop(dayIndex, stopIndex, 'description', e.target.value)}
                        placeholder="Stop description"
                        rows={2}
                      />
                      <div className="space-y-2 p-2 border rounded-md bg-muted/20">
                        <Label className="text-xs font-semibold">Coordinates</Label>
                        <p className="text-xs text-muted-foreground">
                          Use the search button above to find coordinates automatically, or enter the decimal value below.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            step="any"
                            value={stop.location?.lat || ''}
                            onChange={(e) => updateStop(dayIndex, stopIndex, 'lat', e.target.valueAsNumber)}
                            placeholder="Latitude (Decimal)"
                            aria-label="Latitude"
                          />
                          <Input
                            type="number"
                            step="any"
                            value={stop.location?.lng || ''}
                            onChange={(e) => updateStop(dayIndex, stopIndex, 'lng', e.target.valueAsNumber)}
                            placeholder="Longitude (Decimal)"
                            aria-label="Longitude"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={stop.admissionIncluded}
                          onChange={(e) => updateStop(dayIndex, stopIndex, 'admissionIncluded', e.target.checked)}
                          className="rounded"
                        />
                        <Label className="text-sm">Admission included</Label>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addStop(dayIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stop
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meals Included</Label>
                    <Input
                      value={day.meals.join(', ')}
                      onChange={(e) => updateItineraryDay(dayIndex, 'meals', e.target.value.split(',').map(m => m.trim()))}
                      placeholder="e.g., Breakfast, Lunch, Dinner"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Accommodation</Label>
                    <Input
                      value={day.accommodation}
                      onChange={(e) => updateItineraryDay(dayIndex, 'accommodation', e.target.value)}
                      placeholder="e.g., Overnight at Sigiriya Hotel"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 sticky bottom-0 bg-background pb-4 border-t">
            <Button type="submit" className="flex-1">
              {tour ? 'Update Tour' : 'Create Tour'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TourFormDialog;
