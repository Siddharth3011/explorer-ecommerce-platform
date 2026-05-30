import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShopContext } from '../Context/ShopContext';
import { Item } from '../Components/Item/Item';
import { Footer } from '../Components/Footer/Footer';
import './Wishlist.css';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export const Wishlist = () => {
  const { all_product, wishlist } = useContext(ShopContext);
  const wishlisted = all_product.filter((p) => wishlist.includes(p.id));

  if (wishlisted.length === 0) {
    return (
      <div className="wishlist-page">
        <motion.div
          className="wishlist-empty"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="wishlist-empty-icon">♡</div>
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite items here and come back to them anytime.</p>
          <Link to='/'>
            <button className="wishlist-explore-btn">Explore Products</button>
          </Link>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          My Wishlist
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {wishlisted.length} {wishlisted.length === 1 ? 'item' : 'items'} saved
        </motion.p>
      </div>
      <motion.div
        className="wishlist-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {wishlisted.map((item) => (
          <motion.div key={item.id} variants={itemVariants}>
            <Item
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
              numReviews={item.numReviews}
              rating={item.rating}
            />
          </motion.div>
        ))}
      </motion.div>
      <Footer />
    </div>
  );
};
