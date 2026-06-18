import { useState, useEffect } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TourCard from "@/components/TourCard";
import { motion } from "framer-motion";
import { tourService } from "@/services/tourService";
import type { Tour } from "@/types";

const Tours = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toursPerPage] = useState(9); // Display 9 tours per page
  const [totalTours, setTotalTours] = useState(0);

  // ✅ Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await tourService.getCategories();
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load tour categories");
      }
    };

    fetchCategories();
  }, []);

  // ✅ Fetch tours when category or search changes
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await tourService.getTours({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: toursPerPage,
        });

        setTours(response.tours || []);
        setTotalTours(response.pagination.total);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
        setError("Failed to load tours. Please try again later.");
        setTours([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [selectedCategory, searchQuery, currentPage, toursPerPage]);

  const totalPages = Math.ceil(totalTours / toursPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ✅ Always use fallback array
  const filteredTours = tours || [];
  const safeCategories = categories || [];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Explore Our Tours</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover unforgettable experiences across Sri Lanka's most iconic destinations
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tours or destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              key="all"
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={
                selectedCategory === "all" ? "bg-gradient-primary hover:shadow-glow" : ""
              }
            >
              All Tours
            </Button>

            {/* ✅ Safe map */}
            {safeCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-gradient-primary hover:shadow-glow"
                    : ""
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-center text-muted-foreground"
        >
          {filteredTours.length}{" "}
          {filteredTours.length === 1 ? "tour" : "tours"} found
        </motion.div>

        {/* Tours Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">Loading tours...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-red-500">{error}</p>
          </motion.div>
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TourCard tour={tour} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-muted-foreground">
              No tours found matching your criteria. Try adjusting your filters.
            </p>
          </motion.div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && totalTours > toursPerPage && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Tours;
