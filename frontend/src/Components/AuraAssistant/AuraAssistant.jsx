import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ShopContext } from '../../Context/ShopContext';
import './AuraAssistant.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

const QUICK_ACTIONS = [
  { label: '✨ Explore Options',    text: 'What are the best clothing options available for me right now?' },
  { label: '🎲 Try Something New',   text: 'Surprise me! Suggest something completely new I should try.' },
  { label: '📚 Learn Before You Buy', text: 'What should I know before buying clothes online?' },
  { label: '🛒 Review My Cart',      text: 'Can you review what\'s in my cart and give me styling advice?' },
];

const TypingBubble = () => (
  <div className="aura-typing-bubble">
    <span /><span /><span />
  </div>
);

const MessageBubble = ({ msg }) => (
  <motion.div
    className={`aura-msg aura-msg--${msg.role}`}
    initial={{ opacity: 0, y: 12, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {msg.role === 'assistant' && (
      <div className="aura-avatar-dot">A</div>
    )}
    <div className="aura-bubble">
      {msg.role === 'assistant'
        ? <ReactMarkdown>{msg.content}</ReactMarkdown>
        : <p>{msg.content}</p>
      }
    </div>
  </motion.div>
);

export const AuraAssistant = ({ isOpen, onClose }) => {
  const { all_product, cartItems } = useContext(ShopContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Aura, your SHOpper AI. Ask me anything about style, products, or your cart — I've got you covered. 🛖" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll the isolated chat panel panel wrapper container directly
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const buildCartPayload = () => {
    return all_product
      .filter(p => cartItems[p.id] > 0)
      .map(p => ({ name: p.name, qty: cartItems[p.id], price: p.new_price }));
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content })),
          cartItems: buildCartPayload(),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || data.error || 'Sorry, something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check your backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="aura-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="aura-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          >
            {/* Header */}
            <div className="aura-header">
              <div className="aura-header-brand">
                <div className="aura-logo">A</div>
                <div>
                  <p className="aura-title">Aura AI</p>
                  <p className="aura-subtitle">Your SHOpper assistant</p>
                </div>
              </div>
              <button className="aura-close-btn" onClick={onClose} aria-label="Close">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Quick Action Pills */}
            <div className="aura-pills-wrap">
              <p className="aura-pills-label">Quick actions</p>
              <div className="aura-pills">
                {QUICK_ACTIONS.map(qa => (
                  <button key={qa.label} className="aura-pill" onClick={() => sendMessage(qa.text)}>
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="aura-messages" ref={chatContainerRef}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {loading && (
                <motion.div
                  className="aura-msg aura-msg--assistant"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="aura-avatar-dot">A</div>
                  <TypingBubble />
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="aura-input-bar">
              <textarea
                ref={inputRef}
                className="aura-input"
                placeholder="Ask me about styles, products, your cart..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <button
                className="aura-send-btn"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Send"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};