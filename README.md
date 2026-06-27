<div align="center">

# 🛍️ Explorer E-Commerce Platform

### A production-grade full-stack MERN storefront with AI-powered shopping assistance, secure payments, and real-time cart persistence.

<br/>

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)

</div>

---

## 📌 Overview

**Explorer** is a modern, full-stack e-commerce application built on the MERN stack. It ships a complete storefront experience — dynamic product catalog, persistent shopping cart, MongoDB-backed order history, wishlist management, and a Gemini-powered AI shopping assistant named **Aura**.

The architecture follows a clean monorepo pattern with isolated `frontend/` and `backend/` layers, each independently deployable, backed by a MongoDB Atlas cloud database.

---

## ✨ Key Features

| # | Feature | Description |
|---|---------|-------------|
| 🛒 | **Dynamic Product Catalog** | Category-filtered browsing across Men, Women, and Kids collections with size selection and live cart badge updates |
| 🔐 | **JWT Authentication** | Secure signup/login with `bcryptjs` password hashing and stateless JWT token sessions stored in `localStorage` |
| 🛡️ | **Route Guarding** | Amazon/Flipkart-style access control — unauthenticated users are redirected to login before accessing `/cart` or `/checkout` |
| 🤖 | **Aura AI Assistant** | Embedded Gemini 2.5 Flash chatbot with cart-context injection, multi-turn conversation history, and a double try-catch fallback strategy for zero-downtime responses |
| 💳 | **Razorpay Checkout** | Test-mode payment gateway integration with order ID generation, secure checkout pipeline, and post-payment cart clearing |
| 📦 | **Persistent Cart & Wishlist** | Cart and wishlist data stored in MongoDB per user — survives logout, re-login, and cross-device sessions |
| 📋 | **Live Orders History** | Authenticated `/api/orders` feed rendering real-time order records sorted by date, with full address and item breakdown |
| 🌗 | **Dark / Light Mode** | Global theme context with instant toggle persisted across the session |
| 📱 | **Fully Responsive UI** | Mobile-first layouts across all viewports (320px → 1440px+) with dedicated hamburger drawer, collapsing search row, and fluid grid |
| ⭐ | **Product Reviews** | Per-product rating submissions with live average score recalculation on the backend |

---

## 🏗️ Architecture

```
explorer-ecommerce-platform/
├── .gitignore                  # Root-level unified ignore (covers both layers)
│
├── backend/                    # Express REST API
│   ├── db/db.js                # MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js             # User schema (cart, wishlist, auth)
│   │   ├── Product.js          # Product schema (ratings, reviews)
│   │   └── Order.js            # Order schema (items, address, amount)
│   ├── routes/productRoutes.js # Product CRUD endpoints
│   ├── upload/images/          # Static product image assets
│   ├── index.js                # App entry — all auth, cart, AI, order routes
│   └── .env                    # Backend secrets (never committed)
│
└── frontend/                   # React 18 SPA
    ├── public/
    └── src/
        ├── App.js              # Route definitions + auth guards
        ├── Context/
        │   ├── ShopContext.jsx # Global state (cart, wishlist, products, search)
        │   └── ThemeContext.jsx
        ├── Components/
        │   ├── Navbar/         # Responsive navbar with mobile drawer
        │   ├── RufusAssistant/ # Aura AI chat interface
        │   ├── ProductDisplay/ # Product detail with size picker
        │   └── ...             # Hero, Footer, Item, CartItems, etc.
        └── Pages/
            ├── Checkout.jsx    # Razorpay payment + order placement
            ├── MyOrders.jsx    # Authenticated order history
            ├── Wishlist.jsx    # Persisted wishlist view
            └── ...
```

---

## 🧰 Tech Stack

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.3 | UI framework |
| React Router DOM | v7 | Client-side routing + route guards |
| Framer Motion | 12.x | Animations and micro-interactions |
| React Markdown | 10.x | Renders Aura AI formatted responses |
| Vanilla CSS | — | Custom design system, no UI library |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Express | 5.x | REST API framework |
| Mongoose | 9.x | MongoDB ODM |
| jsonwebtoken | 9.x | JWT session tokens |
| bcryptjs | 3.x | Password hashing |
| @google/generative-ai | 0.24 | Gemini AI SDK |
| dotenv | 17.x | Environment variable management |
| cors | 2.x | Cross-origin request handling |

