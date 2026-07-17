import React, { useContext } from 'react';
import './CartItems.css';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { useToast } from '../Toast/Toast';
import remove_icon from '../Assets/cart_cross_icon.png';

export const CartItems = () => {
  const { all_product, cartItems, addToCart, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const cartLines = Object.entries(cartItems)
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => {
      const [idStr, size] = key.split('_');
      const product = all_product.find((p) => p.id === Number(idStr));
      return product ? { product, size, qty, key } : null;
    })
    .filter(Boolean);

  if (cartLines.length === 0) {
    return (
      <div className='cartitems cartitems-empty fade-in'>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to='/'><button className='cartitems-shop-btn'>Continue Shopping</button></Link>
      </div>
    );
  }

  return (
    <div className='cartitems fade-in'>

      {/* Desktop column headers — hidden on mobile */}
      <div className="cart-header">
        <span className="col-img" />
        <span className="col-info">Title</span>
        <span className="col-size">Size</span>
        <span className="col-price">Price</span>
        <span className="col-qty">Quantity</span>
        <span className="col-total">Total</span>
        <span className="col-remove">Remove</span>
      </div>
      <hr className="cart-divider" />

      {cartLines.map(({ product, size, qty, key }) => (
        <div key={key}>
          <div className="cart-row">

            {/* Image */}
            <div className="col-img">
              <Link to={`/product/${product.id}`} onClick={() => window.scrollTo(0, 0)}>
                <img src={product.image} alt={product.name} className='carticon-product-icon' />
              </Link>
            </div>

            {/* Name + mobile-only meta */}
            <div className="col-info">
              <Link to={`/product/${product.id}`} onClick={() => window.scrollTo(0, 0)}>
                <p className="cart-product-name">{product.name}</p>
              </Link>
              <p className="cart-meta-mobile">
                Size: <strong>{size}</strong>&nbsp;&nbsp;·&nbsp;&nbsp;₹{product.new_price} each
              </p>
            </div>

            {/* Size — hidden on mobile (shown in meta) */}
            <div className="col-size">{size}</div>

            {/* Unit price — hidden on mobile */}
            <div className="col-price">₹{product.new_price}</div>

            {/* Qty stepper — bottom bar on mobile */}
            <div className="col-qty">
              <div className="cartitems-quantity-container">
                <button className="cartitems-quantity-btn" onClick={() => removeFromCart(product.id, size)}>-</button>
                <span className="cartitems-quantity-val">{qty}</span>
                <button className="cartitems-quantity-btn" onClick={() => addToCart(product.id, size, showToast)}>+</button>
              </div>
              {/* Visible only on mobile — total shown alongside stepper */}
              <span className="cart-inline-total">₹{product.new_price * qty}</span>
            </div>

            {/* Line total */}
            <div className="col-total">₹{product.new_price * qty}</div>

            {/* Remove */}
            <div className="col-remove">
              <img
                className='cartitems-remove-icon'
                src={remove_icon}
                onClick={() => removeFromCart(product.id, size)}
                alt="remove"
              />
            </div>

          </div>
          <hr className="cart-divider" />
        </div>
      ))}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p><p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p><p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3><h3>₹{getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder='promo code' />
            <button>Submit</button>
          </div>
        </div>
      </div>

    </div>
  );
};
