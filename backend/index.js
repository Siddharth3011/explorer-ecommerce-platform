const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/db');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();
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
  
  if (product) {
    const newReview = { rating: Number(rating), review };
    product.reviews.push(newReview);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    
    await product.save();
    res.json({ success: true, message: "Review added successfully" });
  } else {
    res.json({ success: false, message: "Product not found" });
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

app.post('/getuser', fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email date');
    res.json({ success: true, name: user.name, email: user.email, date: user.date });
  } catch (error) {
    res.status(500).json({ errors: 'Server Error' });
  }
});

const Order = require('./models/Order');

app.post('/placeorder', fetchUser, async (req, res) => {
  console.log("Order Data Received:", req.body);
  try {
    const userId = req.user.id;
    const { orderId, address, items, amount } = req.body;
    
    const newOrder = new Order({
      userId,
      orderId,
      address,
      items,
      amount,
    });
    
    try {
      await newOrder.save();
    } catch (saveError) {
      console.error("Database save failed. Required fields missing or validation error:", saveError.message);
      return res.status(400).json({ success: false, message: 'Database validation failed', error: saveError.message });
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
    
    let userData = await User.findById(req.user.id);
    if (!userData.cartData) {
      userData.cartData = {};
    }
    
    userData.cartData[key] = (userData.cartData[key] || 0) + 1;
    userData.markModified('cartData');
    await userData.save();
    
    res.json({ success: true, message: "Added to Cart" });
  } catch (error) {
    console.error("Cart add error:", error);
    res.status(500).json({ success: false, message: "Cart add error" });
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
  const { messages, cartItems } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages array' });
  }

  const cartContext = cartItems && cartItems.length > 0
    ? `\n\nUser's current cart items: ${cartItems.map(i => `${i.name} x${i.qty} (₹${i.price})`).join(', ')}`
    : '\n\nUser cart is currently completely empty.';

  const userText = messages[messages.length - 1]?.content || '';

  try {
    const dynamicModel = ai.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: AURA_SYSTEM + cartContext 
    });

    // Strategy: Double Try-Catch Net
    try {
      // Primary Attempt: Try full multi-turn chat sequence
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
      console.warn("⚠️ Chat history session failed, activating standalone fallback:", chatError.message);
      
      // Secondary Attempt: Fall back immediately to an error-free standalone single-turn response
      const standalonePrompt = `System Context: ${AURA_SYSTEM}\n${cartContext}\n\nUser Message: ${userText}`;
      const fallbackResult = await dynamicModel.generateContent(standalonePrompt);
      const fallbackResponse = await fallbackResult.response;
      return res.json({ message: fallbackResponse.text() });
    }
  } catch (err) {
    console.error('CRITICAL ERROR: Total AI Layer failure:', err.stack);
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server running smoothly on Port ${PORT}`);
  } else {
    console.log("Error spinning up server: " + error);
  }
});