const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate favorites for same user + shop
favoriteSchema.index({ user_id: 1, shop_id: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
