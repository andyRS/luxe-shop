import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import ProtectedRoute from './components/ProtectedRoute';
import useSettingsStore from './store/settingsStore';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import NotFound from './pages/NotFound';

// Lazy loaded routes
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Contact = lazy(() => import('./pages/Contact'));
const Offers = lazy(() => import('./pages/Offers'));
const Categories = lazy(() => import('./pages/Categories'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

function App() {
  const fetchSettings = useSettingsStore(s => s.fetchSettings);
  
  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <HelmetProvider>
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/ofertas" element={<Offers />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/orden-confirmada/:id" element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/orden/:id" element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/olvide-contrasena" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/favoritos" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </main>
        <Footer />
        <WhatsAppWidget />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#f0760b',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
    </HelmetProvider>
  );
}

export default App;
