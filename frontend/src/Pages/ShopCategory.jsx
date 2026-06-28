import React, { useContext, useState } from 'react';
import './ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';

import { Item } from '../Components/Item/Item';
import { Footer } from '../Components/Footer/Footer';
import banner_mens from '../Components/Assets/banner_mens.png';
import banner_women from '../Components/Assets/banner_women.png';
import banner_kids from '../Components/Assets/banner_kids.png';
import { motion, AnimatePresence } from 'framer-motion';

const no_results_icon = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='8'></circle><line x1='21' y1='21' x2='16.65' y2='16.65'></line></svg>";

export const ShopCategory = (props) => {
  const { all_product, searchQuery, setSearchQuery } = useContext(ShopContext);
  const [visibleCount, setVisibleCount] = useState(8);


  let banner;
  if (props.category === 'men') banner = banner_mens;
  else if (props.category === 'women') banner = banner_women;
  else banner = banner_kids;

  const filteredProducts = all_product.filter((item) => {
    const matchesCategory = props.category === item.category;
    const matchesSearch = !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalProducts = filteredProducts.length;

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (searchQuery.trim() !== "" && filteredProducts.length === 0) {
    return (
      <div className="no-results-container">
        <img src={no_results_icon} alt="No Results" />
        <h2>No results found</h2>
        <p>Try adjusting your search criteria.</p>
        <button onClick={() => { clearSearch(); }}>Clear Search</button>
      </div>
    );
  }

  return (
    <div className='shop-category fade-in'>
      <img className='shopcategory-banner' src={banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          Showing {Math.min(visibleCount, totalProducts)} out of {totalProducts} products.
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="grid"
          className="shopcategory-products"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0 }}
        >
          {filteredProducts.slice(0, visibleCount).map((item, i) => (
            <motion.div
              key={item.id}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <Item id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} numReviews={item.numReviews} rating={item.rating} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {visibleCount < totalProducts && (
        <div className="shopcategory-loadmore" onClick={() => setVisibleCount(prev => prev + 4)}>
          Explore More
        </div>
      )}
      <Footer />
    </div>
  );
};