const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const connectDB = require('./db/db');
require('dotenv').config();

connectDB();

const seedData = async () => {
  try {
    const filePath = path.join(__dirname, '../frontend/src/Components/Assets/all_product.js');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const arrayRegex = /let all_product = (\[[\s\S]*?\]);/m;
    const match = fileContent.match(arrayRegex);
    
    if (!match) {
      throw new Error("Could not find all_product array in the file");
    }

    let arrayString = match[1];

    arrayString = arrayString.replace(/image:\s*(p\d+_img)/g, (match, p1) => {
      const imgNum = p1.split('_')[0].replace('p', '');
      return `image: "http://localhost:4000/images/product_${imgNum}.png"`;
    });

    arrayString = arrayString.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    
    const rawProducts = new Function('return ' + arrayString)();
    const products = rawProducts.map(p => ({ ...p, stock: p.stock ?? 10 }));

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log('Data Imported Successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
