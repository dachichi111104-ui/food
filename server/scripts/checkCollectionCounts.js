const mongoose = require("mongoose");
const path = require("path");
const models = require("../models");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas!");
    const results = [];
    for (const [name, model] of Object.entries(models)) {
      try {
        const count = await model.countDocuments();
        results.push({ Model: name, Collection: model.collection.name, Count: count });
      } catch (e) {
        results.push({ Model: name, Collection: model.collection.name, Error: e.message });
      }
    }
    console.table(results);
  } catch (err) {
    console.error("DB connection error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}
checkDB();