### Infrastructure
| Tool | Role |
|------|------|
| MongoDB Atlas | Cloud database |
| Vercel | Frontend deployment |
| Vercel (serverless) | Backend deployment |
| Razorpay (test mode) | Payment gateway |
| Google Gemini 2.5 Flash | Aura AI model |

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18.x
- A MongoDB Atlas cluster URI
- A Gemini API key ([get one free](https://aistudio.google.com/))
- A Razorpay test account key pair ([dashboard](https://dashboard.razorpay.com/))

---

### 1. Clone the repository

```bash
git clone https://github.com/Siddharth3011/explorer-ecommerce-platform.git
cd explorer-ecommerce-platform
```

---

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 3. Configure environment variables

**`backend/.env`**
```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/explorer?retryWrites=true&w=majority

# JWT signing secret — use a strong random string in production
JWT_SECRET=your_jwt_secret_key_here

# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Allowed frontend origin for CORS
CLIENT_URL=http://localhost:3000

# Server port
PORT=5000
```

**`frontend/.env`**
```env
# Backend API base URL
REACT_APP_BACKEND_URL=http://localhost:5000

# Razorpay test key (public — safe to expose in frontend)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

> ⚠️ **Never commit `.env` files.** Both are already listed in `.gitignore`.

---

### 4. Run the development servers

```bash
# Terminal 1 — Start backend
cd backend
npm start
# → Server running on http://localhost:5000

# Terminal 2 — Start frontend
cd frontend
npm start
# → React app running on http://localhost:3000
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/signup` | ✗ | Register a new user |
| `POST` | `/login` | ✗ | Authenticate and receive JWT |
| `POST` | `/getuser` | ✓ | Fetch authenticated user profile |
| `POST` | `/addtocart` | ✓ | Add item + size to cart |
| `POST` | `/removefromcart` | ✓ | Decrement or remove cart item |
| `POST` | `/getcart` | ✓ | Fetch full cart map |
| `POST` | `/addtowishlist` | ✓ | Add product to wishlist |
| `POST` | `/removefromwishlist` | ✓ | Remove product from wishlist |
| `POST` | `/getwishlist` | ✓ | Fetch full wishlist map |
| `POST` | `/placeorder` | ✓ | Save order + clear cart |
| `GET`  | `/api/orders` | ✓ | Fetch user's order history |
| `POST` | `/api/ai/chat` | ✗ | Send message to Aura AI |
| `POST` | `/addreview` | ✗ | Submit a product rating + review |

> **Auth** column: ✓ = requires `auth-token` header with valid JWT

---

## 🤖 Aura AI — Implementation Notes

Aura is powered by **Gemini 2.5 Flash** and runs as a backend proxy endpoint (`/api/ai/chat`) to keep the API key server-side.

Key engineering decisions:
- **Cart context injection**: The current user's cart items are serialized and appended to the system instruction on every request, giving Aura real-time awareness of what the user is shopping for.
- **Double try-catch fallback**: The primary path attempts a full multi-turn `startChat` session. If Gemini rejects the history format, the catch block instantly retries as a single-turn `generateContent` call — ensuring responses always arrive with no visible error to the user.
- **Role normalization**: Chat history is mapped from the frontend's `{role, content}` format to Gemini's `{role, parts: [{text}]}` schema before being sent.

---

## 💳 Razorpay Checkout Flow

```
User clicks "Proceed to Pay"
        ↓
Frontend POSTs to Razorpay orders API → receives order_id
        ↓
Razorpay payment modal opens (test mode)
        ↓
On payment success → frontend POSTs /placeorder to backend
        ↓
Backend saves Order doc to MongoDB + clears user's cartData
        ↓
User redirected to /orders with live order confirmation
```

---

## 📄 License

This project is for portfolio and educational purposes. All product images are used under fair use for demonstration.

---

<div align="center">

Built with ☕ by **Siddharth Pandey**

[![GitHub](https://img.shields.io/badge/GitHub-Siddharth3011-181717?style=flat-square&logo=github)](https://github.com/Siddharth3011)

</div>
