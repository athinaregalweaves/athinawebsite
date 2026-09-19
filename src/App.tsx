import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";

// Eagerly load Index (homepage)
import Index from "./pages/Index";

// Lazy load all other pages
const Collections = lazy(() => import("./pages/Collections"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Heritage = lazy(() => import("./pages/Heritage"));
const BridalSarees = lazy(() => import("./pages/BridalSarees"));
const TissueSarees = lazy(() => import("./pages/TissueSarees"));
const LinenSarees = lazy(() => import("./pages/LinenSarees"));
const Store = lazy(() => import("./pages/Store"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminSections = lazy(() => import("./pages/AdminSections"));
const AdminCollections = lazy(() => import("./pages/AdminCollections"));
const AdminBridal = lazy(() => import("./pages/AdminBridal"));
const AdminTissue = lazy(() => import("./pages/AdminTissue"));
const AdminLinen = lazy(() => import("./pages/AdminLinen"));
const AdminCustomCollection = lazy(() => import("./pages/AdminCustomCollection"));
const AdminProductEditor = lazy(() => import("./pages/AdminProductEditor"));
const AdminHistory = lazy(() => import("./pages/AdminHistory"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
const AdminInquiries = lazy(() => import("./pages/AdminInquiries"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminSitePages = lazy(() => import("./pages/AdminSitePages"));
const CustomerLogin = lazy(() => import("./pages/CustomerLogin"));
const CustomerRegister = lazy(() => import("./pages/CustomerRegister"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const CustomCollection = lazy(() => import("./pages/CustomCollection"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const PublicLayout = () => (
  <>
    <Header />
    <div className="site-content min-w-0 w-full max-w-[100vw] overflow-x-clip">
      <Outlet />
    </div>
    <Footer />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/sections" element={<ProtectedAdminRoute><AdminSections /></ProtectedAdminRoute>} />
            <Route path="/admin/collections" element={<ProtectedAdminRoute><AdminCollections /></ProtectedAdminRoute>} />
            <Route path="/admin/bridal" element={<ProtectedAdminRoute><AdminBridal /></ProtectedAdminRoute>} />
            <Route path="/admin/tissue" element={<ProtectedAdminRoute><AdminTissue /></ProtectedAdminRoute>} />
            <Route path="/admin/linen" element={<ProtectedAdminRoute><AdminLinen /></ProtectedAdminRoute>} />
            <Route path="/admin/collection/:slug" element={<ProtectedAdminRoute><AdminCustomCollection /></ProtectedAdminRoute>} />
            <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
            <Route path="/admin/customers" element={<ProtectedAdminRoute><AdminCustomers /></ProtectedAdminRoute>} />
            <Route path="/admin/inquiries" element={<ProtectedAdminRoute><AdminInquiries /></ProtectedAdminRoute>} />
            <Route path="/admin/reviews" element={<ProtectedAdminRoute><AdminReviews /></ProtectedAdminRoute>} />
            <Route path="/admin/product/:id" element={<ProtectedAdminRoute><AdminProductEditor /></ProtectedAdminRoute>} />
            <Route path="/admin/blog" element={<ProtectedAdminRoute><AdminBlog /></ProtectedAdminRoute>} />
            <Route path="/admin/site-pages" element={<ProtectedAdminRoute><AdminSitePages /></ProtectedAdminRoute>} />
            <Route path="/admin/history" element={<ProtectedAdminRoute><AdminHistory /></ProtectedAdminRoute>} />

            {/* Auth routes (no header/footer) */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/heritage" element={<Heritage />} />
              <Route path="/bridal" element={<BridalSarees />} />
              <Route path="/tissue" element={<TissueSarees />} />
              <Route path="/linen" element={<LinenSarees />} />
              <Route path="/collection/:slug" element={<CustomCollection />} />
              <Route path="/store" element={<Store />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<CustomerProfile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
