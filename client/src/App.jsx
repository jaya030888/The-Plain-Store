import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import Checkout from './components/Checkout';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import SmoothScroll from './components/SmoothScroll';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import './index.css';

// Lazy-loaded non-critical pages for code splitting & minimal initial bundle
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const ReturnRefundPolicy = lazy(() => import('./pages/ReturnRefundPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const CancellationPolicy = lazy(() => import('./pages/CancellationPolicy'));
const GrievanceRedressalPolicy = lazy(() => import('./pages/GrievanceRedressalPolicy'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetails = lazy(() => import('./pages/ArticleDetails'));

const PageFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ width: '36px', height: '36px', border: '3px solid #E6DEC9', borderTopColor: '#468165', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <SmoothScroll>
              <div className="app-container">
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/articles" element={<Articles />} />
                    <Route path="/articles/:slug" element={<ArticleDetails />} />
                    <Route path="/blog" element={<Articles />} />
                    <Route path="/blog/:slug" element={<ArticleDetails />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/track" element={<TrackOrder />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/shipping-policy" element={<ShippingPolicy />} />
                    <Route path="/returns-policy" element={<ReturnRefundPolicy />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                    <Route path="/grievance-policy" element={<GrievanceRedressalPolicy />} />
                    <Route path="/grievance-redressal" element={<GrievanceRedressalPolicy />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders/:id" element={
                      <ProtectedRoute>
                        <OrderDetails />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Suspense>
                <Footer />
                <CartModal />
                <Checkout />
              </div>
            </SmoothScroll>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
