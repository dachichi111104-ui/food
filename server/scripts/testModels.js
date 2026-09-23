require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { User, Shop, Category, Product, ProductVariant } = require("../models");

const run = async () => {
  await connectDB();

  // Tạo thử 1 user seller
  const user = await User.create({
    name: "Test Seller",
    email: `seller_${Date.now()}@test.com`,
    password_hash: "fake_hash_for_now",
    role: "seller",
  });
  console.log("Created user:", user._id.toString());

  const shop = await Shop.create({
    user_id: user._id,
    name: "Quán Test",
    status: "approved",
  });
  console.log("Created shop:", shop._id.toString());

  const category = await Category.create({ name: "Đồ uống" });
  console.log("Created category:", category._id.toString());

  const product = await Product.create({
    shop_id: shop._id,
    category_id: category._id,
    name: "Trà sữa trân châu",
  });
  console.log("Created product:", product._id.toString());

  const variant = await ProductVariant.create({
    product_id: product._id,
    name: "Size M",
    price: 35000,
    stock: 10,
    reserved_quantity: 0,
  });
  console.log("Created variant:", variant._id.toString());
  console.log("Available stock (virtual):", variant.available);

  await mongoose.connection.close();
  console.log("Done. Connection closed.");
};

run().catch((err) => {
  console.error("Test script failed:", err);
  process.exit(1);
});