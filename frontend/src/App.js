import './App.css';
import { Navbar } from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ShopCategory } from './Pages/ShopCategory';
import { Product } from './Pages/Product';
import { LoginSignup } from './Pages/LoginSignup';
import { Shop } from './Pages/Shop';
import { Cart } from './Pages/Cart';
import { Profile } from './Pages/Profile';
import { MyOrders } from './Pages/MyOrders';
import { Settings } from './Pages/Settings';
import { Wishlist } from './Pages/Wishlist';
import { Checkout } from './Pages/Checkout';
import { ShowcaseLanding } from './Pages/ShowcaseLanding';
import { ToastProvider } from './Components/Toast/Toast';
import { ProtectedRoute } from './Components/ProtectedRoute';

// Only show the Navbar on dashboard routes, not on the landing page
const LANDING_PATHS = ['/', '/login'];

const AppLayout = () => {
  const location = useLocation();
  const showNav = !LANDING_PATHS.includes(location.pathname);

  return (
    <>
      {showNav && <Navbar />}
      <Routes>
        {/* ── Public landing & auth ── */}
        <Route path='/' element={<ShowcaseLanding />} />
        <Route path='/login' element={<LoginSignup />} />

        {/* ── Main dashboard (formerly '/') ── */}
        <Route path='/shop' element={<Shop />} />
        <Route path='/mens' element={<ShopCategory category="men" />} />
        <Route path='/womens' element={<ShopCategory category="women" />} />
        <Route path='/kids' element={<ShopCategory category="kid" />} />
        <Route path="/product" element={<Product />}>
          <Route path=':productId' element={<Product />} />
        </Route>

        {/* ── Protected routes ── */}
        <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path='/orders' element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path='/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path='/wishlist' element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
