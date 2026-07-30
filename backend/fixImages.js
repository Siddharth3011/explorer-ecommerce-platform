const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function fixImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const products = await Product.find();
    let updatedCount = 0;

    for (let product of products) {
      if (product.image && product.image.includes('localhost:5000')) {
        // REPLACE 'https://your-deployed-backend.vercel.app' WITH YOUR ACTUAL RENDER/VERCEL BACKEND URL
        product.image = product.image.replace(
          'http://localhost:5000', 
          'https://your-deployed-backend.vercel.app'
        );
        await product.save();
        updatedCount++;
      }
    }

    console.log(`Success! Updated ${updatedCount} product image URLs.`);
  } catch (err) {
    console.error('Error updating images:', err);
  } finally {
    mongoose.disconnect();
    process.exit();
  }
}

fixImages();