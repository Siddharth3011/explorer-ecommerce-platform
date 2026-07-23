import React, { useContext, useState, useEffect, useRef } from 'react';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import { useToast } from '../Toast/Toast';
import { io } from 'socket.io-client';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const SOCKET_URL = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

export const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart } = useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState('');
  const { showToast } = useToast();

  // Live review state — seeded from prop, updated via socket
  const [liveRating, setLiveRating]       = useState(product.rating || 0);
  const [liveNumReviews, setLiveNumReviews] = useState(product.numReviews || 0);
  const [liveTopReviews, setLiveTopReviews] = useState(product.reviews?.slice(-5).reverse() || []);

  const socketRef = useRef(null);

  useEffect(() => {
    // Reset live state when navigating to a different product
    setLiveRating(product.rating || 0);
    setLiveNumReviews(product.numReviews || 0);
    setLiveTopReviews(product.reviews?.slice(-5).reverse() || []);
  }, [product.id]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socketRef.current.on('review_updated', (data) => {
      if (data.productId === product.id) {
        setLiveRating(data.rating);
        setLiveNumReviews(data.numReviews);
        setLiveTopReviews(data.topReviews || []);
        showToast('A new review was just posted for this product!', 'info');
      }
    });

    return () => socketRef.current?.disconnect();
  }, [product.id]);

  const hasReviews  = liveNumReviews > 0;
  const filledStars = hasReviews ? Math.round(liveRating) : 0;
  const stock       = product.stock ?? 10;
  const isOutOfStock = stock === 0;

  return (
    <div className='productdisplay fade-in'>
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={product.image} alt={product.name} />
          <img src={product.image} alt={product.name} />
          <img src={product.image} alt={product.name} />
          <img src={product.image} alt={product.name} />
        </div>
        <div className="productdisplay-img">
          <img className='productdisplay-main-img' src={product.image} alt={product.name} />
        </div>
      </div>

      <div className="productdisplay-right">
        <h1>{product.name}</h1>

        {/* ── Stars & review count ── */}
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

        {/* ── Live top reviews snippet ── */}
        {liveTopReviews.length > 0 && (
          <div className="productdisplay-top-reviews">
            {liveTopReviews.slice(0, 2).map((r, i) => (
              <div key={i} className="productdisplay-review-chip">
                <span className="review-chip-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span className="review-chip-text">"{r.review}"</span>
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
  );
};
