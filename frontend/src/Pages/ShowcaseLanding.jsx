import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   Fade-in on scroll — simple, not dramatic
───────────────────────────────────────────────────────────── */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────── */
const collections = [
  {
    num: '01',
    label: 'Men',
    route: '/mens',
    pieces: '36 Pieces',
    desc: 'Structured cuts, versatile layering, and everyday essentials.',
    img: 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=700&q=80',
  },
  {
    num: '02',
    label: 'Women',
    route: '/womens',
    pieces: '36 Pieces',
    desc: 'Fluid silhouettes, refined basics, and statement separates.',
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=80',
  },
  {
    num: '03',
    label: 'Kids',
    route: '/kids',
    pieces: '36 Pieces',
    desc: 'Comfortable, playful, and built for every kind of adventure.',
    img: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=700&q=80',
  },
];

const featured = [
  {
    tag: 'MEN',
    label: 'Slim Fit Bomber',
    img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80',
    badge: 'BESTSELLER',
  },
  {
    tag: 'WOMEN',
    label: 'Linen Midi Dress',
    img: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500&q=80',
    badge: 'NEW',
  },
  {
    tag: 'WOMEN',
    label: 'Knit Crop Sweater',
    img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80',
    badge: 'TRENDING',
  },
  {
    tag: 'KIDS',
    label: 'Colourblock Hoodie',
    img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&q=80',
    badge: 'CURATED',
  },
];

