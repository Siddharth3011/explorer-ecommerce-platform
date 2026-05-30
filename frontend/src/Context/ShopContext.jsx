import React, { createContext, useState, useEffect } from "react";

export const ShopContext = createContext(null);

const API_BASE = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

const ShopContextProvider = (props) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState({ name: '', email: '', date: null, loggedIn: false });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const getUser = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/getuser`, {
        method: 'POST',
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setUser({ name: data.name, email: data.email, date: data.date, loggedIn: true });
        // Restore cart items from database
        fetch(`${API_BASE}/getcart`, {
          method: 'POST',
          headers: {
            'auth-token': token,
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((cartData) => {
            if (cartData) setCartItems(cartData);
          })
          .catch((err) => console.error("Error retrieving user cart:", err));

        // Restore wishlist items from database
        fetch(`${API_BASE}/getwishlist`, {
          method: 'POST',
          headers: {
            'auth-token': token,
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((wishlistData) => {
            if (wishlistData) {
              const wishlistIds = Object.keys(wishlistData).map(Number);
              setWishlist(wishlistIds);
            }
          })
          .catch((err) => console.error("Error retrieving user wishlist:", err));
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const addToCart = (itemId, size) => {
    const finalSize = size || 'M';
    const key = `${itemId}_${finalSize}`;
    setCartItems((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    if (localStorage.getItem('auth-token')) {
      fetch(`${API_BASE}/addtocart`, {
        method: 'POST',
        headers: {
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId, size: finalSize }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error adding to cart:", error));
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
    darkMode,
    setDarkMode,
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
