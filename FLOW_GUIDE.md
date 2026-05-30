# 🛍️ EXPLORER — Full-Stack Data Flow Guide

> A quick, high-level breakdown of how data moves across this MERN application.

---

## 1. System Architecture

* **Frontend:** React 18 + React Router v6 + Framer Motion (UI Animations).
* **State Management:** React Context API (`ShopContext`).
* **Backend API:** Node.js + Express 5.
* **Database:** MongoDB Atlas via Mongoose 9.
* **Security & AI:** JWT Auth (`jsonwebtoken`) + Google Gemini 2.5 Flash API.

---

## 2. Core Operational Data Flows

### 🔐 Authentication (Signup & Login)
* **Signup:** Client sends user data → Backend hashes password using `bcryptjs` (10 salt rounds) → Saves user record to MongoDB → Generates stateless JWT → Client stores token in `localStorage`.
* **Login:** Client sends credentials → Backend validates via `bcrypt.compare()` → Returns JWT on success.
* **Route Protection:** Handled via custom backend middleware (`fetchUser`) which decodes the token from the `auth-token` request header to verify identity.

### 🔍 Search Lifecycle
* Checked instantly using structural conditions (`searchQuery.trim() !== "" && filteredProducts.length === 0`). 
* If a query yields zero matches, the UI immediately flips to render a custom "No Results Found" view, even on the very first page load.

### 🛒 Cart & Database Synchronization
* **Compound SKU Keys:** Items are tracked using unique composite string templates (`itemId_size`) so different sizes of the same item don't overwrite each other.
* **Defensive Error Catching:** Includes fallback handlers (`size || 'M'`) to automatically assign a default size if an item is added directly from the catalog grid without an explicit size selection.
* **Database Sync:** Changes immediately trigger authenticated `POST` requests (`/api/cart/add`) to update the user's persistent `cartData` object inside MongoDB Atlas, making cart items cross-device persistent.

### 🤖 Aura AI Chat Routing
* Captures conversation arrays and passes them as a sanitised history parameter directly to Gemini's `startChat()` engine.
* **Fail-Safe Processing:** If a structural history validation glitch occurs, a secondary try-catch loop immediately kicks in, executing a standalone `generateContent()` prompt fallback so the chat drawer never crashes.