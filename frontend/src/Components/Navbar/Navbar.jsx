import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import { AuraAssistant } from '../AuraAssistant/AuraAssistant.jsx';

const CATEGORY_ROUTE = { men: '/mens', women: '/womens', kid: '/kids' };

export const Navbar = () => {
  const [menu, setMenu] = useState('shop');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [auraOpen, setAuraOpen] = useState(false);
  const [menuActive, setMenuActive] = useState(false);

  const { getTotalCartItems, user, darkMode, setDarkMode, searchQuery, setSearchQuery, all_product } = useContext(ShopContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuActive ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuActive]);

  // Auto-close mobile menu when resizing back to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 769) setMenuActive(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    const match = all_product.find((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    if (match) {
      navigate(CATEGORY_ROUTE[match.category] || '/mens');
    } else {
      const path = window.location.pathname;
      if (path !== '/mens' && path !== '/womens' && path !== '/kids') navigate('/mens');
    }
    setMenuActive(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    window.location.replace('/');
  };

  const handleNavLink = (menuName) => {
    setMenu(menuName);
    setMenuActive(false);
  };

  const dropdownItems = [
    { to: '/profile', icon: '👤', label: 'Your Profile' },
    { to: '/wishlist', icon: '♡', label: 'Your Wishlist' },
    { to: '/orders', icon: '📦', label: 'Your Orders' },
    { to: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const avatarInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">

        {/* ── Row 1: Logo ──────────────────────────────── */}
        <div className="nav-logo">
          <img src={logo} alt="Explorer logo" />
          <Link to='/' onClick={() => handleNavLink('shop')}>
            <p>EXPLORER</p>
          </Link>
        </div>

        {/* ── Row 1: Search (drops to row 2 on mobile) ─ */}
        <form className="nav-search" onSubmit={handleSearch} role="search">
          <svg className="nav-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search for products"
          />
          {searchQuery && (
            <button type="button" className="nav-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
              ×
            </button>
          )}
          <button type="submit" aria-label="Submit search">Search</button>
        </form>

        {/* ── Row 1: Right side ─────────────────────────── */}
        <div className="nav-right">
          {/* Desktop nav links — hidden on mobile via CSS */}
          <ul className="nav-menu">
            {[
              { key: 'shop', to: '/', label: 'Shop' },
              { key: 'mens', to: '/mens', label: 'Men' },
              { key: 'womens', to: '/womens', label: 'Women' },
              { key: 'kids', to: '/kids', label: 'Kids' },
            ].map(({ key, to, label }) => (
              <li key={key} onClick={() => handleNavLink(key)}>
                <Link to={to}>{label}</Link>
                {menu === key && <hr aria-hidden="true" />}
              </li>
            ))}
          </ul>

          {/* Utility actions — grouped for consistent mobile spacing */}
          <div className="nav-actions">
            <button className="nav-aura-btn" onClick={() => setAuraOpen(true)} aria-label="Open Aura AI assistant">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
              <span className="aura-label">Ask Aura</span>
            </button>

            <button
              className="nav-darkmode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
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
                    role="button"
                    aria-label="Open profile menu"
                    aria-expanded={dropdownOpen}
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
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        role="menu"
                      >
                        <div className="nav-dropdown-header">
                          <div className="nav-dropdown-avatar" aria-hidden="true">{avatarInitial}</div>
                          <div>
                            <p className="nav-dropdown-name">{user.name || 'User'}</p>
                            <p className="nav-dropdown-email">{user.email || ''}</p>
                          </div>
                        </div>
                        <div className="nav-dropdown-divider" />
                        {dropdownItems.map((item) => (
                          <motion.div key={item.to} whileHover={{ x: 4, backgroundColor: 'rgba(99,102,241,0.06)' }} style={{ borderRadius: 8 }}>
                            <Link to={item.to} className="nav-dropdown-item" onClick={() => setDropdownOpen(false)} role="menuitem">
                              <span className="nav-dropdown-icon" aria-hidden="true">{item.icon}</span>
                              {item.label}
                            </Link>
                          </motion.div>
                        ))}
                        <div className="nav-dropdown-divider" />
                        <motion.button
                          className="nav-dropdown-logout"
                          onClick={handleLogout}
                          whileHover={{ x: 4, backgroundColor: 'rgba(239,68,68,0.07)' }}
                          role="menuitem"
                        >
                          <span aria-hidden="true">🚪</span> Logout
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to='/login'><button className="nav-login-btn">Login</button></Link>
              )}

              <div className="nav-cart-wrapper">
                <Link to='/cart' aria-label="View cart">
                  <img className="nav-cart-icon" src={cart_icon} alt="Cart" />
                </Link>
                {getTotalCartItems() > 0 && (
                  <div className="nav-cart-count" aria-label={`${getTotalCartItems()} items in cart`}>
                    {getTotalCartItems()}
                  </div>
                )}
              </div>
            </div>

            {/* Hamburger — mobile/tablet only */}
            <button
              className={`nav-hamburger ${menuActive ? 'active' : ''}`}
              onClick={() => setMenuActive(!menuActive)}
              aria-label={menuActive ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuActive}
              aria-controls="mobile-nav-menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer (sibling to <nav>, escapes flex context) ── */}
      <AnimatePresence>
        {menuActive && (
          <>
            <motion.div
              className="mobile-menu-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuActive(false)}
              aria-hidden="true"
            />
            <motion.ul
              id="mobile-nav-menu"
              className="nav-menu-dropdown"
              role="list"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {[
                { key: 'shop', to: '/', label: 'Shop' },
                { key: 'mens', to: '/mens', label: 'Men' },
                { key: 'womens', to: '/womens', label: 'Women' },
                { key: 'kids', to: '/kids', label: 'Kids' },
              ].map(({ key, to, label }) => (
                <li key={key} onClick={() => handleNavLink(key)}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>

      <AuraAssistant isOpen={auraOpen} onClose={() => setAuraOpen(false)} />
    </>
  );
};
