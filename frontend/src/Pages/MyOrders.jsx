import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useToast } from '../Components/Toast/Toast';
import './MyOrders.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

/* ── Star selector sub-component ── */
const StarSelector = ({ value, onChange }) => (
  <div className="review-stars-selector" aria-label="Star rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`review-star-btn ${star <= value ? 'review-star-btn--active' : ''}`}
        onClick={() => onChange(star)}
        aria-label={`${star} star${star > 1 ? 's' : ''}`}
      >
        ★
      </button>
    ))}
  </div>
);

/* ── Inline review drawer for a single item ── */
const ReviewDrawer = ({ item, onClose }) => {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { showToast('Please select a star rating.', 'error'); return; }
    if (!comment.trim()) { showToast('Please write a short review.', 'error'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/addreview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token') || '',
        },
        body: JSON.stringify({
          productId: item.productId,
          rating,
          review: comment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review submitted! Thank you 🎉', 'success');
        onClose();
      } else {
        showToast(data.message || 'Failed to submit review.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="review-drawer"
      initial={{ opacity: 0, y: -10, scaleY: 0.92 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.94 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ originY: 0 }}
    >
      <form className="review-form" onSubmit={handleSubmit}>
        <p className="review-form-title">Rate &amp; Review: <span>{item.name}</span></p>

        <div className="review-form-row">
          <label className="review-form-label">Your Rating</label>
          <StarSelector value={rating} onChange={setRating} />
          {rating > 0 && (
            <span className="review-rating-label">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>

        <div className="review-form-row">
          <label className="review-form-label" htmlFor={`review-comment-${item.productId}`}>
            Your Review
          </label>
          <textarea
            id={`review-comment-${item.productId}`}
            className="review-textarea"
            placeholder="Share what you liked, how it fits, or any tips for other buyers..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="review-char-count">{comment.length} / 500</p>
        </div>

        <div className="review-form-actions">
          <button type="button" className="review-cancel-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="review-submit-btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

/* ── Main MyOrders page ── */
export const MyOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  // openReview key: `${orderId}-${itemIndex}` or null
  const [openReview, setOpenReview] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const response = await fetch(`${API_BASE}/api/orders`, {
          method: 'GET',
          headers: { 'auth-token': token || '' },
        });
        const data = await response.json();
        if (Array.isArray(data)) setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleReview = useCallback((key) => {
    setOpenReview((prev) => (prev === key ? null : key));
  }, []);

  if (loading) {
    return (
      <div className="myorders-page fade-in">
        <h1 className="myorders-title">Your Orders</h1>
        <div className="myorders-loading">
          <span className="myorders-spinner" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="myorders-page fade-in"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h1 className="myorders-title">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="myorders-empty">
          <motion.div
            className="myorders-bag-icon"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            🛍️
          </motion.div>
          <h2>No orders yet</h2>
          <p>Looks like you haven't placed any orders. Start shopping to see them here!</p>
          <Link to='/'><button className="myorders-shop-btn">Browse Products</button></Link>
        </div>
      ) : (
        <div className="myorders-list">
          {orders.map((order) => (
            <div key={order._id || order.orderId} className="myorders-card">

              {/* ── Order header ── */}
              <div className="myorders-card-header">
                <div>
                  <p className="myorders-lbl">Order Placed</p>
                  <p className="myorders-val">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="myorders-lbl">Total Amount</p>
                  <p className="myorders-val">₹{order.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="myorders-lbl">Order ID</p>
                  <p className="myorders-val">{order.orderId}</p>
                </div>
              </div>

              {/* ── Item rows ── */}
              <div className="myorders-card-items">
                {order.items.map((item, idx) => {
                  const reviewKey = `${order._id || order.orderId}-${idx}`;
                  const isOpen    = openReview === reviewKey;
                  return (
                    <div key={idx}>
                      <div className="myorders-card-item">
                        <img src={item.image} alt={item.name} className="myorders-item-img" />
                        <div className="myorders-item-details">
                          <h4>{item.name}</h4>
                          <p>Size: {item.size} | Qty: {item.qty}</p>
                          <p className="myorders-item-price">₹{item.price.toFixed(2)}</p>
                        </div>
                        <button
                          className={`myorders-review-btn ${isOpen ? 'myorders-review-btn--active' : ''}`}
                          onClick={() => toggleReview(reviewKey)}
                          aria-expanded={isOpen}
                        >
                          {isOpen ? '✕ Close' : '⭐ Rate & Review'}
                        </button>
                      </div>

                      {/* ── Animated inline review drawer ── */}
                      <AnimatePresence>
                        {isOpen && (
                          <ReviewDrawer
                            item={item}
                            onClose={() => setOpenReview(null)}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
