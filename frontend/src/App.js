import './App.css';
import { Navbar } from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { ToastProvider } from './Components/Toast/Toast';

function App() {
  return (
    <div>
      <BrowserRouter>
        <ToastProvider>
          <Navbar />
          <Routes>
            <Route path='/' element={<Shop />} />
            <Route path='/mens' element={<ShopCategory category="men" />} />
            <Route path='/womens' element={<ShopCategory category="women" />} />
            <Route path='/kids' element={<ShopCategory category="kid" />} />
            <Route path="/product" element={<Product />}>
              <Route path=':productId' element={<Product />} />
            </Route>
            <Route path='/cart' element={<Cart />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/login' element={<LoginSignup />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/orders' element={<MyOrders />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/wishlist' element={<Wishlist />} />
          </Routes>
        </ToastProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
