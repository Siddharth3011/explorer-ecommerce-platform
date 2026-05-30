import React, { useContext } from 'react';
import './NewCollections.css';
import { Item } from '../Item/Item';
import { ShopContext } from '../../Context/ShopContext';

export const NewCollections = () => {
  const { all_product } = useContext(ShopContext);
  const newItems = all_product.slice(-8);

  return (
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {newItems.map((item, i) => (
          <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} numReviews={item.numReviews} rating={item.rating} />
        ))}
      </div>
    </div>
  );
};
