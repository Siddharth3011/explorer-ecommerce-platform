import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './MyOrders.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const response = await fetch(`${API_BASE}/api/orders`, {
          method: 'GET',
          headers: {
            'auth-token': token || '',
          },
        });
        const data = await response.json();
        // Backend maps an order collection payload array directly as res.json(userOrders)
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="myorders-page fade-in">
        <h1 className="myorders-title">Your Orders</h1>
        <div className="myorders-loading">
          <span className="myorders-spinner"></span>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="myorders-page fade-in"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="myorders-title">Your Orders</h1>
      {orders.length === 0 ? (
        <div className="myorders-empty">
          <motion.div
            className="myorders-bag-icon"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            🛍️
          </motion.div>
          <h2>No orders yet</h2>
          <p>Looks like you haven't placed any orders. Start shopping to see them here!</p>
          <Link to='/'><button className="myorders-shop-btn">Browse Products</button></Link>
        </div>
      ) : (
        <div className="myorders-list">
          {orders.map((order) => (
            <div key={order._id || order.orderId} className="myorders-card">
              <div className="myorders-card-header">
                <div>
                  <p className="myorders-lbl">Order Placed</p>
                  <p className="myorders-val">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="myorders-lbl">Total Amount</p>
                  <p className="myorders-val">₹{order.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="myorders-lbl">Order ID</p>
                  <p className="myorders-val">{order.orderId}</p>
                </div>
              </div>
              <div className="myorders-card-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="myorders-card-item">
                    <img src={item.image} alt={item.name} className="myorders-item-img" />
                    <div className="myorders-item-details">
                      <h4>{item.name}</h4>
                      <p>Size: {item.size} | Qty: {item.qty}</p>
                      <p className="myorders-item-price">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
