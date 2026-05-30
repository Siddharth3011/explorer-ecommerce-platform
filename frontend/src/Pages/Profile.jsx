import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ShopContext } from '../Context/ShopContext';
import './Profile.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const formatMemberSince = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
};

const ProfileSkeleton = () => (
  <div className="profile-page">
    <div className="profile-card">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton skeleton-name" />
      <div className="skeleton skeleton-email" />
      <div className="profile-divider" />
      <div className="profile-stats">
        <div className="skeleton skeleton-stat" />
        <div className="skeleton skeleton-stat" />
        <div className="skeleton skeleton-stat" />
      </div>
      <div className="profile-divider" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
    </div>
  </div>
);

export const Profile = () => {
  const { user } = useContext(ShopContext);

  if (!user.loggedIn && !user.name) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="profile-page">
      <motion.div
        className="profile-card"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="profile-avatar-large">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </motion.div>
        <motion.h1 variants={itemVariants} className="profile-name">
          {user.name || 'User'}
        </motion.h1>
        <motion.p variants={itemVariants} className="profile-email">
          {user.email || ''}
        </motion.p>
        <motion.div variants={itemVariants} className="profile-divider" />
        <motion.div variants={itemVariants} className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">0</span>
            <span className="profile-stat-label">Orders</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">0</span>
            <span className="profile-stat-label">Wishlist</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">Member</span>
            <span className="profile-stat-label">Status</span>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="profile-divider" />
        <motion.div variants={itemVariants} className="profile-info-row">
          <span className="profile-info-label">📧 Email</span>
          <span className="profile-info-value">{user.email || '—'}</span>
        </motion.div>
        <motion.div variants={itemVariants} className="profile-info-row">
          <span className="profile-info-label">📅 Member Since</span>
          <span className="profile-info-value">{formatMemberSince(user.date)}</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
