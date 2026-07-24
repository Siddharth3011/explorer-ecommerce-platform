import React, { useContext, useState, useEffect, useRef } from 'react';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import { useToast } from '../Toast/Toast';
import { io } from 'socket.io-client';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const SOCKET_URL = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

/* ── Renders n filled + (5-n) dull stars ── */
const StarRow = ({ rating, size = 16 }) => {
  const filled = Math.round(rating || 0);
  return (
    <div className="pd-review-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <img
          key={i}
          src={i < filled ? star_icon : star_dull_icon}
          alt={i < filled ? 'star' : 'empty star'}
          width={size}
          height={size}
        />
      ))}
    </div>
  );
};

/* ── Single review card ── */
const ReviewCard = ({ review }) => {
  const [imgOpen, setImgOpen] = useState(false);
  const date = review.date ? new Date(review.date).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : '';

  const hasRating = review.rating && review.rating > 0;

  return (
    <div className="pd-review-card">
      <div className="pd-review-card-top">
        <div className="pd-reviewer-avatar">
          {(review.name || 'A')[0].toUpperCase()}
        </div>
        <div className="pd-reviewer-meta">
          <p className="pd-reviewer-name">{review.name || 'Anonymous'}</p>
          {date && <p className="pd-reviewer-date">{date}</p>}
        </div>
        {hasRating && (
          <div className="pd-review-card-rating">
            <StarRow rating={review.rating} size={14} />
            <span className="pd-review-score">{review.rating}/5</span>
          </div>
        )}
      </div>

      {/* Comment — always rendered when present */}
      {(review.comment) && (
        <p className="review-text pd-review-comment">{review.comment}</p>
      )}

      {/* Image attachment */}
      {review.mediaUrl && review.mediaType === 'image' && (
        <>
          <img
            src={review.mediaUrl}
            alt="Review attachment"
            className="review-media-img pd-review-img"
            onClick={() => setImgOpen(true)}
          />
          {imgOpen && (
            <div className="pd-img-lightbox" onClick={() => setImgOpen(false)}>
              <img src={review.mediaUrl} alt="full size" />
              <button className="pd-lightbox-close">✕</button>
            </div>
          )}
        </>
      )}

      {/* Video attachment */}
      {review.mediaUrl && review.mediaType === 'video' && (
        <video
          controls
          src={review.mediaUrl}
          className="review-media-vid pd-review-video"
          preload="metadata"
        />
      )}
    </div>
  );
};

