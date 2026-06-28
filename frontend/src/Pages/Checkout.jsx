import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './Checkout.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'dummy_key';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const Checkout = () => {
  const { all_product, cartItems, getTotalCartAmount } = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [shipping, setShipping] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', pincode: '', state: '',
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const token = localStorage.getItem('auth-token');

    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        setLoading(false);
        return alert('Razorpay SDK failed to load. Are you online?');
      }

      // Initialize Razorpay Order via Backend
      const orderResponse = await fetch(`${API_BASE}/api/payment/orders`, {
        method: 'POST',
        headers: { 'auth-token': token || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        setLoading(false);
        return alert('Failed to initialize payment');
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Explorer E-Commerce",
        description: "Test Transaction",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Once payment succeeds, hit placeorder to save DB document and clear cart
            const placeOrderRes = await fetch(`${API_BASE}/placeorder`, {
              method: 'POST',
              headers: { 'auth-token': token || '', 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_payment_id,
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
            const data = await placeOrderRes.json();
            setLoading(false);
            if (data.success) {
              // Immediately terminate execution and redirect securely to orders dashboard
              navigate('/orders', { replace: true });
            } else {
              alert(data.message || 'Failed to record order in database');
            }
          } catch (err) {
            setLoading(false);
            console.error('Save order error:', err);
            alert('Payment succeeded but order saving failed.');
          }
        },
        prefill: {
          name: shipping.fullName,
          email: shipping.email,
          contact: shipping.phone,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };
      
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setLoading(false);
      console.error('Checkout pipeline error:', err);
      alert('An error occurred during checkout');
    }
  };

  return (
    <div className="checkout-page">
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </div>
  );
};
