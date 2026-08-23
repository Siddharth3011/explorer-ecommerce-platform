import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../Components/Assets/logo.png';

/* ─── Tokens ─────────────────────────────────────────────── */
const C = {
  bg: '#F9F7F4',
  ink: '#0E0E0E',
  muted: '#6B6B6B',
  subtle: '#A0A0A0',
  border: 'rgba(14,14,14,0.09)',
  card: '#FFFFFF',
  dark: '#0F0F13',
  darkCard: '#16161D',
  grad: 'linear-gradient(135deg,#7C3AED 0%,#A855F7 50%,#EC4899 100%)',
  gradText: 'linear-gradient(135deg,#7C3AED,#EC4899)',
  purple: '#7C3AED',
  pink: '#EC4899',
};

/* ─── Helpers ────────────────────────────────────────────── */
const Reveal = ({ children, className, delay = 0, y = 28 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const GradText = ({ children, style = {} }) => (
  <span style={{ background: C.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', ...style }}>
    {children}
  </span>
);

const Tag = ({ children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: C.purple,
    border: `1px solid ${C.purple}30`, borderRadius: 100,
    padding: '5px 14px', background: `${C.purple}0A`,
  }}>
    {children}
  </span>
);

const SectionHead = ({ tag, title, desc, center = false }) => (
  <Reveal>
    <div style={{ maxWidth: center ? 620 : 700, margin: center ? '0 auto' : 0, textAlign: center ? 'center' : 'left', marginBottom: 56 }}>
      {tag && <Tag>{tag}</Tag>}
      <h2 style={{
        fontFamily: 'inherit', fontSize: 'clamp(32px,3.8vw,48px)', fontWeight: 700,
        letterSpacing: '-0.03em', lineHeight: 1.15, color: C.ink,
        marginTop: tag ? 18 : 0, marginBottom: desc ? 18 : 0,
      }}>
        {title}
      </h2>
      {desc && <p style={{ fontSize: 17, lineHeight: 1.75, color: C.muted }}>{desc}</p>}
    </div>
  </Reveal>
);

/* ─── Pill Button ────────────────────────────────────────── */
const Pill = ({ children, primary, onClick, small }) => (
  <motion.button
    whileHover={{ scale: 1.03, y: -1 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: small ? '9px 22px' : '14px 30px',
      borderRadius: 100, fontSize: small ? 13 : 15, fontWeight: 600, cursor: 'pointer', border: 'none',
      ...(primary
        ? { background: C.grad, color: '#fff', boxShadow: '0 4px 24px rgba(124,58,237,0.35)' }
        : { background: '#fff', color: C.ink, border: `1.5px solid ${C.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }
      ),
    }}
  >
    {children}
  </motion.button>
);

/* ─── Dark Mockup Card ───────────────────────────────────── */
const MockupShell = ({ children, style = {} }) => (
  <div style={{
    background: C.dark, borderRadius: 18, overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.3)', ...style,
  }}>
    {/* Traffic lights */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#1A1A22' }}>
      {['#FF5F57','#FFBD2E','#28CA41'].map(c => (
        <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
      ))}
      <div style={{ flex: 1, margin: '0 12px', background: 'rgba(255,255,255,0.07)', borderRadius: 6, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>explorer-app.vercel.app</span>
      </div>
    </div>
    {children}
  </div>
);

/* ─── AURA CHAT MOCKUP ───────────────────────────────────── */
const AuraMockup = () => {
  const msgs = [
    { role: 'user', text: "What's trending for women this week?" },
    { role: 'ai', text: "Based on your style profile, the Linen Midi Dress and Knit Crop Sweater are both flying off shelves. Both are in stock in your size — want me to add one to your cart?" },
    { role: 'user', text: "Add the Linen Midi Dress, size M." },
    { role: 'ai', text: "✅ Added! Your cart total is ₹1,849. Ready to checkout? I can pre-fill your details." },
  ];
  return (
    <MockupShell>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
        <div>
          <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>Aura AI</p>
          <p style={{ color: '#4ADE80', fontSize: 11, margin: 0 }}>● Online — context-aware</p>
        </div>
      </div>
      {/* Messages */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.22, duration: 0.4 }}
            style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
              background: m.role === 'user' ? C.grad : 'rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 12.5, lineHeight: 1.55,
            }}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Input */}
      <div style={{ margin: '0 16px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Ask Aura anything...</span>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>↑</div>
      </div>
    </MockupShell>
  );
};

/* ─── STORE MOCKUP ───────────────────────────────────────── */
const StoreMockup = () => {
  const items = [
    { name: 'Bomber Jacket', cat: 'Men', price: '₹1,899', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70', badge: 'NEW' },
    { name: 'Linen Midi Dress', cat: 'Women', price: '₹1,499', img: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=200&q=70', badge: 'TRENDING' },
    { name: 'Knit Sweater', cat: 'Women', price: '₹1,199', img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&q=70', badge: '' },
  ];
  return (
    <MockupShell>
      {/* Nav bar */}
      <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '-0.02em' }}>EXPLORER</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Men','Women','Kids'].map(l => <span key={l} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{l}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>🔍</div>
          <div style={{ background: C.grad, borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#fff', position: 'relative' }}>🛒 <span style={{ position: 'absolute', top: -4, right: -4, background: '#EC4899', color: '#fff', fontSize: 9, borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span></div>
        </div>
      </div>
      {/* Products */}
      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {items.map((item, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} style={{ borderRadius: 10, overflow: 'hidden', background: '#1A1A22', cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <img src={item.img} alt={item.name} style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
              {item.badge && (
                <span style={{ position: 'absolute', top: 6, left: 6, background: C.grad, color: '#fff', fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 600, letterSpacing: '0.06em' }}>
                  {item.badge}
                </span>
              )}
            </div>
            <div style={{ padding: '8px 10px' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.1em', margin: '0 0 2px' }}>{item.cat}</p>
              <p style={{ color: '#fff', fontSize: 11, fontWeight: 600, margin: '0 0 3px' }}>{item.name}</p>
              <p style={{ color: '#A855F7', fontSize: 11, fontWeight: 700, margin: 0 }}>{item.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </MockupShell>
  );
};

/* ─── CHECKOUT MOCKUP ────────────────────────────────────── */
const CheckoutMockup = () => (
  <MockupShell>
    <div style={{ padding: 24 }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.1em', marginBottom: 16 }}>SECURE CHECKOUT</p>
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Summary */}
        <div style={{ flex: 1 }}>
          {[['Linen Midi Dress × 1','₹1,499'],['Knit Sweater × 1','₹1,199']].map(([label,price]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{label}</span>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{price}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Total</span>
            <span style={{ background: C.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 14, fontWeight: 700 }}>₹2,698</span>
          </div>
        </div>
        {/* Payment panel */}
        <div style={{ width: 140 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 8 }}>Pay via</p>
            {['UPI','Cards','Wallets'].map(m => (
              <div key={m} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginBottom: 4, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{m}</div>
            ))}
          </div>
          <motion.div
            animate={{ boxShadow: ['0 0 0px rgba(124,58,237,0.4)','0 0 20px rgba(124,58,237,0.7)','0 0 0px rgba(124,58,237,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ background: C.grad, borderRadius: 10, padding: '10px 0', textAlign: 'center', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            Pay Now ⚡
          </motion.div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
        <span style={{ fontSize: 13 }}>🔒</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>256-bit SSL · Razorpay PCI DSS · Secured transaction</span>
      </div>
    </div>
  </MockupShell>
);

/* ─── LIVE REVIEW MOCKUP ─────────────────────────────────── */
const ReviewMockup = () => {
  const reviews = [
    { name: 'Priya S.', rating: 5, text: 'Fits perfectly, exactly as described!', time: 'Just now', live: true },
    { name: 'Ravi K.', rating: 4, text: 'Great build quality, fast shipping.', time: '2 min ago', live: false },
    { name: 'Meera T.', rating: 5, text: 'Love the fabric, will order again.', time: '5 min ago', live: false },
  ];
  return (
    <MockupShell>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>Customer Reviews</p>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, padding: '3px 10px' }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
            <span style={{ color: '#4ADE80', fontSize: 10, fontWeight: 600 }}>LIVE</span>
          </motion.div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={i === 0 ? { opacity: 0, y: -10 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === 0 ? 0.6 : 0, duration: 0.5 }}
              style={{
                background: r.live ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)',
                border: r.live ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '10px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{r.name} {'★'.repeat(r.rating)}</span>
                <span style={{ color: r.live ? '#A855F7' : 'rgba(255,255,255,0.3)', fontSize: 10 }}>{r.time}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: 0 }}>{r.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </MockupShell>
  );
};

/* ─── FAQ Item ───────────────────────────────────────────── */
const FAQ = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ borderBottom: `1px solid ${C.border}`, padding: '22px 0', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: 16, fontWeight: 600, color: C.ink, margin: 0 }}>{q}</h4>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ fontSize: 22, color: C.purple, lineHeight: 1 }}
        >
          +
        </motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ color: C.muted, fontSize: 15, lineHeight: 1.75, margin: '14px 0 0', overflow: 'hidden' }}
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export const ShowcaseLanding = () => {
  const navigate = useNavigate();
  const base = { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", background: C.bg, color: C.ink };

  return (
    <div style={{ ...base, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ══ NAV ══════════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px,5vw,60px)', height: 64,
        background: 'rgba(249,247,244,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={logo} alt="Explorer logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.03em', color: C.ink }}>Explorer</span>
        </div>

        <div style={{ display: 'flex', gap: 36 }} className="hidden md:flex">
          {[['#features','Features'],['#aura','Aura AI'],['#stack','Stack'],['#faq','FAQ']].map(([href, label]) => (
            <a key={label} href={href} style={{ fontSize: 14, color: C.muted, textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => (e.target.style.color = C.ink)} onMouseLeave={e => (e.target.style.color = C.muted)}>
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Pill onClick={() => navigate('/login')}>Sign in</Pill>
          <Pill primary onClick={() => navigate('/login')}>Get started →</Pill>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(60px,8vh,120px) clamp(20px,6vw,80px) 80px', maxWidth: 1300, margin: '0 auto' }}>
        {/* Eyebrow */}
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${C.purple}0D`, border: `1px solid ${C.purple}28`, borderRadius: 100, padding: '7px 18px' }}>
              <motion.div animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: C.purple, letterSpacing: '0.04em' }}>
                Now with Gemini 2.5 Flash · Socket.io · Razorpay
              </span>
            </div>
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.06}>
          <h1 style={{
            fontSize: 'clamp(48px,7.5vw,88px)', fontWeight: 800, letterSpacing: '-0.04em',
            lineHeight: 1.05, textAlign: 'center', margin: '0 auto 28px', maxWidth: 900,
          }}>
            The{' '}
            <GradText>AI-Powered</GradText>
            <br />
            Fashion Store,{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 600, color: C.muted }}>reimagined.</span>
          </h1>
        </Reveal>

        {/* Sub */}
        <Reveal delay={0.12}>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: C.muted, textAlign: 'center', maxWidth: 560, margin: '0 auto 40px' }}>
            Explorer is a production-grade e-commerce platform with an embedded AI shopping assistant, real-time inventory, live reviews, and seamless checkout.
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={0.18}>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 72 }}>
            <Pill primary onClick={() => navigate('/login')}>Explore Explorer →</Pill>
            <Pill onClick={() => navigate('/login')}>✦ Try Aura AI</Pill>
          </div>
        </Reveal>

        {/* Hero mockup */}
        <Reveal delay={0.24} y={40}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 20, alignItems: 'start' }}>
            <StoreMockup />
            <AuraMockup />
          </div>
        </Reveal>
      </section>

      {/* ══ TECH STRIP ════════════════════════════════════ */}
      <section style={{ padding: '32px clamp(20px,6vw,80px)', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
          <p style={{ fontSize: 12, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, marginRight: 10 }}>
            Engineered with
          </p>
          {[
            { name: 'Gemini 2.5 Flash', icon: '✦', color: '#4285F4' },
            { name: 'Socket.io', icon: '◈', color: '#010101' },
            { name: 'Razorpay', icon: '⚡', color: '#2D9CDB' },
            { name: 'MongoDB', icon: '◉', color: '#47A248' },
            { name: 'React 18', icon: '⚛', color: '#61DAFB' },
            { name: 'Node.js', icon: '⬡', color: '#339933' },
          ].map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, color: t.color }}>{t.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, opacity: 0.75 }}>{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AURA AI SECTION ═══════════════════════════════ */}
      <section id="aura" style={{ padding: 'clamp(80px,10vh,120px) clamp(20px,6vw,80px)', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <SectionHead
              tag="✦ Aura AI Assistant"
              title={<>Shop smarter with an AI that <GradText>actually knows your cart.</GradText></>}
              desc="Aura is context-aware. It reads your cart, browsing history, and the full product catalog in real time. Ask it anything — it recommends, adds to cart, and guides checkout."
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Live product catalog access', 'Aura queries MongoDB in real time — no stale data.'],
                ['Gemini 2.5 Flash powered', 'Sub-200ms AI response with multi-turn conversation memory.'],
                ['Cart-aware context', 'Knows exactly what you have, what you need, and what to skip.'],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${C.purple}15`, border: `1px solid ${C.purple}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: C.purple }}>✓</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: C.ink, margin: '0 0 3px' }}>{title}</p>
                    <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Reveal delay={0.1} y={30}>
            <AuraMockup />
          </Reveal>
        </div>
      </section>

      {/* ══ CHECKOUT & REVIEWS SPLIT ══════════════════════ */}
      <section style={{ background: '#fff', padding: 'clamp(80px,10vh,120px) clamp(20px,6vw,80px)' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          {/* Checkout */}
          <div>
            <Reveal>
              <div style={{ marginBottom: 40 }}>
                <Tag>⚡ Razorpay Checkout</Tag>
                <h2 style={{ fontSize: 'clamp(28px,3vw,40px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, margin: '18px 0 16px' }}>
                  From cart to confirmed in{' '}
                  <GradText>under 60 seconds.</GradText>
                </h2>
                <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75 }}>
                  PCI DSS compliant payments via Razorpay. Supports UPI, cards, net banking, and wallets — with instant confirmation and order tracking.
                </p>
              </div>
              <CheckoutMockup />
            </Reveal>
          </div>

          {/* Reviews */}
          <div>
            <Reveal delay={0.1}>
              <div style={{ marginBottom: 40 }}>
                <Tag>◈ Socket.io · Real-Time</Tag>
                <h2 style={{ fontSize: 'clamp(28px,3vw,40px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, margin: '18px 0 16px' }}>
                  Reviews that update{' '}
                  <GradText>as you watch.</GradText>
                </h2>
                <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75 }}>
                  Full-duplex WebSocket connection via Socket.io. Every new review is broadcast live to all connected clients — no refresh, no polling.
                </p>
              </div>
              <ReviewMockup />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ INVENTORY SECTION ════════════════════════════ */}
      <section style={{ padding: 'clamp(80px,10vh,120px) clamp(20px,6vw,80px)', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Inventory visual */}
          <Reveal y={30}>
            <MockupShell>
              <div style={{ padding: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.1em', marginBottom: 18 }}>ATOMIC STOCK ENGINE · MongoDB</p>
                {/* Simulated race */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Request #1 — User A — Qty: 1', status: '✓ Fulfilled', color: '#4ADE80' },
                    { label: 'Request #2 — User B — Qty: 1', status: '✓ Fulfilled', color: '#4ADE80' },
                    { label: 'Request #3 — User C — Qty: 1', status: '✗ Out of stock', color: '#F87171' },
                    { label: 'Request #4 — User D — Qty: 1', status: '✗ Rejected', color: '#F87171' },
                  ].map((row, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.15 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{row.label}</span>
                      <span style={{ color: row.color, fontSize: 11, fontWeight: 600 }}>{row.status}</span>
                    </motion.div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(124,58,237,0.12)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.25)' }}>
                  <code style={{ color: '#A855F7', fontSize: 11, lineHeight: 1.6 }}>
                    {`Product.findOneAndUpdate(\n  { _id: id, stock: { $gte: qty } },\n  { $inc: { stock: -qty } },\n  { new: true }\n)`}
                  </code>
                </div>
              </div>
            </MockupShell>
          </Reveal>

          <div>
            <SectionHead
              tag="◉ Flash-Sale Ready"
              title={<>Zero oversells. Guaranteed by <GradText>atomic writes.</GradText></>}
              desc="Every stock decrement runs as a single MongoDB atomic operation. Even under 10,000 concurrent requests, no product can be oversold — ever."
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { val: '0', label: 'Oversells ever', icon: '🛡️' },
                { val: '< 50ms', label: 'DB write latency', icon: '⚡' },
                { val: '10k+', label: 'Concurrent safe', icon: '🔥' },
                { val: 'Atomic', label: '$inc operation', icon: '◉' },
              ].map(s => (
                <div key={s.label} style={{ padding: '20px', background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: C.ink, margin: '8px 0 4px' }}>{s.val}</p>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ METRICS BAR ══════════════════════════════════ */}
      <section style={{ background: C.dark, padding: 'clamp(60px,8vh,96px) clamp(20px,6vw,80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
          {[
            { val: '< 200ms', label: 'Aura AI response', note: 'Gemini 2.5 Flash' },
            { val: '100%', label: 'Stock accuracy', note: 'Atomic MongoDB writes' },
            { val: 'Live', label: 'Review updates', note: 'Socket.io WebSocket' },
            { val: 'PCI DSS', label: 'Payment security', note: 'Razorpay compliant' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.07}>
              <div style={{ background: C.darkCard, padding: '36px 28px' }}>
                <p style={{ fontSize: 'clamp(26px,3vw,40px)', fontWeight: 800, letterSpacing: '-0.04em', background: C.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 8px' }}>
                  {s.val}
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 5px' }}>{s.label}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0 }}>{s.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ FEATURE GRID ══════════════════════════════════ */}
      <section id="features" style={{ padding: 'clamp(80px,10vh,120px) clamp(20px,6vw,80px)', maxWidth: 1300, margin: '0 auto' }}>
        <SectionHead center tag="Platform Features" title={<>Everything you need.<br /><GradText>Nothing you don't.</GradText></>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { icon: '✦', title: 'Aura AI Assistant', desc: 'Multi-turn Gemini 2.5 Flash chat with live catalog, cart context, and sub-200ms response.', grad: true },
            { icon: '⚡', title: 'Razorpay Checkout', desc: 'PCI DSS compliant, supports UPI, cards, wallets. One-click repeat purchase.' },
            { icon: '◈', title: 'Real-Time Reviews', desc: 'Socket.io WebSocket broadcasts new reviews instantly — zero polling, zero stale data.' },
            { icon: '◉', title: 'Atomic Stock Control', desc: 'MongoDB $inc with $gte guard prevents any oversell even under flash-sale load.' },
            { icon: '🛡️', title: 'JWT Authentication', desc: 'Token-based auth with middleware guards on every protected route and cart operation.' },
            { icon: '📦', title: 'Order Management', desc: 'Full order history, per-item review drawer, and real-time status — right inside your profile.' },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -5, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
                style={{
                  background: f.grad ? C.dark : C.card,
                  borderRadius: 18, padding: 28,
                  border: f.grad ? 'none' : `1px solid ${C.border}`,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                  cursor: 'default',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 20, boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 10px', color: f.grad ? '#fff' : C.ink }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: f.grad ? 'rgba(255,255,255,0.6)' : C.muted, margin: 0 }}>{f.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ TECH STACK ════════════════════════════════════ */}
      <section id="stack" style={{ background: '#fff', padding: 'clamp(80px,10vh,100px) clamp(20px,6vw,80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHead center tag="Technology" title="Built on a modern, production-grade stack." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { layer: 'Frontend', items: ['React 18', 'Framer Motion', 'Socket.io Client', 'Tailwind CSS', 'React Router v6'] },
              { layer: 'Backend', items: ['Node.js + Express', 'MongoDB + Mongoose', 'JWT Authentication', 'Multer (Media)', 'Socket.io Server'] },
              { layer: 'Platform', items: ['Gemini 2.5 Flash (AI)', 'Razorpay (Payments)', 'Vercel (Frontend)', 'Vercel (Backend)', 'GitHub CI'] },
            ].map(col => (
              <Reveal key={col.layer}>
                <div style={{ background: C.bg, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: C.purple, textTransform: 'uppercase', marginBottom: 16 }}>{col.layer}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {col.items.map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.grad, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════ */}
      <section id="faq" style={{ padding: 'clamp(80px,10vh,120px) clamp(20px,6vw,80px)', maxWidth: 820, margin: '0 auto' }}>
        <SectionHead center tag="FAQ" title="Common questions." />
        {[
          ['Is this a real e-commerce platform?', "Yes. Explorer is a fully functional production-grade platform with MongoDB Atlas, Razorpay payment integration, real-time Socket.io, and Gemini AI. It's not a prototype."],
          ['What is Aura AI?', 'Aura is an embedded AI shopping assistant powered by Google Gemini 2.5 Flash. It reads your cart, the live product catalog, and your browsing context to make smart, personalised recommendations.'],
          ['How does real-time stock protection work?', 'Every cart addition and checkout triggers a MongoDB atomic findOneAndUpdate with a $gte stock guard and $inc decrement. This prevents overselling even under thousands of concurrent requests.'],
          ['Is checkout actually secure?', 'Yes. Payments are handled entirely by Razorpay (PCI DSS Level 1 certified). Explorer never stores card data — only the order confirmation from Razorpay is saved.'],
          ['Can I review products after buying?', 'Yes. On the My Orders page, each item has a Rate & Review drawer. Reviews are per-user locked after submission and appear live via Socket.io for other shoppers.'],
        ].map(([q, a]) => <FAQ key={q} q={q} a={a} />)}
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════ */}
      <section style={{ padding: 'clamp(80px,10vh,120px) clamp(20px,6vw,80px)' }}>
        <Reveal>
          <div style={{
            maxWidth: 860, margin: '0 auto', textAlign: 'center',
            background: C.dark, borderRadius: 28, padding: 'clamp(56px,8vh,88px) 40px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* BG orbs */}
            <div style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(124,58,237,0.18)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(236,72,153,0.14)', filter: 'blur(70px)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <Tag>Ready to explore?</Tag>
              <h2 style={{ fontSize: 'clamp(32px,4.5vw,56px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#fff', margin: '24px 0 18px' }}>
                Your next favourite outfit<br />
                <GradText>is one search away.</GradText>
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
                Sign up free. Let Aura guide you. Checkout in 60 seconds. Experience what modern e-commerce should feel like.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Pill primary onClick={() => navigate('/login')}>Create free account →</Pill>
                <Pill onClick={() => navigate('/shop')} style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
                  Browse store
                </Pill>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '28px clamp(20px,6vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={logo} alt="Explorer logo" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Explorer</span>
        </div>
        <p style={{ fontSize: 12, color: C.subtle }}>© 2025 Explorer · Men · Women · Kids</p>
        <p style={{ fontSize: 12, color: C.subtle }}>Powered by Gemini AI · Socket.io · Razorpay</p>
      </footer>
    </div>
  );
};
