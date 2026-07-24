import React, { createContext, useState, useEffect } from "react";

export const ShopContext = createContext(null);

const API_BASE = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

const ShopContextProvider = (props) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState({ name: '', email: '', date: null, loggedIn: false });
  const [userLoading, setUserLoading] = useState(!!localStorage.getItem('auth-token'));
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/allproducts`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        // Cart keys are now composite `${id}_${size}` — initialize empty
        setCartItems({});
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      getUser(token);
    }
  }, []);


  const getUser = async (token) => {
    setUserLoading(true);
    try {
      const response = await fetch(`${API_BASE}/getuser`, {
        method: 'POST',
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) localStorage.removeItem('auth-token');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser({ name: data.name, email: data.email, date: data.date, loggedIn: true });

        fetch(`${API_BASE}/getcart`, {
          method: 'POST',
          headers: { 'auth-token': token, 'Content-Type': 'application/json' },
        })
          .then((res) => res.json())
          .then((cartData) => { if (cartData) setCartItems(cartData); })
          .catch((err) => console.error('Cart restore error:', err));

        fetch(`${API_BASE}/getwishlist`, {
          method: 'POST',
          headers: { 'auth-token': token, 'Content-Type': 'application/json' },
        })
          .then((res) => res.json())
          .then((wishlistData) => {
            if (wishlistData) setWishlist(Object.keys(wishlistData).map(Number));
          })
          .catch((err) => console.error('Wishlist restore error:', err));
      }
    } catch (err) {
      console.error('getUser fetch failed:', err);
    } finally {
      setUserLoading(false);
    }
  };

  // Pushes guest cart entries into the DB, then re-fetches to produce a merged cart.
  const mergeGuestCart = async (guestCart, token) => {
    const entries = Object.entries(guestCart).filter(([, qty]) => qty > 0);
    if (!entries.length) return;

    await Promise.all(
      entries.map(([key, qty]) => {
        const [itemId, size] = key.split('_');
        // Fire one request per unit so the backend counter increments correctly
        return Promise.all(
          Array.from({ length: qty }, () =>
            fetch(`${API_BASE}/addtocart`, {
              method: 'POST',
              headers: { 'auth-token': token, 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId: Number(itemId), size }),
            })
          )
        );
      })
    );

    // Re-fetch the authoritative merged cart from the DB
    fetch(`${API_BASE}/getcart`, {
      method: 'POST',
      headers: { 'auth-token': token, 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((cartData) => { if (cartData) setCartItems(cartData); })
      .catch((err) => console.error('Merged cart fetch error:', err));
  };

  const addToCart = (itemId, size, showToast) => {
    const finalSize = size || 'M';
    const key = `${itemId}_${finalSize}`;

    const product = products.find((p) => p.id === itemId);
    const currentQty = cartItems[key] || 0;

    if (product && currentQty >= product.stock) {
      if (showToast) showToast('Cannot add more items. Maximum stock limit reached.', 'error');
      return;
    }

    setCartItems((prev) => ({ ...prev, [key]: currentQty + 1 }));

    if (localStorage.getItem('auth-token')) {
      fetch(`${API_BASE}/addtocart`, {
        method: 'POST',
        headers: {
          'auth-token': localStorage.getItem('auth-token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, size: finalSize }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            // Rollback optimistic update if backend rejects
            setCartItems((prev) => ({ ...prev, [key]: Math.max((prev[key] || 1) - 1, 0) }));
            if (showToast) showToast(data.message || 'Could not add item to cart.', 'error');
          }
        })
        .catch((err) => console.error('Error adding to cart:', err));
    }
  };

  const removeFromCart = (itemId, size) => {
    const finalSize = size || 'M';
    const key = `${itemId}_${finalSize}`;
    setCartItems((prev) => ({ ...prev, [key]: Math.max((prev[key] || 0) - 1, 0) }));
    if (localStorage.getItem('auth-token')) {
      fetch(`${API_BASE}/removefromcart`, {
        method: 'POST',
        headers: {
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId, size: finalSize }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error removing from cart:", error));
    }
  };

  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [key, qty]) => {
      if (qty > 0) {
        const productId = Number(key.split('_')[0]);
        const item = products.find((p) => p.id === productId);
        if (item) total += item.new_price * qty;
      }
      return total;
    }, 0);
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  const addToWishlist = (itemId) => {
    if (!wishlist.includes(itemId)) {
      setWishlist((prev) => [...prev, itemId]);
    }
    if (localStorage.getItem('auth-token')) {
      fetch(`${API_BASE}/addtowishlist`, {
        method: 'POST',
        headers: {
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error adding to wishlist:", error));
    }
  };

  const removeFromWishlist = (itemId) => {
    setWishlist((prev) => prev.filter((id) => id !== itemId));
    if (localStorage.getItem('auth-token')) {
      fetch(`${API_BASE}/removefromwishlist`, {
        method: 'POST',
        headers: {
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error removing from wishlist:", error));
    }
  };

  const contextValue = {
    all_product: products,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    user,
    setUser,
    userLoading,
    getUser,
    mergeGuestCart,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    searchQuery,
    setSearchQuery,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
