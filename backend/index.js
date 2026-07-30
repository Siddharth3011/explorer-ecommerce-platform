const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/db');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_ecom';

app.use(express.json());

// Allow localhost in dev and production frontend domain from env
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'auth-token'],
}));

// Attach Socket.io to the HTTP server with matching CORS config
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

connectDB();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

app.use('/images', express.static('upload/images'));
app.use('/review-media', express.static('upload/review-media'));

// Ensure review-media dir exists
const reviewMediaDir = path.join(__dirname, 'upload', 'review-media');
if (!fs.existsSync(reviewMediaDir)) fs.mkdirSync(reviewMediaDir, { recursive: true });

const reviewMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reviewMediaDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `review-${Date.now()}${ext}`);
  },
});

const reviewMediaFilter = (req, file, cb) => {
  const allowed = /image\/(jpeg|jpg|png|webp|gif)|video\/(mp4|webm)/;
  if (allowed.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only images and mp4/webm video files are allowed'), false);
};

const uploadReviewMedia = multer({
  storage: reviewMediaStorage,
  fileFilter: reviewMediaFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB cap
});

// POST /upload/review-media — returns { success, url, mediaType }
app.post('/upload/review-media', uploadReviewMedia.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
  const url = `${process.env.BACKEND_URL || `http://localhost:${PORT}`}/review-media/${req.file.filename}`;
  res.json({ success: true, url, mediaType });
});

app.get('/', (req, res) => {
  res.send('Express App is Running');
});

app.use('/', productRoutes);

const User = require('./models/User');
const Product = require('./models/Product');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

app.post('/signup', async (req, res) => {
  let check = await User.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "Existing user found with same email address" });
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    cartData: {},
    wishlistData: {},
  });

  await user.save();

  const data = {
    user: {
      id: user.id
    }
  };

  const token = jwt.sign(data, JWT_SECRET);
  res.json({ success: true, token });
});

app.post('/login', async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    const passCompare = await bcrypt.compare(req.body.password, user.password);
    if (passCompare) {
      const data = {
        user: {
          id: user.id
        }
      };
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email Id" });
  }
});

const fetchUser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ errors: 'Please authenticate using a valid token' });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({ errors: 'Please authenticate using a valid token' });
  }
};

app.post('/addreview', fetchUser, async (req, res) => {
  try {
    const { productId, rating, comment, mediaUrl, mediaType } = req.body;

    const parsedRating = Number(rating) || 0;
    const trimmedComment = (comment || '').trim();

    // At least one of: rating, comment, or media must be provided
    if (parsedRating === 0 && !trimmedComment && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating, a comment, or an attachment.',
      });
    }

    const product = await Product.findOne({ id: Number(productId) });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch authenticated reviewer's real name
    const reviewer = await User.findById(req.user.id).select('name');
    const reviewerName = reviewer?.name || 'Anonymous';

    // Update-or-insert: find existing review by userId
    const existingIndex = product.reviews.findIndex(
      (r) => r.userId && r.userId.toString() === req.user.id.toString()
    );

    const reviewPayload = {
      userId:    req.user.id,
      name:      reviewerName,
      rating:    parsedRating,
      comment:   trimmedComment,
      mediaUrl:  mediaUrl  || '',
      mediaType: mediaType || '',
      date:      new Date(),
    };

    let isUpdate = false;
    if (existingIndex !== -1) {
      // Overwrite the existing review — no duplicates
      product.reviews[existingIndex] = reviewPayload;
      isUpdate = true;
    } else {
      product.reviews.push(reviewPayload);
    }

    // Only reviews with rating > 0 count toward the product average
    const ratedReviews = product.reviews.filter((r) => r.rating > 0);
    product.numReviews = product.reviews.length;
    product.rating = ratedReviews.length > 0
      ? ratedReviews.reduce((acc, r) => acc + r.rating, 0) / ratedReviews.length
      : 0;

    product.markModified('reviews');
    await product.save();

    const topReviews = [...product.reviews].reverse().slice(0, 5);

    io.emit('review_updated', {
      productId:    product.id,
      rating:       product.rating,
      numReviews:   product.numReviews,
      latestReview: reviewPayload,
      topReviews,
      allReviews:   [...product.reviews].reverse(),
    });

    res.json({
      success: true,
      message: isUpdate ? 'Review updated successfully' : 'Review added successfully',
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ success: false, message: 'Server error while saving review' });
  }
});

// Returns the list of product IDs the current user has already reviewed
app.get('/user/reviewed-products', fetchUser, async (req, res) => {
  try {
    const products = await Product.find(
      { 'reviews.userId': req.user.id },
      { id: 1, _id: 0 }
    );
    const reviewedIds = products.map((p) => p.id);
    res.json({ success: true, reviewedIds });
  } catch (err) {
    console.error('Reviewed products fetch error:', err);
    res.status(500).json({ success: false, reviewedIds: [] });
  }
});

