import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import { AuraAssistant } from '../AuraAssistant/AuraAssistant';

const CATEGORY_ROUTE = { men: '/mens', women: '/womens', kid: '/kids' };

export const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [auraOpen, setAuraOpen] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const { getTotalCartItems, user, darkMode, setDarkMode, searchQuery, setSearchQuery, all_product } = useContext(ShopContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const match = all_product.find((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (match) {
      const route = CATEGORY_ROUTE[match.category] || '/mens';
      navigate(route);
    } else {
      const path = window.location.pathname;
      const isCategoryPage = path === '/mens' || path === '/womens' || path === '/kids';
      if (!isCategoryPage) {
        navigate('/mens');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    window.location.replace('/');
  };

  const dropdownItems = [
    { to: '/profile',  icon: '👤', label: 'Your Profile' },
    { to: '/wishlist', icon: '♡',  label: 'Your Wishlist' },
    { to: '/orders',   icon: '📦', label: 'Your Orders' },
    { to: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const avatarInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img src={logo} alt="logo" />
        <Link to='/' onClick={() => { setMenu("shop"); setMenuActive(false); }}>
          <p>SHOPPER</p>
        </Link>
      </div>

      <form className="nav-search" onSubmit={handleSearch}>
        <svg className="nav-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search for products, brands and more..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="nav-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        <button type="submit">Search</button>
      </form>

      <div className="nav-right">
        <ul className="nav-menu">
          <li onClick={() => { setMenu("shop"); setMenuActive(false); }}>
            <Link to='/'>Shop</Link>
            {menu === "shop" ? <hr /> : <></>}
          </li>
          <li onClick={() => { setMenu("mens"); setMenuActive(false); }}>
            <Link to='/mens'>Men</Link>
            {menu === "mens" ? <hr /> : <></>}
          </li>
          <li onClick={() => { setMenu("womens"); setMenuActive(false); }}>
            <Link to='/womens'>Women</Link>
            {menu === "womens" ? <hr /> : <></>}
          </li>
          <li onClick={() => { setMenu("kids"); setMenuActive(false); }}>
            <Link to='/kids'>Kids</Link>
            {menu === "kids" ? <hr /> : <></>}
          </li>
        </ul>

        <button
          className="nav-aura-btn"
          onClick={() => setAuraOpen(true)}
          title="Open Aura AI"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          Ask Aura
        </button>

        <button
          className="nav-darkmode-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div className="nav-login-cart">
          {localStorage.getItem('auth-token') ? (
            <div className="nav-profile-wrapper" ref={dropdownRef}>
              <motion.div
                className="nav-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {avatarInitial}
              </motion.div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="nav-dropdown"
                    initial={{ opacity: 0, y: -16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="nav-dropdown-header">
                      <div className="nav-dropdown-avatar">{avatarInitial}</div>
                      <div>
                        <p className="nav-dropdown-name">{user.name || 'User'}</p>
                        <p className="nav-dropdown-email">{user.email || ''}</p>
                      </div>
                    </div>
                    <div className="nav-dropdown-divider" />

                    {dropdownItems.map((item) => (
                      <motion.div key={item.to} whileHover={{ x: 4, backgroundColor: 'rgba(99,102,241,0.06)' }} style={{ borderRadius: 8 }}>
                        <Link
                          to={item.to}
                          className="nav-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="nav-dropdown-icon">{item.icon}</span>
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}

                    <div className="nav-dropdown-divider" />
                    <motion.button
                      className="nav-dropdown-logout"
                      onClick={handleLogout}
                      whileHover={{ x: 4, backgroundColor: 'rgba(239,68,68,0.07)' }}
                    >
                      <span>🚪</span> Logout
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to='/login'><button className="nav-login-btn">Login</button></Link>
          )}
          <div className="nav-cart-wrapper">
            <Link to='/cart'><img className="nav-cart-icon" src={cart_icon} alt="cart" /></Link>
            {getTotalCartItems() > 0 && (
              <div className="nav-cart-count">{getTotalCartItems()}</div>
            )}
          </div>
        </div>
        <button className={`nav-hamburger ${menuActive ? 'active' : ''}`} onClick={() => setMenuActive(!menuActive)} aria-label="Toggle Navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuActive && (
        <ul className="nav-menu-dropdown">
          <li onClick={() => { setMenu("shop"); setMenuActive(false); }}>
            <Link to='/'>Shop</Link>
          </li>
          <li onClick={() => { setMenu("mens"); setMenuActive(false); }}>
            <Link to='/mens'>Men</Link>
          </li>
          <li onClick={() => { setMenu("womens"); setMenuActive(false); }}>
            <Link to='/womens'>Women</Link>
          </li>
          <li onClick={() => { setMenu("kids"); setMenuActive(false); }}>
            <Link to='/kids'>Kids</Link>
          </li>
        </ul>
      )}

      <AuraAssistant isOpen={auraOpen} onClose={() => setAuraOpen(false)} />
    </div>
  );
};
