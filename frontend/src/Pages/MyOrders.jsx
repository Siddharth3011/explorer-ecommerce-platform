import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useToast } from '../Components/Toast/Toast';
import './MyOrders.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

/* ── Star selector ── */
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

/* ── Inline review drawer ── */
const ReviewDrawer = ({ item, onClose, onReviewDone }) => {
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // At least one of rating, comment, or media must be provided
    const hasRating  = rating > 0;
    const hasComment = comment.trim().length > 0;
    const hasMedia   = !!mediaFile;
    if (!hasRating && !hasComment && !hasMedia) {
      showToast('Please add a star rating, a comment, or a photo/video.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let mediaUrl  = '';
      let mediaType = '';

      // Step 1: upload media if attached
      if (mediaFile) {
        const formData = new FormData();
        formData.append('media', mediaFile);
        const uploadRes = await fetch(`${API_BASE}/upload/review-media`, {
          method: 'POST',
          headers: { 'auth-token': localStorage.getItem('auth-token') || '' },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          showToast(uploadData.message || 'Media upload failed.', 'error');
          setSubmitting(false);
          return;
        }
        mediaUrl  = uploadData.url;
        mediaType = uploadData.mediaType;
      }

      // Step 2: submit review
      const res = await fetch(`${API_BASE}/addreview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token') || '',
        },
        body: JSON.stringify({
          productId: item.productId,
          rating,
          comment: comment.trim(),
          mediaUrl,
          mediaType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Review submitted! Thank you 🎉', 'success');
        onReviewDone(item.productId);
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

  const isVideo = mediaFile && mediaFile.type.startsWith('video');

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

        {/* Star rating */}
        <div className="review-form-row">
          <label className="review-form-label">Your Rating</label>
          <StarSelector value={rating} onChange={setRating} />
          {rating > 0 && (
            <span className="review-rating-label">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>

        {/* Comment */}
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

        {/* Media attachment */}
        <div className="review-form-row">
          <label className="review-form-label">Photo or Video (optional)</label>
          <div className="review-media-row">
            <label className="review-media-label" htmlFor={`review-media-${item.productId}`}>
              📎 Attach file
            </label>
            <input
              id={`review-media-${item.productId}`}
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm"
              className="review-media-input"
              onChange={handleFileChange}
            />
            {mediaFile && (
              <span className="review-media-name">
                {mediaFile.name}
                <button type="button" className="review-media-clear" onClick={clearMedia} aria-label="Remove attachment">✕</button>
              </span>
            )}
          </div>

          {/* Local preview */}
          {mediaPreview && (
            <div className="review-media-preview">
              {isVideo ? (
                <video src={mediaPreview} controls className="review-preview-video" />
              ) : (
                <img src={mediaPreview} alt="preview" className="review-preview-img" />
              )}
            </div>
          )}
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
  const [openReview, setOpenReview]         = useState(null);
  // Set of productIds the current user has already reviewed
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());

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

  // Fetch which products this user has already reviewed
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;
    fetch(`${API_BASE}/user/reviewed-products`, {
      headers: { 'auth-token': token },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviewedIds)) {
          setReviewedProductIds(new Set(data.reviewedIds));
        }
      })
      .catch(() => {}); // non-critical
  }, []);

  // Called by ReviewDrawer after a successful submission
  const handleReviewDone = useCallback((productId) => {
    setReviewedProductIds((prev) => new Set([...prev, productId]));
    setOpenReview(null);
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

              <div className="myorders-card-items">
                {order.items.map((item, idx) => {
                  const reviewKey   = `${order._id || order.orderId}-${idx}`;
                  const isOpen      = openReview === reviewKey;
                  const hasReviewed = reviewedProductIds.has(item.productId);
                  return (
                    <div key={idx}>
                      <div className="myorders-card-item">
                        <img src={item.image} alt={item.name} className="myorders-item-img" />
                        <div className="myorders-item-details">
                          <h4>{item.name}</h4>
                          <p>Size: {item.size} | Qty: {item.qty}</p>
                          <p className="myorders-item-price">₹{item.price.toFixed(2)}</p>
                        </div>

                        {hasReviewed ? (
                          <div className="myorders-reviewed-badge" title="You have already reviewed this product">
                            ✓ Reviewed
                          </div>
                        ) : (
                          <button
                            className={`myorders-review-btn ${isOpen ? 'myorders-review-btn--active' : ''}`}
                            onClick={() => toggleReview(reviewKey)}
                            aria-expanded={isOpen}
                          >
                            {isOpen ? '✕ Close' : '⭐ Rate & Review'}
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {isOpen && !hasReviewed && (
                          <ReviewDrawer
                            item={item}
                            onClose={() => setOpenReview(null)}
                            onReviewDone={handleReviewDone}
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