app.post('/getuser', fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email date');
    res.json({ success: true, name: user.name, email: user.email, date: user.date });
  } catch (error) {
    res.status(500).json({ errors: 'Server Error' });
  }
});

const Order = require('./models/Order');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

app.post('/api/payment/orders', fetchUser, async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };
    try {
      const order = await razorpay.orders.create(options);
      if (!order) return res.status(500).json({ success: false, message: 'Razorpay order creation failed' });
      res.json({ success: true, order });
    } catch (razorpayError) {
      console.error("Razorpay SDK Error:", razorpayError);
      res.status(500).json({ success: false, message: 'Failed to initialize payment gateway' });
    }
  } catch (error) {
    console.error("Payment route error:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/placeorder', fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, address, items, amount } = req.body;

    // --- Atomic stock validation and reservation ---
    const reserved = [];
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { new: true }
      );

      if (!updated) {
        // Roll back all already-decremented items before aborting
        for (const r of reserved) {
          await Product.findOneAndUpdate({ id: r.productId }, { $inc: { stock: r.qty } });
        }
        return res.status(400).json({
          success: false,
          message: `Insufficient stock available for "${item.name}". Please update your cart and try again.`,
        });
      }
      reserved.push({ productId: item.productId, qty: item.qty });
    }

    // --- Persist order and clear cart ---
    const newOrder = new Order({ userId, orderId, address, items, amount });
    try {
      await newOrder.save();
    } catch (saveError) {
      // Roll back stock if order document save fails
      for (const r of reserved) {
        await Product.findOneAndUpdate({ id: r.productId }, { $inc: { stock: r.qty } });
      }
      console.error('DB save error:', saveError.message);
      return res.status(400).json({ success: false, message: 'Order validation failed', error: saveError.message });
    }

    const user = await User.findById(userId);
    if (user) {
      user.cartData = {};
      await user.save();
    }

    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

