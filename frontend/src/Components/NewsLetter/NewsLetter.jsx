import React, { useState } from 'react';
import './NewsLetter.css';

export const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <div className='newsletter'>
      <div className='newsletter-inner'>
        <h1>Get Exclusive Deals & Drops</h1>
        <p>Subscribe to our newsletter. No spam, unsubscribe anytime.</p>
        {submitted ? (
          <div className='newsletter-success'>
            <span>✅</span> You're in! Watch your inbox for deals.
          </div>
        ) : (
          <form className='newsletter-form' onSubmit={handleSubmit}>
            <div className='newsletter-input-wrap'>
              <span className='newsletter-mail-icon'>✉️</span>
              <input
                type='email'
                placeholder='Enter your email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type='submit'>Subscribe Free</button>
          </form>
        )}
      </div>
    </div>
  );
};