/* ─────────────────────────────────────────────────────────────
   ShowcaseLanding
───────────────────────────────────────────────────────────── */
export const ShowcaseLanding = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: '#F5F1EB', color: '#1C1C1C' }}
    >
      {/* ── GOOGLE FONTS ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
        .font-serif-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .accent { color: #8B7355; }
        .accent-border { border-color: #8B7355; }
        .btn-outline {
          display: inline-block;
          border: 1px solid #1C1C1C;
          padding: 12px 32px;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          transition: background 0.25s, color 0.25s;
          cursor: pointer;
          background: transparent;
          color: #1C1C1C;
        }
        .btn-outline:hover { background: #1C1C1C; color: #F5F1EB; }
        .btn-solid {
          display: inline-block;
          border: 1px solid #1C1C1C;
          padding: 14px 40px;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          transition: background 0.25s, color 0.25s;
          cursor: pointer;
          background: #1C1C1C;
          color: #F5F1EB;
        }
        .btn-solid:hover { background: #333; }
        .collection-card:hover .collection-img { transform: scale(1.04); }
        .collection-img { transition: transform 0.6s ease; }
        .featured-card:hover img { transform: scale(1.05); }
        .featured-card img { transition: transform 0.5s ease; }
        .divider { height: 1px; background: rgba(28,28,28,0.15); }
      `}</style>

      {/* ══ NAV ════════════════════════════════════════════ */}
      <nav
        className="font-inter"
        style={{
          borderBottom: '1px solid rgba(28,28,28,0.12)',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          position: 'sticky',
          top: 0,
          background: '#F5F1EB',
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span className="font-serif-display" style={{ fontSize: 16, letterSpacing: '0.08em', fontWeight: 500 }}>
            EXPLORER
          </span>
          <span style={{ fontSize: 9, letterSpacing: '0.18em', color: '#8B7355', textTransform: 'uppercase' }}>
            Fashion Store
          </span>
        </div>

        {/* Centre links */}
        <div style={{ display: 'flex', gap: 40 }} className="hidden md:flex">
          {[
            { label: 'Collections', href: '#collections' },
            { label: 'Men', href: '/mens' },
            { label: 'Women', href: '/womens' },
            { label: 'Kids', href: '/kids' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{ fontSize: 12, letterSpacing: '0.1em', color: '#555', textTransform: 'uppercase', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1C1C1C')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right */}
        <button className="btn-outline" style={{ padding: '8px 20px' }} onClick={() => navigate('/login')}>
          Sign In
        </button>
      </nav>

      {/* ══ HERO ═══════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px 96px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Eyebrow */}
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 36, height: 1, background: '#8B7355' }} />
            <span
              style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B7355' }}
              className="font-inter"
            >
              The Explorer Edit
            </span>
          </div>
        </Reveal>

        {/* Two-col hero */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
          <Reveal delay={0.05}>
            <h1
              className="font-serif-display"
              style={{ fontSize: 'clamp(36px, 5vw, 58px)', lineHeight: 1.15, fontWeight: 400, fontStyle: 'italic' }}
            >
              "Fashion that fits your story, not just your size."
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <div style={{ paddingTop: 8 }}>
              <p className="font-inter" style={{ fontSize: 14, lineHeight: 1.85, color: '#555', marginBottom: 20 }}>
                Explorer is a curated fashion destination for men, women, and kids. Every item is handpicked for quality, fit, and style — no noise, no filler.
              </p>
              <p className="font-inter" style={{ fontSize: 14, lineHeight: 1.85, color: '#555', marginBottom: 32 }}>
                Backed by Aura AI to help you find exactly what you need, real-time inventory so you never miss your size, and checkout that takes under a minute.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button className="btn-solid" onClick={() => navigate('/login')}>
                  Start Shopping →
                </button>
                <a href="#collections" className="btn-outline" style={{ textDecoration: 'none' }}>
                  View Collections
                </a>
              </div>

              <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  '● Aura AI — context-aware style assistant',
                  '● Real-time inventory & live reviews',
                  '● Razorpay-secured checkout',
                ].map(t => (
                  <span key={t} className="font-inter" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="divider" style={{ margin: '0 40px' }} />

      {/* ══ COLLECTIONS ════════════════════════════════════ */}
      <section id="collections" style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <Reveal>
            <div>
              <p className="font-inter" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
                Selection by Category
              </p>
              <h2 className="font-serif-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400 }}>
                Curated Collections
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-inter" style={{ fontSize: 13, color: '#777', maxWidth: 280, lineHeight: 1.7 }}>
              Three categories, one consistent standard of quality. Browse at your own pace.
            </p>
          </Reveal>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {collections.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.08}>
              <div
                className="collection-card"
                style={{ cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => navigate(c.route)}
              >
                {/* Image */}
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4' }}>
                  <img
                    src={c.img}
                    alt={c.label}
                    className="collection-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 55%)',
                  }} />
                  {/* Number */}
                  <span
                    className="font-inter"
                    style={{
                      position: 'absolute', top: 16, left: 16,
                      fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    {c.num}
                  </span>
                  {/* Label */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '20px 18px' }}>
                    <p className="font-inter" style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', marginBottom: 4 }}>
                      {c.pieces}
                    </p>
                    <h3 className="font-serif-display" style={{ fontSize: 26, color: '#fff', fontWeight: 400, marginBottom: 6 }}>
                      {c.label}
                    </h3>
                    <p className="font-inter" style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, maxWidth: 200 }}>
                      {c.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="divider" style={{ margin: '0 40px' }} />

      {/* ══ EDITORIAL PULL QUOTE ═══════════════════════════ */}
      <section style={{ padding: '80px 40px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <p className="font-inter" style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 24 }}>
            Why Explorer
          </p>
          <h2
            className="font-serif-display"
            style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 400, lineHeight: 1.4, color: '#1C1C1C' }}
          >
            We don't stock everything. We stock the{' '}
            <span style={{ fontStyle: 'italic', color: '#8B7355' }}>right</span> things.
          </h2>
          <p className="font-inter" style={{ fontSize: 14, color: '#666', lineHeight: 1.85, maxWidth: 560, margin: '24px auto 0' }}>
            Explorer was built for people who know what they want. A focused catalog across men, women, and kids — with AI that helps when you don't.
          </p>
        </Reveal>
      </section>

      <div className="divider" style={{ margin: '0 40px' }} />

      {/* ══ FEATURED PIECES ════════════════════════════════ */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <Reveal>
            <div>
              <p className="font-inter" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
                Curated Showcase
              </p>
              <h2 className="font-serif-display" style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 400 }}>
                Selected Pieces
              </h2>
              <p className="font-inter" style={{ fontSize: 13, color: '#777', marginTop: 6 }}>
                A few things we're currently featuring.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <button className="btn-outline" onClick={() => navigate('/shop')}>
              See All →
            </button>
          </Reveal>
        </div>

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {featured.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.07}>
              <div className="featured-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/shop')}>
                {/* Image container */}
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', marginBottom: 14, background: '#E8E3DB' }}>
                  <img
                    src={item.img}
                    alt={item.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                  {/* Badge */}
                  <span
                    className="font-inter"
                    style={{
                      position: 'absolute', top: 12, left: 12,
                      background: '#1C1C1C', color: '#F5F1EB',
                      fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                      padding: '4px 8px',
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
                {/* Meta */}
                <p className="font-inter" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>
                  {item.tag}
                </p>
                <p className="font-inter" style={{ fontSize: 14, color: '#1C1C1C', fontWeight: 400 }}>
                  {item.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Discover all */}
        <Reveal delay={0.2}>
          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <button
              className="btn-outline"
              style={{ padding: '14px 48px' }}
              onClick={() => navigate('/shop')}
            >
              Discover All Pieces →
            </button>
          </div>
        </Reveal>
      </section>

      <div className="divider" style={{ margin: '0 40px' }} />

      {/* ══ CTA ════════════════════════════════════════════ */}
      <section style={{ padding: '100px 40px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <p className="font-inter" style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 20 }}>
            Ready to explore?
          </p>
          <h2
            className="font-serif-display"
            style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.25, marginBottom: 32 }}
          >
            Your wardrobe update<br />starts here.
          </h2>
          <button className="btn-solid" style={{ fontSize: 12 }} onClick={() => navigate('/login')}>
            Create a Free Account →
          </button>
        </Reveal>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: '1px solid rgba(28,28,28,0.12)',
          padding: '32px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <span className="font-serif-display" style={{ fontSize: 15, letterSpacing: '0.06em' }}>EXPLORER</span>
        <p className="font-inter" style={{ fontSize: 11, color: '#999', letterSpacing: '0.05em' }}>
          © 2025 Explorer · Men · Women · Kids
        </p>
        <p className="font-inter" style={{ fontSize: 11, color: '#bbb', letterSpacing: '0.04em' }}>
          Powered by Gemini AI · Socket.io · Razorpay
        </p>
      </footer>
    </div>
  );
};