app.get('/api/orders', fetchUser, async (req, res) => {
  try {
    const userOrders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(userOrders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

app.post('/addtocart', fetchUser, async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const finalSize = size || 'M';
    const key = `${itemId}_${finalSize}`;

    const [userData, product] = await Promise.all([
      User.findById(req.user.id),
      Product.findOne({ id: itemId }),
    ]);

    if (!userData) return res.status(404).json({ success: false, message: 'User not found' });
    if (!userData.cartData) userData.cartData = {};

    const currentQty = userData.cartData[key] || 0;

    if (product && currentQty >= product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more. Only ${product.stock} unit(s) in stock for this item.`,
      });
    }

    userData.cartData[key] = currentQty + 1;
    userData.markModified('cartData');
    await userData.save();

    res.json({ success: true, message: 'Added to Cart' });
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ success: false, message: 'Cart add error' });
  }
});

app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const finalSize = size || 'M';
    const key = `${itemId}_${finalSize}`;
    
    let userData = await User.findById(req.user.id);
    if (userData.cartData && userData.cartData[key]) {
      userData.cartData[key] = Math.max(userData.cartData[key] - 1, 0);
      if (userData.cartData[key] === 0) {
        delete userData.cartData[key];
      }
      userData.markModified('cartData');
      await userData.save();
    }
    
    res.json({ success: true, message: "Removed from Cart" });
  } catch (error) {
    console.error("Cart remove error:", error);
    res.status(500).json({ success: false, message: "Cart remove error" });
  }
});

app.post('/getcart', fetchUser, async (req, res) => {
  try {
    let userData = await User.findById(req.user.id);
    res.json(userData.cartData || {});
  } catch (error) {
    console.error("Cart fetch error:", error);
    res.status(500).json({ success: false, message: "Cart fetch error" });
  }
});

app.post('/addtowishlist', fetchUser, async (req, res) => {
  try {
    const { itemId } = req.body;
    let userData = await User.findById(req.user.id);
    if (!userData.wishlistData) {
      userData.wishlistData = {};
    }
    userData.wishlistData[itemId] = true;
    userData.markModified('wishlistData');
    await userData.save();
    res.json({ success: true, message: "Added to Wishlist" });
  } catch (error) {
    console.error("Wishlist add error:", error);
    res.status(500).json({ success: false, message: "Wishlist add error" });
  }
});

app.post('/removefromwishlist', fetchUser, async (req, res) => {
  try {
    const { itemId } = req.body;
    let userData = await User.findById(req.user.id);
    if (userData.wishlistData && userData.wishlistData[itemId]) {
      delete userData.wishlistData[itemId];
      userData.markModified('wishlistData');
      await userData.save();
    }
    res.json({ success: true, message: "Removed from Wishlist" });
  } catch (error) {
    console.error("Wishlist remove error:", error);
    res.status(500).json({ success: false, message: "Wishlist remove error" });
  }
});

app.post('/getwishlist', fetchUser, async (req, res) => {
  try {
    let userData = await User.findById(req.user.id);
    res.json(userData.wishlistData || {});
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    res.status(500).json({ success: false, message: "Wishlist fetch error" });
  }
});

const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const AURA_SYSTEM = `You are 'Aura', an elite embedded context-aware shopping assistant for the Explorer marketplace. Guide users seamlessly, recommend item collections, answer styling questions intelligently, and cross-reference answers with their cart state and the live product catalog provided to you. Be concise, warm, and genuinely helpful. Format responses cleanly — use bullet points for lists. Never make up products not in the catalog.`;

app.post('/api/ai/chat', async (req, res) => {
  const { messages, cartItems, productContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages array' });
  }

  try {
    // ── 1. Fetch live product catalog from MongoDB ──────────────────────
    const allProducts = await Product.find(
      {},
      'id name category new_price old_price stock rating numReviews reviews description'
    ).lean();

    const catalogLines = allProducts.map((p) => {
      const topReviews = (p.reviews || [])
        .filter((r) => r.comment)
        .slice(-3)
        .map((r) => `"${r.comment}" (${r.rating || '?'}★ by ${r.name || 'customer'})`)
        .join('; ');

      return [
        `• [ID:${p.id}] ${p.name}`,
        `  Category: ${p.category}`,
        `  Price: ₹${p.new_price} (was ₹${p.old_price})`,
        `  Stock: ${p.stock ?? 'N/A'} units`,
        `  Rating: ${p.numReviews > 0 ? `${p.rating.toFixed(1)}/5 (${p.numReviews} reviews)` : 'No reviews yet'}`,
        topReviews ? `  Top reviews: ${topReviews}` : null,
        p.description ? `  Description: ${p.description}` : null,
      ].filter(Boolean).join('\n');
    });

    const catalogContext = allProducts.length > 0
      ? `\n\n--- EXPLORER STORE CATALOG (${allProducts.length} products) ---\n${catalogLines.join('\n\n')}\n--- END OF CATALOG ---\n\nYou have full access to the Explorer store catalog above. Answer user queries about any product, price, stock, category, or customer review based on this live catalog data.`
      : '\n\n(Product catalog is currently unavailable.)';

    // ── 2. Cart context ─────────────────────────────────────────────────
    const cartContext = cartItems && cartItems.length > 0
      ? `\n\nUser's current cart: ${cartItems.map(i => `${i.name} x${i.qty} (₹${i.price})`).join(', ')}`
      : '\n\nUser cart is currently empty.';

    // ── 3. Currently viewed product context (if on a product page) ──────
    let productReviewContext = '';
    if (productContext) {
      const { name, rating, numReviews, topReviews } = productContext;
      productReviewContext = `\n\nCurrently viewed product: "${name}"` +
        (numReviews > 0
          ? ` — Rated ${Number(rating).toFixed(1)}/5 across ${numReviews} review(s).` +
            (topReviews?.length
              ? ` Highlights: ${topReviews.map(r => `"${r.comment || r.review}" (${r.rating}★)`).join('; ')}.`
              : '')
          : ' — No reviews yet.');
    }

    const AURA_SYSTEM_EXTENDED = AURA_SYSTEM +
      `\n\nWhen asked about a specific product, reference its live rating and customer reviews. Quote real feedback when helpful. If no reviews exist, say so and offer general styling advice.`;

    const systemInstruction = AURA_SYSTEM_EXTENDED + catalogContext + cartContext + productReviewContext;
    const userText = messages[messages.length - 1]?.content || '';

    // ── 4. Build strictly-typed, trimmed chat history (last 6 turns) ────
    const rawHistory = messages.slice(0, -1);
    const trimmedHistory = rawHistory.slice(-6);
    const chatHistory = trimmedHistory
      .filter((m) => m.role && m.content)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(m.content) }],
      }));
    // Gemini requires history to start with a 'user' turn
    const firstUserIdx = chatHistory.findIndex((m) => m.role === 'user');
    const validHistory = firstUserIdx !== -1 ? chatHistory.slice(firstUserIdx) : [];

    const dynamicModel = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
    });

    // ── 5. Primary: multi-turn chat ─────────────────────────────────────
    try {
      const chat = dynamicModel.startChat({ history: validHistory });
      const result = await chat.sendMessage(userText);
      return res.json({ message: result.response.text() });
    } catch (chatError) {
      console.warn('⚠️ Chat session failed, falling back to single-turn:', chatError.message);

      // ── 6. Fallback: single-turn generate ──────────────────────────────
      try {
        const standalonePrompt = `${systemInstruction}\n\nUser: ${userText}`;
        const fallbackResult = await dynamicModel.generateContent(standalonePrompt);
        return res.json({ message: fallbackResult.response.text() });
      } catch (fallbackError) {
        console.error('⚠️ Fallback also failed:', fallbackError.message);
        return res.json({
          message: "I'm having a little trouble right now — please try again in a moment! 🙏",
        });
      }
    }
  } catch (err) {
    console.error('CRITICAL: AI route error:', err.message);
    return res.json({
      message: "Something went wrong on my end. Please try again shortly!",
    });
  }
});

server.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server running smoothly on Port ${PORT}`);
  } else {
    console.log('Error spinning up server: ' + error);
  }
});