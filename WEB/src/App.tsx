import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetails from "./pages/TourDetails";
import Booking from "./pages/Booking";
import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import HotelBooking from "./pages/HotelBooking";
import Reviews from "./pages/Reviews";
import Chatbot from "./pages/Chatbot";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ARImageRecognition from "./pages/ARImageRecognition";
import Dashboard from "./pages/admin/Dashboard";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageTours from "./pages/admin/ManageTours";
import ManageReviews from "./pages/admin/ManageReviews";
import ManageHotels from "./pages/admin/ManageHotels";
import IncomeAnalytics from "./pages/admin/IncomeAnalytics";
import UserAccount from "./pages/UserAccount";
import NotFound from "./pages/NotFound";
import PolicyPage from "./pages/PolicyPage";
import ManagePolicies from "./pages/admin/ManagePolicies"; // Import the new admin page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Public Routes */}
            <Route path="/" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><Home /></main>
                <Footer />
              </div>
            } />
            <Route path="/tours" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><Tours /></main>
                <Footer />
              </div>
            } />
            <Route path="/tours/:id" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><TourDetails /></main>
                <Footer />
              </div>
            } />
            <Route path="/booking" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><Booking /></main>
                <Footer />
              </div>
            } />
            <Route path="/hotels" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><Hotels /></main>
                <Footer />
              </div>
            } />
            <Route path="/hotels/:id" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><HotelDetails /></main>
                <Footer />
              </div>
            } />
            <Route path="/hotels/:id/booking" element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1"><HotelBooking /></main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/reviews" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><Reviews /></main>
                <Footer />
              </div>
            } />
            <Route path="/chatbot" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><Chatbot /></main>
                <Footer />
              </div>
            } />
            <Route path="/about" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><About /></main>
                <Footer />
              </div>
            } />
            <Route path="/contact" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><Contact /></main>
                <Footer />
              </div>
            } />
            <Route path="/ar" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><ARImageRecognition /></main>
                <Footer />
              </div>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1"><UserAccount /></main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/policy/:slug" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1"><PolicyPage /></main>
                <Footer />
              </div>
            } />


            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute adminOnly>
                <ManageBookings />
              </ProtectedRoute>
            } />
            <Route path="/admin/tours" element={
              <ProtectedRoute adminOnly>
                <ManageTours />
              </ProtectedRoute>
            } />
            <Route path="/admin/reviews" element={
              <ProtectedRoute adminOnly>
                <ManageReviews />
              </ProtectedRoute>
            } />
            <Route path="/admin/hotels" element={
              <ProtectedRoute adminOnly>
                <ManageHotels />
              </ProtectedRoute>
            } />
            <Route path="/admin/policies" element={
              <ProtectedRoute adminOnly>
                <ManagePolicies />
              </ProtectedRoute>
            } />
            <Route path="/admin/income" element={
              <ProtectedRoute adminOnly>
                <IncomeAnalytics />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
