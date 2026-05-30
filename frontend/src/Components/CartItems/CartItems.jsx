import React, { useContext } from 'react';
import './CartItems.css';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';

export const CartItems = () => {
  const { all_product, cartItems, addToCart, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  const navigate = useNavigate();

  // Build a flat list of { product, size, qty } from composite keys
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
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Size</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {cartLines.map(({ product, size, qty, key }) => (
        <div key={key}>
          <div className="cartitems-format cartitems-format-main">
            <Link to={`/product/${product.id}`} onClick={() => window.scrollTo(0,0)} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
              <img src={product.image} alt={product.name} className='carticon-product-icon' />
              <p>{product.name}</p>
            </Link>
            <p>{size}</p>
            <p>₹{product.new_price}</p>
            <div className="cartitems-quantity-container">
              <button className="cartitems-quantity-btn" onClick={() => removeFromCart(product.id, size)}>-</button>
              <span className="cartitems-quantity-val">{qty}</span>
              <button className="cartitems-quantity-btn" onClick={() => addToCart(product.id, size)}>+</button>
            </div>
            <p>₹{product.new_price * qty}</p>
            <img
              className='cartitems-remove-icon'
              src={remove_icon}
              onClick={() => removeFromCart(product.id, size)}
              alt="remove"
            />
          </div>
          <hr />
        </div>
      ))}
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>₹{getTotalCartAmount()}</h3>
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
