import React, { useContext, useState } from 'react';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import { useToast } from '../Toast/Toast';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart } = useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState('');
  const { showToast } = useToast();

  const filledStars = Math.round(product.rating || 4);
  const reviewCount = product.numReviews || 0;

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

        <div className="productdisplay-right-stars">
          {Array.from({ length: 5 }, (_, i) => (
            <img
              key={i}
              src={i < filledStars ? star_icon : star_dull_icon}
              alt={i < filledStars ? 'star' : 'dull star'}
            />
          ))}
          <p>({reviewCount})</p>
        </div>

        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">₹{product.old_price}</div>
          <div className="productdisplay-right-price-new">₹{product.new_price}</div>
        </div>

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
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            if (!selectedSize) {
              showToast('Please select a size first!', 'error');
              return;
            }
            addToCart(product.id, selectedSize);
            showToast(`${product.name} (Size: ${selectedSize}) added to cart successfully!`, 'success');
          }}
        >
          ADD TO CART
        </button>

        <p className='productdisplay-right-category'><span>Category :</span> {product.category}, T-Shirt, Crop Top</p>
        <p className='productdisplay-right-category'><span>Tags :</span> Modern, Latest</p>
      </div>
    </div>
  );
};
