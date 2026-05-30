import React, { useContext } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { useToast } from '../Toast/Toast';

export const Item = ({ id, name, image, new_price, old_price, numReviews, rating }) => {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useContext(ShopContext);
  const { showToast } = useToast();

  const discount = old_price && old_price > new_price
    ? Math.round(((old_price - new_price) / old_price) * 100)
    : null;

  const hasReviews = numReviews > 0;
  const isWishlisted = wishlist.includes(id);

  const handleAddToCart = () => {
    addToCart(id);
    showToast(`${name} added to your cart successfully!`, 'success');
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(id);
      showToast(`${name} removed from wishlist.`, 'info');
    } else {
      addToWishlist(id);
      showToast(`${name} added to wishlist!`, 'success');
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={`star ${star <= Math.round(rating) ? 'filled' : 'empty'}`}>★</span>
    ));
  };

  return (
    <div className='item'>
      <div className="item-image-wrapper">
        {discount && <div className="item-discount-badge">{discount}% OFF</div>}
        <Link to={`/product/${id}`}>
          <img onClick={() => window.scrollTo(0, 0)} src={image} alt={name} />
        </Link>
        <div className="item-actions">
          <button
            className={`item-wishlist-btn ${isWishlisted ? 'item-wishlist-btn--active' : ''}`}
            onClick={handleWishlist}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isWishlisted ? '♥' : '♡'}
          </button>
          <button className="item-cart-btn" onClick={handleAddToCart} title="Add to Cart">
            Add to Cart
          </button>
        </div>
      </div>
      <div className="item-info">
        <Link to={`/product/${id}`}>
          <p className="item-name">{name}</p>
        </Link>
        {hasReviews ? (
          <div className="item-stars">
            {renderStars()}
            <span className="item-rating-count">({numReviews})</span>
          </div>
        ) : (
          <p className="item-new-arrival">New Arrival</p>
        )}
        <div className="item-prices">
          <span className="item-price-new">₹{new_price.toFixed(2)}</span>
          {old_price && <span className="item-price-old">₹{old_price.toFixed(2)}</span>}
          {discount && <span className="item-price-discount">{discount}% off</span>}
        </div>
      </div>
    </div>
  );
};
