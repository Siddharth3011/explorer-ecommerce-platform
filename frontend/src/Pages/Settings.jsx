import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Context/ThemeContext';
import './Settings.css';

export const Settings = () => {
  const { darkMode, setDarkMode } = useTheme();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  return (
    <motion.div
      className="settings-page fade-in"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="settings-card">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account preferences</p>
        <div className="settings-divider" />

        <div className="settings-section">
          <h2 className="settings-section-title">Notifications</h2>
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Email Notifications</span>
              <span className="settings-row-desc">Receive order updates and confirmations</span>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Newsletter</span>
              <span className="settings-row-desc">Get the latest deals and new arrivals</span>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={newsletter} onChange={() => setNewsletter(!newsletter)} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <h2 className="settings-section-title">Appearance</h2>
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Dark Mode</span>
              <span className="settings-row-desc">Switch to a darker interface</span>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
