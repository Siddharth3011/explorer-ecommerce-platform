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

app.use('/images', express.static('upload/images'));

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

app.post('/addreview', async (req, res) => {
  const { productId, rating, review } = req.body;
  const product = await Product.findOne({ id: productId });

  if (!product) {
    return res.json({ success: false, message: 'Product not found' });
  }

  const newReview = { rating: Number(rating), review };
  product.reviews.push(newReview);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();

  // Emit real-time update to all connected clients
  io.emit('review_updated', {
    productId: product.id,
    rating: product.rating,
    numReviews: product.numReviews,
    latestReview: newReview,
    topReviews: product.reviews.slice(-5).reverse(),
  });

  res.json({ success: true, message: 'Review added successfully' });
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

const AURA_SYSTEM = `You are 'Aura', an elite embedded context-aware shopping assistant for the Explorer marketplace. Guide users seamlessly, recommend item collections, answer styling questions intelligently, and cross-reference answers with their cart state items. Be concise, warm, and genuinely helpful. Format responses cleanly — use bullet points for lists. Never make up products not in context.`;

app.post('/api/ai/chat', async (req, res) => {
  const { messages, cartItems, productContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages array' });
  }

  const cartContext = cartItems && cartItems.length > 0
    ? `\n\nUser's current cart items: ${cartItems.map(i => `${i.name} x${i.qty} (₹${i.price})`).join(', ')}`
    : '\n\nUser cart is currently completely empty.';

  // Inject live product review context when user is on a product page
  let productReviewContext = '';
  if (productContext) {
    const { name, rating, numReviews, topReviews } = productContext;
    productReviewContext = `\n\nCurrently viewed product: "${name}"` +
      (numReviews > 0
        ? ` — Average rating: ${rating.toFixed(1)}/5 stars across ${numReviews} review(s).` +
          (topReviews?.length
            ? ` Recent customer feedback: ${topReviews.map(r => `"${r.review}" (${r.rating}★)`).join('; ')}.`
            : '')
        : ' — No customer reviews yet.');
  }

  const AURA_SYSTEM_EXTENDED = AURA_SYSTEM +
    `\n\nWhen asked about a product, naturally reference its live rating score and customer sentiment from reviews. Quote specific feedback when relevant. If no reviews exist, acknowledge that and offer general advice.`;

  const userText = messages[messages.length - 1]?.content || '';

  try {
    const dynamicModel = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: AURA_SYSTEM_EXTENDED + cartContext + productReviewContext,
    });

    try {
      const chatHistory = messages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
      const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
      const validHistory = firstUserIndex !== -1 ? chatHistory.slice(firstUserIndex) : [];

      const chat = dynamicModel.startChat({ history: validHistory });
      const result = await chat.sendMessage(userText);
      const response = await result.response;
      return res.json({ message: response.text() });
    } catch (chatError) {
      console.warn('⚠️ Chat history session failed, activating standalone fallback:', chatError.message);
      const standalonePrompt = `System Context: ${AURA_SYSTEM_EXTENDED}\n${cartContext}${productReviewContext}\n\nUser Message: ${userText}`;
      const fallbackResult = await dynamicModel.generateContent(standalonePrompt);
      const fallbackResponse = await fallbackResult.response;
      return res.json({ message: fallbackResponse.text() });
    }
  } catch (err) {
    console.error('CRITICAL ERROR: Total AI Layer failure:', err.stack);
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
});

server.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server running smoothly on Port ${PORT}`);
  } else {
    console.log('Error spinning up server: ' + error);
  }
});