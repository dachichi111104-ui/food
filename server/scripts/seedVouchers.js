const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Voucher = require("../models/Voucher.model");
const Shop = require("../models/Shop.model");

async function seedVouchers() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

    // Xoá voucher cũ nếu có
    await Voucher.deleteMany({});
    console.log("Cleared existing vouchers.");

    // Lấy danh sách shop để gán voucher riêng cho quán
    const shops = await Shop.find({ status: "approved" });
    const shopMap = {};
    shops.forEach((s) => {
      shopMap[s.name] = s._id;
    });

    const now = new Date();
    const validFrom = new Date("2026-01-01T00:00:00Z");
    const validTo = new Date("2027-12-31T23:59:59Z");

    const vouchers = [
      /* ── 1. VOUCHER TOÀN SÀN (PLATFORM-WIDE, shop_id: null) ── */
      {
        code: "FOODGO30",
        shop_id: null,
        discount_type: "FIXED",
        discount_value: 30000,
        min_order_amount: 100000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 1000,
        used_count: 0,
        is_active: true,
      },
      {
        code: "FREESHIP",
        shop_id: null,
        discount_type: "FIXED",
        discount_value: 15000,
        min_order_amount: 50000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 2000,
        used_count: 0,
        is_active: true,
      },
      {
        code: "BANMOI",
        shop_id: null,
        discount_type: "FIXED",
        discount_value: 25000,
        min_order_amount: 60000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 500,
        used_count: 0,
        is_active: true,
      },
      {
        code: "GIAM10",
        shop_id: null,
        discount_type: "PERCENT",
        discount_value: 10,
        min_order_amount: 80000,
        max_discount_amount: 30000,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 1000,
        used_count: 0,
        is_active: true,
      },
      {
        code: "GIAM20",
        shop_id: null,
        discount_type: "PERCENT",
        discount_value: 20,
        min_order_amount: 150000,
        max_discount_amount: 50000,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 800,
        used_count: 0,
        is_active: true,
      },
      {
        code: "ANTRUA",
        shop_id: null,
        discount_type: "FIXED",
        discount_value: 20000,
        min_order_amount: 70000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 1000,
        used_count: 0,
        is_active: true,
      },
      {
        code: "CUOITUAN",
        shop_id: null,
        discount_type: "PERCENT",
        discount_value: 15,
        min_order_amount: 120000,
        max_discount_amount: 40000,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 500,
        used_count: 0,
        is_active: true,
      },
      {
        code: "FOODGO50",
        shop_id: null,
        discount_type: "FIXED",
        discount_value: 50000,
        min_order_amount: 200000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 500,
        used_count: 0,
        is_active: true,
      },
      {
        code: "VIPFOOD",
        shop_id: null,
        discount_type: "FIXED",
        discount_value: 100000,
        min_order_amount: 400000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 200,
        used_count: 0,
        is_active: true,
      },

      /* ── 2. VOUCHER RIÊNG TỪNG QUÁN ĂN (SHOP-SPECIFIC) ── */
      {
        code: "COMTAM15",
        shop_id: shopMap["Cơm Tấm Sài Gòn"] || null,
        discount_type: "FIXED",
        discount_value: 15000,
        min_order_amount: 60000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 300,
        used_count: 0,
        is_active: true,
      },
      {
        code: "PHO20K",
        shop_id: shopMap["Phở Bò Gia Truyền"] || null,
        discount_type: "FIXED",
        discount_value: 20000,
        min_order_amount: 80000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 300,
        used_count: 0,
        is_active: true,
      },
      {
        code: "BUNBO10",
        shop_id: shopMap["Bún Bò Huế Cố Đô"] || null,
        discount_type: "PERCENT",
        discount_value: 10,
        min_order_amount: 50000,
        max_discount_amount: 25000,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 300,
        used_count: 0,
        is_active: true,
      },
      {
        code: "BANHMI5K",
        shop_id: shopMap["Bánh Mì Góc Phố"] || null,
        discount_type: "FIXED",
        discount_value: 5000,
        min_order_amount: 25000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 500,
        used_count: 0,
        is_active: true,
      },
      {
        code: "HUTIEU15",
        shop_id: shopMap["Hủ Tiếu Nam Vang"] || null,
        discount_type: "FIXED",
        discount_value: 15000,
        min_order_amount: 60000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 300,
        used_count: 0,
        is_active: true,
      },
      {
        code: "ANVAT10",
        shop_id: shopMap["Ăn Vặt Nhà Gạo"] || null,
        discount_type: "FIXED",
        discount_value: 10000,
        min_order_amount: 50000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 400,
        used_count: 0,
        is_active: true,
      },
      {
        code: "COMNIEU25",
        shop_id: shopMap["Cơm Niêu Quê Nhà"] || null,
        discount_type: "FIXED",
        discount_value: 25000,
        min_order_amount: 100000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 300,
        used_count: 0,
        is_active: true,
      },
      {
        code: "BBQ50K",
        shop_id: shopMap["BBQ Phố Đêm"] || null,
        discount_type: "FIXED",
        discount_value: 50000,
        min_order_amount: 250000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 200,
        used_count: 0,
        is_active: true,
      },
      {
        code: "HAISAN10P",
        shop_id: shopMap["Hải Sản Biển Xanh"] || null,
        discount_type: "PERCENT",
        discount_value: 10,
        min_order_amount: 300000,
        max_discount_amount: 80000,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 200,
        used_count: 0,
        is_active: true,
      },
      {
        code: "DIMSUM20",
        shop_id: shopMap["Dim Sum Hồng Kông"] || null,
        discount_type: "FIXED",
        discount_value: 20000,
        min_order_amount: 90000,
        max_discount_amount: null,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: 300,
        used_count: 0,
        is_active: true,
      },
    ];

    const inserted = await Voucher.insertMany(vouchers);
    console.log(`Successfully seeded ${inserted.length} vouchers into collection!`);
  } catch (error) {
    console.error("Error seeding vouchers:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedVouchers();
