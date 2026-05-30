const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  address: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    pincode: String,
    state: String,
  },
  items: [
    {
      productId: Number,
      name: String,
      image: String,
      price: Number,
      qty: Number,
      size: String,
    }
  ],
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Order', OrderSchema);