/* ── Main ProductDisplay component ── */
export const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart } = useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState('');
  const { showToast } = useToast();

  // Live review state — seeded from product prop, patched by socket
  const [liveRating,      setLiveRating]      = useState(product.rating     || 0);
  const [liveNumReviews,  setLiveNumReviews]  = useState(product.numReviews || 0);
  const [liveReviews,     setLiveReviews]     = useState(
    Array.isArray(product.reviews) ? [...product.reviews].reverse() : []
  );

  const socketRef = useRef(null);

  // Re-seed when navigating between products
  useEffect(() => {
    setLiveRating(product.rating     || 0);
    setLiveNumReviews(product.numReviews || 0);
    setLiveReviews(Array.isArray(product.reviews) ? [...product.reviews].reverse() : []);
  }, [product.id]);

  // Socket.io listener for real-time review updates
  useEffect(() => {
    const currentProductId = Number(product.id);
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socketRef.current.on('review_updated', (data) => {
      if (Number(data.productId) !== currentProductId) return;
      setLiveRating(data.rating);
      setLiveNumReviews(data.numReviews);
      if (data.allReviews && data.allReviews.length > 0) {
        setLiveReviews(data.allReviews);
      } else if (data.latestReview) {
        setLiveReviews((prev) => [data.latestReview, ...prev]);
      }
      setLiveReviews((prev) => {
        // Deduplicate by _id or name+date to avoid phantom duplicates
        const seen = new Set();
        return prev.filter((r) => {
          const key = r._id || `${r.name}-${r.date}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
    });

    return () => socketRef.current?.disconnect();
  }, [product.id]);

  const hasReviews   = liveNumReviews > 0;
  const filledStars  = hasReviews ? Math.round(liveRating) : 0;
  const stock        = product.stock ?? 10;
  const isOutOfStock = stock === 0;

  return (
    <>
      <div className='productdisplay fade-in'>
        {/* ── Left: images ── */}
        <div className="productdisplay-left">
          <div className="productdisplay-img-list">
            {[0, 1, 2, 3].map((i) => (
              <img key={i} src={product.image} alt={product.name} />
            ))}
          </div>
          <div className="productdisplay-img">
            <img className='productdisplay-main-img' src={product.image} alt={product.name} />
          </div>
        </div>

        {/* ── Right: details ── */}
        <div className="productdisplay-right">
          <h1>{product.name}</h1>

          {/* Star bar */}
          {hasReviews ? (
            <div className="productdisplay-right-stars">
              {Array.from({ length: 5 }, (_, i) => (
                <img
                  key={i}
                  src={i < filledStars ? star_icon : star_dull_icon}
                  alt={i < filledStars ? 'star' : 'dull star'}
                />
              ))}
              <p>({liveNumReviews}) &nbsp;·&nbsp; {liveRating.toFixed(1)} / 5</p>
            </div>
          ) : (
            <p className="productdisplay-no-reviews">No reviews yet</p>
          )}

          {/* Top 2 review chips */}
          {liveReviews.slice(0, 2).length > 0 && (
            <div className="productdisplay-top-reviews">
              {liveReviews.slice(0, 2).map((r, i) => (
                <div key={i} className="productdisplay-review-chip">
                  <span className="review-chip-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="review-chip-text">"{r.comment || r.review}"</span>
                </div>
              ))}
            </div>
          )}

          <div className="productdisplay-right-prices">
            <div className="productdisplay-right-price-old">₹{product.old_price}</div>
            <div className="productdisplay-right-price-new">₹{product.new_price}</div>
          </div>

          {isOutOfStock ? (
            <p className="productdisplay-stock productdisplay-stock--out">Out of Stock</p>
          ) : stock <= 5 ? (
            <p className="productdisplay-stock productdisplay-stock--low">⚠ Only {stock} left in stock! Running out fast!</p>
          ) : (
            <p className="productdisplay-stock productdisplay-stock--in">✓ In Stock ({stock} left)</p>
          )}

          <div className="productdisplay-right-description">
            {product.description || 'A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.'}
          </div>

          <div className="productdisplay-right-size">
            <h1>Select Size</h1>
            <div className="productdisplay-right-sizes">
              {SIZES.map((size) => (
                <div
                  key={size}
                  className={selectedSize === size ? 'size-active' : ''}
                  onClick={() => !isOutOfStock && setSelectedSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={isOutOfStock}
            style={isOutOfStock ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
            onClick={() => {
              if (isOutOfStock) return;
              if (!selectedSize) {
                showToast('Please select a size first!', 'error');
                return;
              }
              addToCart(product.id, selectedSize, showToast);
              showToast(`${product.name} (Size: ${selectedSize}) added to cart successfully!`, 'success');
            }}
          >
            {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>

          <p className='productdisplay-right-category'><span>Category :</span> {product.category}, T-Shirt, Crop Top</p>
          <p className='productdisplay-right-category'><span>Tags :</span> Modern, Latest</p>
        </div>
      </div>

      {/* ══ Customer Reviews & Ratings section ══ */}
      <section className="pd-reviews-section">
        <div className="pd-reviews-header">
          <h2 className="pd-reviews-title">Customer Reviews &amp; Ratings</h2>
          {hasReviews && (
            <div className="pd-reviews-summary">
              <span className="pd-reviews-avg">{liveRating.toFixed(1)}</span>
              <StarRow rating={liveRating} size={20} />
              <span className="pd-reviews-count">{liveNumReviews} review{liveNumReviews !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {liveReviews.length === 0 ? (
          <div className="pd-reviews-empty">
            <span className="pd-reviews-empty-icon">✍️</span>
            <p>No reviews yet. Be the first to review this product after purchasing!</p>
          </div>
        ) : (
          <div className="pd-reviews-grid">
            {liveReviews.map((review, i) => (
              <ReviewCard key={review._id || i} review={review} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};
