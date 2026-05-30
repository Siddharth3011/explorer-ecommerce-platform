const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.get('/allproducts', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
