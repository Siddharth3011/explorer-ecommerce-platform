const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:      { type: String, default: 'Anonymous' },
  rating:    { type: Number, default: 0, min: 0, max: 5 },
  comment:   { type: String, default: '' },
  mediaUrl:  { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video', ''], default: '' },
  date:      { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  reviews: {
    type: [reviewSchema],
    default: [],
  },
  stock: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
