const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { canTransition } = require("../utils/orderStateMachine");
const { processChatMessage } = require("../services/chatbot.service");
const voucherService = require("../services/voucher.service");
const shopService = require("../services/shop.service");
const productService = require("../services/product.service");

async function runTests() {
  console.log("=== STARTING FULL SYSTEM INTEGRITY AUDIT ===");

  // 1. Test Order State Machine Transitions
  console.log("\n[TEST 1] Testing Order State Machine Transitions...");
  const validTransitions = [
    ["PENDING_PAYMENT", "CONFIRMED", true],
    ["PENDING_PAYMENT", "CANCELLED", true],
    ["CONFIRMED", "PREPARING", true],
    ["CONFIRMED", "CANCELLED", true],
    ["PREPARING", "HANDED_TO_SHIPPER", true],
    ["HANDED_TO_SHIPPER", "DELIVERED", true],
    ["DELIVERED", "COMPLETED", true],
    ["COMPLETED", "REFUNDING", true],
    ["REFUNDING", "REFUNDED", true],
    ["COMPLETED", "PREPARING", false],
    ["CANCELLED", "CONFIRMED", false],
  ];

  for (const [from, to, expected] of validTransitions) {
    const actual = canTransition(from, to);
    if (actual !== expected) {
      throw new Error(`State machine failed for ${from} -> ${to}: expected ${expected}, got ${actual}`);
    }
  }
  console.log("✓ All 11 State Machine transitions verified correctly!");

  // 2. Connect to MongoDB Atlas
  console.log("\n[TEST 2] Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Connected to MongoDB Atlas successfully!");

  // 3. Test Safe Regex Searching
  console.log("\n[TEST 3] Testing Safe Regex Searching (handling special chars)...");
  const specialQueries = [
    "Cà phê (sữa)",
    "Combo [2 người]",
    "Gà rán + khoai",
    "Phở bò? ngon",
    "Trà sữa $10",
  ];

  for (const query of specialQueries) {
    // Test shop search
    const shopResult = await shopService.listPublicShops({ search: query });
    if (!shopResult || !Array.isArray(shopResult.shops)) {
      throw new Error(`Shop search failed for special query: ${query}`);
    }

    // Test product search
    const prodResult = await productService.listPublicProducts({ search: query });
    if (!prodResult || !Array.isArray(prodResult.products)) {
      throw new Error(`Product search failed for special query: ${query}`);
    }

    // Test chatbot search
    const chatResult = await processChatMessage(null, query);
    if (!chatResult || !chatResult.reply) {
      throw new Error(`Chatbot search failed for special query: ${query}`);
    }
  }
  console.log("✓ All 5 special character regex queries executed safely without crashes!");

  // 4. Test Voucher Calculation Logic
  console.log("\n[TEST 4] Testing Voucher Validation and Calculation...");
  const publicVouchers = await voucherService.listPublicVouchers();
  console.log(`✓ Fetched ${publicVouchers.length} public vouchers from database.`);

  if (publicVouchers.length > 0) {
    const testV = publicVouchers[0];
    const calc = await voucherService.applyVoucher({
      code: testV.code,
      order_subtotal: 500000,
    });
    if (!calc.discount_amount || calc.discount_amount <= 0) {
      throw new Error(`Voucher calculation failed for code ${testV.code}`);
    }
    console.log(`✓ Voucher ${testV.code} applied successfully: Discount = ${calc.discount_amount.toLocaleString()}đ`);
  }

  // 5. Test Live Chatbot Intent Routing
  console.log("\n[TEST 5] Testing Chatbot AI Intent Responses...");
  const prompts = [
    "Gợi ý quán ngon gần tôi",
    "Có voucher khuyến mãi gì không",
    "Làm sao để đặt món?",
  ];

  for (const p of prompts) {
    const res = await processChatMessage(null, p);
    if (!res.reply) throw new Error(`Empty reply for prompt: ${p}`);
    console.log(`✓ Prompt: "${p}" -> Bot: "${res.reply.slice(0, 45)}..."`);
  }

  console.log("\n=== ALL SYSTEM TESTS PASSED SUCCESSFULLY! ===");
  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error("\n❌ SYSTEM INTEGRITY AUDIT FAILED:", err);
  process.exit(1);
});
