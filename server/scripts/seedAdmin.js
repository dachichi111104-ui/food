require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { User } = require("../models");

const run = async () => {
  await connectDB();

  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: node scripts/seedAdmin.js <email> <password>");
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.error("Email already in use");
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name: "Admin",
    email,
    password_hash,
    role: "admin",
  });

  console.log("Admin created:", admin.email);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});