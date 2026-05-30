import React, { useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { useParams } from 'react-router-dom';
import { ProductDisplay } from '../Components/ProductDisplay/ProductDisplay';
import { Footer } from '../Components/Footer/Footer';

export const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();
  const product = all_product.find((e) => e.id === Number(productId));

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div style={{ paddingTop: '40px' }}>
      <ProductDisplay product={product} />
      <Footer />
    </div>
  );
};
