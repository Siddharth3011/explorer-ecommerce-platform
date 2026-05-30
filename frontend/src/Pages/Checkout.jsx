import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './Checkout.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

const generateOrderId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'ORD-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const CARD_TYPES = {
  visa: /^4/,
  mastercard: /^5[1-5]/,
  amex: /^3[47]/,
};

const detectCard = (num) => {
  const clean = num.replace(/\D/g, '');
  if (CARD_TYPES.visa.test(clean)) return 'VISA';
  if (CARD_TYPES.mastercard.test(clean)) return 'MC';
  if (CARD_TYPES.amex.test(clean)) return 'AMEX';
  return '';
};

const formatCard = (val) => {
  const clean = val.replace(/\D/g, '').slice(0, 16);
  return clean.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (val) => {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  return clean;
};

export const Checkout = () => {
  const { all_product, cartItems, getTotalCartAmount } = useContext(ShopContext);
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState({});

  const [shipping, setShipping] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', pincode: '', state: '',
  });

  const [card, setCard] = useState({
    number: '', name: '', expiry: '', cvv: '',
  });

  const cartLines = Object.entries(cartItems)
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => {
      const [idStr, size] = key.split('_');
      const product = all_product.find((p) => p.id === Number(idStr));
      return product ? { product, size, qty, key } : null;
    })
    .filter(Boolean);

  const total = getTotalCartAmount();

  const validateForm = () => {
    const e = {};
    if (!shipping.fullName.trim()) e.fullName = 'Required';
    if (!shipping.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Invalid email';
    if (!shipping.phone.match(/^\d{10}$/)) e.phone = '10-digit number required';
    if (!shipping.address.trim()) e.address = 'Required';
    if (!shipping.city.trim()) e.city = 'Required';
    if (!shipping.pincode.match(/^\d{6}$/)) e.pincode = '6-digit PIN required';
    if (!shipping.state.trim()) e.state = 'Required';
    if (card.number.replace(/\s/g, '').length < 16) e.cardNumber = 'Invalid card number';
    if (!card.name.trim()) e.cardName = 'Required';
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'MM/YY format';
    if (!card.cvv.match(/^\d{3,4}$/)) e.cvv = 'Invalid CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const token = localStorage.getItem('auth-token');
    const orderRef = generateOrderId();

    try {
      const response = await fetch(`${API_BASE}/placeorder`, {
        method: 'POST',
        headers: {
          'auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderRef,
          address: shipping,
          items: cartLines.map(({ product, size, qty }) => ({
            productId: product.id,
            name: product.name,
            image: product.image,
            price: product.new_price,
            qty: qty,
            size: size
          })),
          amount: total
        }),
      });
      const data = await response.json();
      setLoading(false);
      if (data.success) {
        setOrderId(orderRef);
        setStep('confirmed');
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Failed to place order');
    }
  };

  return (
    <div className="checkout-page">
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            className="checkout-layout"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="checkout-left">
              <h2 className="checkout-section-title">Shipping Details</h2>
              <div className="checkout-form-grid">
                {[
                  { key: 'fullName', label: 'Full Name', placeholder: 'Siddharth Pandey' },
                  { key: 'email', label: 'Email Address', placeholder: 'you@example.com' },
                  { key: 'phone', label: 'Phone Number', placeholder: '9876543210' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="checkout-field">
                    <label>{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={shipping[key]}
                      onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
                      className={errors[key] ? 'checkout-input--error' : ''}
                    />
                    {errors[key] && <span className="checkout-error">{errors[key]}</span>}
                  </div>
                ))}
                <div className="checkout-field checkout-field--full">
                  <label>Address</label>
                  <input
                    type="text"
                    placeholder="Street, Building, Flat No."
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className={errors.address ? 'checkout-input--error' : ''}
                  />
                  {errors.address && <span className="checkout-error">{errors.address}</span>}
                </div>
                {[
                  { key: 'city', label: 'City', placeholder: 'Mumbai' },
                  { key: 'pincode', label: 'PIN Code', placeholder: '400001' },
                  { key: 'state', label: 'State', placeholder: 'Maharashtra' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="checkout-field">
                    <label>{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={shipping[key]}
                      onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
                      className={errors[key] ? 'checkout-input--error' : ''}
                    />
                    {errors[key] && <span className="checkout-error">{errors[key]}</span>}
                  </div>
                ))}
              </div>

              <h2 className="checkout-section-title" style={{ marginTop: 40 }}>Payment</h2>
              <div className="checkout-card-panel">
                <div className="checkout-card-preview">
                  <div className="checkout-card-chip" />
                  <p className="checkout-card-number-preview">
                    {card.number || '•••• •••• •••• ••••'}
                  </p>
                  <div className="checkout-card-bottom">
                    <span>{card.name || 'CARD HOLDER'}</span>
                    <span>{card.expiry || 'MM/YY'}</span>
                  </div>
                  <div className="checkout-card-type">{detectCard(card.number)}</div>
                </div>

                <div className="checkout-form-grid checkout-card-inputs">
                  <div className="checkout-field checkout-field--full">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                      className={errors.cardNumber ? 'checkout-input--error' : ''}
                    />
                    {errors.cardNumber && <span className="checkout-error">{errors.cardNumber}</span>}
                  </div>
                  <div className="checkout-field checkout-field--full">
                    <label>Name on Card</label>
                    <input
                      type="text"
                      placeholder="SIDDHARTH PANDEY"
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
                      className={errors.cardName ? 'checkout-input--error' : ''}
                    />
                    {errors.cardName && <span className="checkout-error">{errors.cardName}</span>}
                  </div>
                  <div className="checkout-field">
                    <label>Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      className={errors.expiry ? 'checkout-input--error' : ''}
                    />
                    {errors.expiry && <span className="checkout-error">{errors.expiry}</span>}
                  </div>
                  <div className="checkout-field">
                    <label>CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })}
                      className={errors.cvv ? 'checkout-input--error' : ''}
                    />
                    {errors.cvv && <span className="checkout-error">{errors.cvv}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="checkout-right">
              <h2 className="checkout-section-title">Order Summary</h2>
              <div className="checkout-order-items">
                {cartLines.map(({ product, size, qty, key }) => (
                  <div key={key} className="checkout-order-item">
                    <img src={product.image} alt={product.name} />
                    <div>
                      <p className="checkout-item-name">{product.name}</p>
                      <p className="checkout-item-qty">Size: {size} | Qty: {qty}</p>
                    </div>
                    <p className="checkout-item-price">₹{(product.new_price * qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="checkout-totals">
                <div className="checkout-total-row"><span>Subtotal</span><span>₹{total}</span></div>
                <div className="checkout-total-row"><span>Shipping</span><span className="checkout-free">Free</span></div>
                <div className="checkout-total-row checkout-total-row--bold"><span>Total</span><span>₹{total}</span></div>
              </div>

              <button
                className="checkout-place-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <span className="checkout-spinner" />
                ) : (
                  'Place Order'
                )}
              </button>
              <p className="checkout-secure-note">🔒 Secured by 256-bit SSL encryption</p>
            </div>
          </motion.div>
        )}

        {step === 'confirmed' && (
          <motion.div
            key="confirmed"
            className="checkout-confirmation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 22 }}
          >
            <motion.div
              className="checkout-confirm-check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            >
              ✓
            </motion.div>
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              Order Confirmed!
            </motion.h2>
            <motion.p className="checkout-confirm-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
              Thank you for shopping with Shopper. Your items are being prepared.
            </motion.p>
            <motion.div className="checkout-order-ref" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <span>Order Reference</span>
              <strong>{orderId}</strong>
            </motion.div>
            <motion.div className="checkout-confirm-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <Link to='/'><button className="checkout-shop-more-btn">Continue Shopping</button></Link>
              <Link to='/orders'><button className="checkout-track-btn">Track Order</button></Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
