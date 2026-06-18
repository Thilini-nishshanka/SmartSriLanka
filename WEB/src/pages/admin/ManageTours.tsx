import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import TourFormDialog from '@/components/admin/TourFormDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { tourService } from '@/services/tourService';
import type { Tour } from '@/types';

const ManageTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toursPerPage] = useState(10); // You can make this configurable
  const [totalTours, setTotalTours] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await tourService.getTours({
        page: currentPage,
        limit: toursPerPage,
      });
      setTours(response.tours || []);
      setTotalTours(response.pagination.total);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tours:', err);
      setError('Failed to load tours. Please try again later.');
      toast.error('Failed to load tours.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [currentPage, toursPerPage]); // Re-fetch when page or limit changes

  const handleDelete = async () => {
    if (!tourToDelete) return;

    try {
      await tourService.deleteTour(String(tourToDelete.id));
      toast.success(`Tour "${tourToDelete.name}" deleted successfully`);
      setDeleteConfirmationOpen(false);
      setTourToDelete(null);
      fetchTours(); // Refetch tours
    } catch (err) {
      console.error('Failed to delete tour:', err);
      toast.error('Failed to delete tour.');
    }
  };

  const handleSaveTour = async (tourData: Tour) => {
    try {
      if (editingTour) {
        // The id is a number, and the service expects a string
        await tourService.updateTour(String(editingTour.id), tourData);
        toast.success('Tour updated successfully');
      } else {
        // For creation, we omit the ID as the backend will generate it.
        const { id, ...creationData } = tourData;
        await tourService.createTour(creationData);
        toast.success('Tour created successfully');
      }
      setFormDialogOpen(false);
      setEditingTour(null);
      fetchTours(); // Refetch to see changes
    } catch (err) {
      console.error('Failed to save tour:', err);
      toast.error('Failed to save tour. Please check the details and try again.');
    }
  };

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTour(null);
    setFormDialogOpen(true);
  };

  const openDeleteConfirmation = (tour: Tour) => {
    setTourToDelete(tour);
    setDeleteConfirmationOpen(true);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Manage Tours</h1>
          <Button className="gap-2" onClick={handleAddNew}>
            <Plus className="h-4 w-4" />
            Add New Tour
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading && (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {error && !loading && (
                <div className="flex justify-center items-center h-64 text-destructive">
                  {error}
                </div>
              )}
              {!loading && !error && tours.length === 0 && (
                <div className="flex justify-center items-center h-64 text-muted-foreground">
                  No tours found.
                </div>
              )}
              {!loading && !error && tours.length > 0 && (

              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead className="hidden sm:table-cell">Price</TableHead>
                    <TableHead className="hidden xl:table-cell">Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tours.map((tour: Tour) => (
                    <TableRow key={tour.id}>
                      <TableCell className="font-medium">#{tour.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={tour.image ? `${API_BASE_URL}${tour.image}` : '/placeholder.svg'} 

                            alt={tour.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <span className="font-medium">{tour.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{tour.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{tour.location}</TableCell>
                      <TableCell className="hidden sm:table-cell font-semibold">${tour.price}</TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{tour.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setSelectedTour(tour)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Tour Details - {tour.name}</DialogTitle>
                              </DialogHeader>
                              {selectedTour && (
                                <div className="space-y-4">
                                  <img
                                    src={selectedTour.image ? `${API_BASE_URL}${selectedTour.image}` : '/placeholder.svg'}
                                    alt={selectedTour.name}
                                    className="w-full h-64 object-cover rounded-lg"
                                  />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Name</h4>
                                      <p className="text-lg">{selectedTour.name}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Category</h4>
                                      <Badge variant="outline">{selectedTour.category}</Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Location</h4>
                                      <p className="text-lg">{selectedTour.location}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Duration</h4>
                                      <p className="text-lg">{selectedTour.duration}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Price</h4>
                                      <p className="text-lg font-bold">${selectedTour.price}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Rating</h4>
                                      <p className="text-lg">★ {selectedTour.rating} ({selectedTour.reviewsCount} reviews)</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Description</h4>
                                    <p className="text-foreground">{selectedTour.description}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Highlights</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                      {selectedTour.highlights.map((highlight, idx) => (
                                        <li key={idx}>{highlight}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Included</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                      {selectedTour.included.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button 
                                      variant="outline" 
                                      className="gap-2"
                                      onClick={() => {
                                        handleEdit(selectedTour);
                                        setSelectedTour(null);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Tour
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      className="gap-2"
                                      onClick={() => openDeleteConfirmation(selectedTour)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Tour
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEdit(tour)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => openDeleteConfirmation(tour)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && !error && totalTours > toursPerPage && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {Math.ceil(totalTours / toursPerPage)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * toursPerPage >= totalTours}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TourFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        tour={editingTour}
        onSave={handleSaveTour}
      />

      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tour "{tourToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ManageTours;
