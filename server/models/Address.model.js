const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: {
      type: String,
      enum: ["Nhà", "Trường", "Công ty", "Khác"],
      default: "Nhà",
    },
    recipient_name: { type: String, required: true, trim: true },
    recipient_phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    street: { type: String, trim: true },
    house_number: { type: String, trim: true },
    full_address: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    delivery_note: { type: String, trim: true },
    is_default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
