const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image_url: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    target_url: { type: String, default: "/" },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date },
    is_active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
