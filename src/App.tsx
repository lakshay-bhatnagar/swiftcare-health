import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { Stripe } from '@capacitor-community/stripe';
import { useEffect } from 'react';

// Pages
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Search from "./pages/Search";
import MedicineDetail from "./pages/MedicineDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Emergency from "./pages/Emergency";
import Consultation from "./pages/Consultation";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Addresses from "./pages/Addresses";
import AddressForm from "./pages/AddressForm";
import Notifications from "./pages/Notifications";
import PharmacyDetail from "./pages/PharmacyDetail";
import DoctorProfile from "./pages/DoctorProfile";
import Consultations from "./pages/Consultations";
import Prescriptions from "./pages/Prescriptions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


const App = () => {
  // Add this useEffect block
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        await Stripe.initialize({
          publishableKey: "pk_test_51SwPnOH1t6V81mNiMMu3seyqyrrcLgP6LSTbKG7FWkadxIMpSHIpenpjNlMFWJawjoJkVfkD3KzK9CTVtPazmxMq00UVBF3yNc",
        });
        console.log("Stripe Initialized Successfully");
      } catch (error) {
        console.error("Stripe Initialization Error:", error);
      }
    };

    initializeStripe();
  }, []);
  return (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/splash" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/search" element={<Search />} />
            <Route path="/medicine/:id" element={<MedicineDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/address/new" element={<AddressForm />} />
            <Route path="/address/edit/:id" element={<AddressForm />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pharmacy/:id" element={<PharmacyDetail />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
)};

export default App;
