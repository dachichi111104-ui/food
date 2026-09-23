/**
 * FoodGo — Database Seed Script
 * ==============================
 * Chạy: node seed.js
 *
 * Tạo dữ liệu mẫu đầy đủ:
 *   - 1 admin, 6 sellers (mỗi người có 1 shop đã duyệt), 5 buyers, 2 shippers
 *   - 8 categories
 *   - Mỗi shop: 4–5 products, mỗi product 1–3 variants
 *   - 6 completed orders (có items + shipments + reviews)
 *   - 4 in-progress orders + 2 pending orders
 *   - Hình ảnh: Unsplash food photos (public CDN, free to use)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const {
  User, Shop, Category, Product, ProductVariant,
  Order, ShopOrder, OrderItem, Shipment, Review, Cart, CartItem,
} = require("./models");

/* ── Helpers ── */
const hash = (pw) => bcrypt.hashSync(pw, 10);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ── Unsplash image URLs (public, stable) ──
   Format: https://images.unsplash.com/photo-<ID>?w=800&q=80&auto=format&fit=crop
*/
const IMG = {
  /* Shop covers */
  shop_comtam:    "https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80&auto=format&fit=crop",
  shop_pho:       "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=800&q=80&auto=format&fit=crop",
  shop_burger:    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop",
  shop_bbq:       "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80&auto=format&fit=crop",
  shop_traSua:    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop",
  // FIX: "shop_comVP" trước đây trỏ đến photo-1512058564366-18510be2db19, một ID bị
  // dùng lặp lại ở 4 chỗ khác nhau (xem log sửa lỗi cuối file) và khi kiểm tra lại
  // không đảm bảo hiển thị đúng món cơm — đã đổi sang ảnh cơm gà (com_ga) của chính
  // shop này, tránh dùng ảnh của shop/món khác làm cover.
  shop_comVP:     "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80&auto=format&fit=crop",

  /* Shop logos (square thumbnails) */
  logo_comtam:    "https://images.unsplash.com/photo-1562802378-063ec186a863?w=200&q=80&auto=format&fit=crop",
  logo_pho:       "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=200&q=80&auto=format&fit=crop",
  logo_burger:    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80&auto=format&fit=crop",
  logo_bbq:       "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80&auto=format&fit=crop",
  logo_traSua:    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80&auto=format&fit=crop",
  logo_comVP:     "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&q=80&auto=format&fit=crop",

  /* Product images */
  comtam_suonBiCha:  "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&q=80&auto=format&fit=crop",
  comtam_suonNuong:  "https://images.unsplash.com/photo-1609167830220-7164aa360951?w=600&q=80&auto=format&fit=crop",
  // FIX: ảnh cũ (photo-1512058564366-18510be2db19) không phải cơm tấm — đổi sang ảnh
  // "Com-Tam-2008.jpg" trên Wikimedia Commons, được chính bài "Cơm tấm" trên nhiều
  // phiên bản Wikipedia (vi, en, fr, es...) dùng làm ảnh minh hoạ, mô tả đúng: "Vietnamese
  // broken rice (cơm tấm) with grilled pork, shredded pork and pork skin, fried egg...".
  // Giấy phép: CC BY-SA 3.0, cần ghi công tác giả (Kham Tran) nếu dùng ngoài phạm vi seed demo.
  comtam_biTrung:    "https://commons.wikimedia.org/wiki/Special:FilePath/Com-Tam-2008.jpg?width=600",
  caPheSuaDa:        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80&auto=format&fit=crop",

  pho_boTaiChin:     "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80&auto=format&fit=crop",
  pho_dBiet:         "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=600&q=80&auto=format&fit=crop",
  pho_ga:            "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80&auto=format&fit=crop",
  bunBo:             "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&q=80&auto=format&fit=crop",
  traDA:             "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80&auto=format&fit=crop",

  burger_classic:    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format&fit=crop",
  burger_spicy:      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80&auto=format&fit=crop",
  burger_double:     "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80&auto=format&fit=crop",
  khoaiTay:          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80&auto=format&fit=crop",
  milkshake:         "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80&auto=format&fit=crop",

  ga_nuong:          "https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=600&q=80&auto=format&fit=crop",
  canh_ga:           "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80&auto=format&fit=crop",
  suonBBQ:           "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80&auto=format&fit=crop",
  traTac:            "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80&auto=format&fit=crop",

  traSuu_DD:         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop",
  matcha:            "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80&auto=format&fit=crop",
  hongTra:           "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80&auto=format&fit=crop",
  tiramisu:          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80&auto=format&fit=crop",
  crepe:             "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&q=80&auto=format&fit=crop",

  com_ga:            "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&q=80&auto=format&fit=crop",
  // FIX: trước đây trùng ảnh với "comtam_biTrung" (chính là ảnh sushi lỗi) — đổi sang
  // ảnh cơm sườn nướng đã xác nhận đúng (dùng chung với comtam_suonNuong ở trên).
  com_thit:          "https://images.unsplash.com/photo-1609167830220-7164aa360951?w=600&q=80&auto=format&fit=crop",
  com_ca:            "https://images.unsplash.com/photo-1502998070258-dc1338445ac2?w=600&q=80&auto=format&fit=crop",
  nuocEpCam:         "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80&auto=format&fit=crop",
};

/* ══════════════════════════════════════════════════════════
   RAW DATA — 6 shops, mỗi shop 4–5 products
══════════════════════════════════════════════════════════ */
const SHOPS_RAW = [
  /* ── SHOP 1: Cơm tấm Sài Gòn ── */
  {
    name: "Cơm tấm Sài Gòn Ba Đình",
    description: "Cơm tấm truyền thống với bì, chả, sườn nướng, trứng ốp la — đậm vị Nam Bộ.",
    address: "45 Hai Bà Trưng, P. Bến Nghé, Q.1, TP.HCM",
    cover_url: IMG.shop_comtam,
    logo_url: IMG.logo_comtam,
    products: [
      { name: "Cơm tấm sườn bì chả",  description: "Cơm tấm với sườn nướng, bì, chả, trứng ốp la, dưa chua và nước mắm đặc trưng.",      cat: "Cơm",                 image_url: IMG.comtam_suonBiCha, variants: [{ name: "Phần thường", price: 45000, stock: 80 }, { name: "Phần đặc biệt", price: 65000, stock: 60 }] },
      { name: "Cơm tấm sườn nướng",   description: "Sườn non nướng mật ong, cơm tấm thơm dẻo, ăn kèm canh chua.",                          cat: "Cơm",                 image_url: IMG.comtam_suonNuong, variants: [{ name: "Phần thường", price: 40000, stock: 70 }, { name: "Phần đặc biệt", price: 58000, stock: 50 }] },
      { name: "Cơm tấm bì trứng",     description: "Bì lợn thái sợi trộn thính, trứng chiên, cơm tấm nóng hổi.",                           cat: "Cơm",                 image_url: IMG.comtam_biTrung,   variants: [{ name: "Phần thường", price: 35000, stock: 90 }] },
      { name: "Cà phê sữa đá",        description: "Cà phê phin truyền thống pha với sữa đặc, thêm đá viên mát lạnh.",                      cat: "Đồ uống & Trà sữa",   image_url: IMG.caPheSuaDa,       variants: [{ name: "Ly nhỏ", price: 20000, stock: 200 }, { name: "Ly lớn", price: 25000, stock: 200 }] },
    ],
  },

  /* ── SHOP 2: Phở Hà Nội ── */
  {
    name: "Phở Hà Nội Gốc — Gia truyền",
    description: "Phở bò hầm xương 12 tiếng, nước dùng trong vắt, thơm lừng gia vị Bắc.",
    address: "12 Lý Tự Trọng, P. Bến Nghé, Q.1, TP.HCM",
    cover_url: IMG.shop_pho,
    logo_url: IMG.logo_pho,
    products: [
      { name: "Phở bò tái chín",    description: "Phở bò Hà Nội với tái, chín, gầu, gân. Nước dùng hầm 12 tiếng.",                    cat: "Phở & Bún",            image_url: IMG.pho_boTaiChin, variants: [{ name: "Tô nhỏ", price: 60000, stock: 100 }, { name: "Tô lớn", price: 80000, stock: 80 }] },
      { name: "Phở bò đặc biệt",   description: "Phở đặc biệt với đủ các loại thịt: tái, chín, gầu, gân, sách.",                       cat: "Phở & Bún",            image_url: IMG.pho_dBiet,     variants: [{ name: "Tô đặc biệt", price: 95000, stock: 60 }] },
      { name: "Phở gà ta",         description: "Phở gà nguyên con luộc mềm, nước dùng ngọt thanh, thêm hành phi.",                    cat: "Phở & Bún",            image_url: IMG.pho_ga,        variants: [{ name: "Tô nhỏ", price: 55000, stock: 80 }, { name: "Tô lớn", price: 70000, stock: 60 }] },
      { name: "Bún bò Huế",        description: "Bún bò Huế cay nồng với chả lụa, giò heo, mắm ruốc đặc trưng miền Trung.",           cat: "Phở & Bún",            image_url: IMG.bunBo,         variants: [{ name: "Tô thường", price: 55000, stock: 70 }, { name: "Tô đặc biệt", price: 75000, stock: 50 }] },
      { name: "Trà đá Hà Nội",     description: "Trà ướp hoa nhài, uống lạnh — giải nhiệt sau tô phở nóng.",                           cat: "Đồ uống & Trà sữa",    image_url: IMG.traDA,         variants: [{ name: "Ly", price: 10000, stock: 300 }] },
    ],
  },

  /* ── SHOP 3: Burger & Co. ── */
  {
    name: "Burger & Co. — Thủ Công Việt",
    description: "Burger thủ công patty bò Úc, phô mai tan chảy, sốt BBQ pha chế riêng.",
    address: "88 Điện Biên Phủ, P.17, Q. Bình Thạnh, TP.HCM",
    cover_url: IMG.shop_burger,
    logo_url: IMG.logo_burger,
    products: [
      { name: "Classic Beef Burger",    description: "Patty bò Úc 150g, phô mai cheddar, rau xà lách, cà chua, sốt mustard.",              cat: "Đồ ăn nhanh",  image_url: IMG.burger_classic, variants: [{ name: "Đơn", price: 79000, stock: 60 }, { name: "Combo (thêm khoai + nước)", price: 119000, stock: 50 }] },
      { name: "Spicy Chicken Burger",   description: "Ức gà chiên giòn sốt cay Sriracha, dưa chuột muối chua, cabbage slaw.",              cat: "Đồ ăn nhanh",  image_url: IMG.burger_spicy,   variants: [{ name: "Đơn", price: 69000, stock: 70 }, { name: "Combo", price: 105000, stock: 55 }] },
      { name: "Double Smash Burger",    description: "Hai patty bò smashed mỏng, hai lớp phô mai American tan chảy, special sauce.",       cat: "Đồ ăn nhanh",  image_url: IMG.burger_double,  variants: [{ name: "Đơn", price: 99000, stock: 40 }, { name: "Combo", price: 145000, stock: 35 }] },
      { name: "Khoai tây chiên",        description: "Khoai tây cắt thủ công, chiên giòn vàng, rắc muối hồng Himalaya.",                   cat: "Đồ ăn nhanh",  image_url: IMG.khoaiTay,       variants: [{ name: "Vừa", price: 35000, stock: 150 }, { name: "Lớn", price: 48000, stock: 100 }] },
      { name: "Milkshake",              description: "Milkshake kem Vanilla/Chocolate/Dâu — đặc sánh, ngọt mát.",                           cat: "Đồ uống & Trà sữa", image_url: IMG.milkshake, variants: [{ name: "Vanilla", price: 55000, stock: 80 }, { name: "Chocolate", price: 55000, stock: 80 }] },
    ],
  },

  /* ── SHOP 4: Gà Nướng Honey ── */
  {
    name: "Gà Nướng Honey & BBQ",
    description: "Gà nguyên con nướng mật ong, da giòn vàng, thịt thấm gia vị, ăn kèm muối ớt xanh.",
    address: "203 Hoàng Văn Thụ, P.8, Q. Phú Nhuận, TP.HCM",
    cover_url: IMG.shop_bbq,
    logo_url: IMG.logo_bbq,
    products: [
      { name: "Gà nguyên con nướng mật ong", description: "Gà ta (1.2–1.5kg) nướng lò hơi + than hoa, tẩm sốt mật ong – tỏi – ớt đặc trưng.", cat: "Gà & BBQ", image_url: IMG.ga_nuong, variants: [{ name: "Nửa con", price: 115000, stock: 30 }, { name: "Nguyên con", price: 220000, stock: 20 }] },
      { name: "Cánh gà chiên nước mắm",      description: "Cánh giữa chiên giòn, rim nước mắm – đường – tỏi ớt, ăn là ghiền.",                     cat: "Gà & BBQ", image_url: IMG.canh_ga, variants: [{ name: "6 cánh", price: 75000, stock: 60 }, { name: "12 cánh", price: 145000, stock: 40 }] },
      { name: "Sườn non nướng BBQ",          description: "Sườn heo non ướp BBQ Mỹ, nướng than hoa, kèm dưa leo và cơm trắng.",                      cat: "Gà & BBQ", image_url: IMG.suonBBQ, variants: [{ name: "1 suất (300g)", price: 135000, stock: 40 }] },
      { name: "Trà tắc đá",                  description: "Trà xanh pha chanh tắc, thêm đá viên — thanh mát giải ngán.",                              cat: "Đồ uống & Trà sữa", image_url: IMG.traTac, variants: [{ name: "Ly lớn", price: 25000, stock: 200 }] },
    ],
  },

  /* ── SHOP 5: Trà Sữa Ơi ── */
  {
    name: "Trà Sữa Ơi — Milk Tea & More",
    description: "Trà sữa Đài Loan thuần nguyên liệu, trân châu tươi nấu ngày, hơn 30 topping.",
    address: "66 Nguyễn Trãi, P. Nguyễn Cư Trinh, Q.1, TP.HCM",
    cover_url: IMG.shop_traSua,
    logo_url: IMG.logo_traSua,
    products: [
      { name: "Trà sữa trân châu đường đen", description: "Trà sữa Oolong Đài Loan, trân châu đường đen dẻo ngọt, thêm kem tươi tuỳ chọn.", cat: "Đồ uống & Trà sữa", image_url: IMG.traSuu_DD, variants: [{ name: "M (500ml)", price: 55000, stock: 150 }, { name: "L (700ml)", price: 65000, stock: 120 }] },
      { name: "Matcha Latte",                description: "Bột matcha Uji Nhật Bản hoà cùng sữa tươi và đá. Đắng nhẹ, ngọt thanh.",            cat: "Đồ uống & Trà sữa", image_url: IMG.matcha,    variants: [{ name: "M", price: 60000, stock: 120 }, { name: "L", price: 70000, stock: 100 }] },
      { name: "Hồng trà sữa",               description: "Hồng trà Ceylon pha sữa tươi, vị đậm nhẹ, topping linh hoạt.",                      cat: "Đồ uống & Trà sữa", image_url: IMG.hongTra,   variants: [{ name: "M", price: 45000, stock: 150 }, { name: "L", price: 55000, stock: 130 }] },
      { name: "Bánh tiramisu cốc",           description: "Tiramisu cốc cá nhân với mascarpone Ý, cà phê espresso, bột cacao rắc mặt.",        cat: "Tráng miệng & Bánh", image_url: IMG.tiramisu, variants: [{ name: "Cốc nhỏ", price: 45000, stock: 60 }, { name: "Cốc lớn", price: 65000, stock: 40 }] },
      { name: "Bánh crepe mochi",            description: "Crepe Nhật mỏng giòn cuộn nhân mochi đậu đỏ và kem tươi đánh bông.",               cat: "Tráng miệng & Bánh", image_url: IMG.crepe,    variants: [{ name: "1 cái", price: 35000, stock: 80 }, { name: "3 cái", price: 95000, stock: 50 }] },
    ],
  },

  /* ── SHOP 6: Cơm Văn Phòng ── */
  {
    name: "Cơm Văn Phòng — Ngon Mỗi Ngày",
    description: "Suất cơm văn phòng cân bằng dinh dưỡng, giao trước 11h30, bảo đảm nóng sốt.",
    address: "15 Tôn Thất Tùng, P. Phạm Ngũ Lão, Q.1, TP.HCM",
    cover_url: IMG.shop_comVP,
    logo_url: IMG.logo_comVP,
    products: [
      { name: "Suất cơm gà kho gừng",     description: "Cơm trắng + gà kho gừng + canh cải xanh + dưa leo muối. Đủ chất, gọn nhẹ.",   cat: "Cơm văn phòng", image_url: IMG.com_ga,    variants: [{ name: "1 suất", price: 38000, stock: 100 }, { name: "2 suất (tiết kiệm)", price: 72000, stock: 60 }] },
      { name: "Suất cơm thịt kho trứng",  description: "Thịt ba chỉ kho trứng cút, nước dừa thơm, cơm trắng + canh chua cá.",          cat: "Cơm văn phòng", image_url: IMG.com_thit,  variants: [{ name: "1 suất", price: 40000, stock: 90 }] },
      { name: "Suất cơm cá thu kho tiêu", description: "Cá thu tươi kho tiêu đậm, cơm trắng, rau luộc, canh rau ngót.",                cat: "Cơm văn phòng", image_url: IMG.com_ca,    variants: [{ name: "1 suất", price: 42000, stock: 80 }] },
      { name: "Nước ép cam tươi",          description: "Cam Valencia ép tươi mỗi ngày, không đường thêm, ngọt tự nhiên.",              cat: "Đồ uống & Trà sữa", image_url: IMG.nuocEpCam, variants: [{ name: "Ly 300ml", price: 30000, stock: 200 }] },
    ],
  },
];

const CATEGORIES_DATA = [
  { name: "Cơm" }, { name: "Phở & Bún" }, { name: "Đồ ăn nhanh" },
  { name: "Đồ uống & Trà sữa" }, { name: "Tráng miệng & Bánh" },
  { name: "Gà & BBQ" }, { name: "Cơm văn phòng" }, { name: "Salad & Healthy" },
];

/* ══════════════════════════════════════════════════════════
   SEED
══════════════════════════════════════════════════════════ */
async function seed() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected!\n");

  console.log("🧹 Clearing existing data...");
  await Promise.all([
    User.deleteMany({}), Shop.deleteMany({}), Category.deleteMany({}),
    Product.deleteMany({}), ProductVariant.deleteMany({}),
    Cart.deleteMany({}), CartItem.deleteMany({}),
    Order.deleteMany({}), ShopOrder.deleteMany({}), OrderItem.deleteMany({}),
    Shipment.deleteMany({}), Review.deleteMany({}),
  ]);
  console.log("✅ Cleared!\n");

  /* 1. USERS */
  console.log("👤 Creating users...");
  await User.create({ name: "Admin FoodGo", email: "admin@foodgo.vn", password_hash: hash("admin123"), role: "admin", phone: "0901000001", is_active: true });

  const sellers = await User.insertMany([
    { name: "Nguyễn Thành Nam", email: "seller1@foodgo.vn", password_hash: hash("seller123"), role: "seller", phone: "0901000010", is_active: true },
    { name: "Trần Thị Hương",   email: "seller2@foodgo.vn", password_hash: hash("seller123"), role: "seller", phone: "0901000011", is_active: true },
    { name: "Lê Văn Đức",       email: "seller3@foodgo.vn", password_hash: hash("seller123"), role: "seller", phone: "0901000012", is_active: true },
    { name: "Phạm Thị Lan",     email: "seller4@foodgo.vn", password_hash: hash("seller123"), role: "seller", phone: "0901000013", is_active: true },
    { name: "Võ Minh Tuấn",     email: "seller5@foodgo.vn", password_hash: hash("seller123"), role: "seller", phone: "0901000014", is_active: true },
    { name: "Ngô Thị Bích",     email: "seller6@foodgo.vn", password_hash: hash("seller123"), role: "seller", phone: "0901000015", is_active: true },
  ]);

  const buyers = await User.insertMany([
    { name: "Trần Minh Khoa", email: "buyer1@foodgo.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0901000020", is_active: true },
    { name: "Lê Thị Thu",     email: "buyer2@foodgo.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0901000021", is_active: true },
    { name: "Phạm Bảo Long",  email: "buyer3@foodgo.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0901000022", is_active: true },
    { name: "Nguyễn Hà Vy",   email: "buyer4@foodgo.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0901000023", is_active: true },
    { name: "Đỗ Quốc Huy",    email: "buyer5@foodgo.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0901000024", is_active: true },
  ]);

  const shippers = await User.insertMany([
    { name: "Nguyễn Tài Lộc", email: "shipper1@foodgo.vn", password_hash: hash("shipper123"), role: "shipper", phone: "0901000030", is_active: true },
    { name: "Trần Văn Bình",  email: "shipper2@foodgo.vn", password_hash: hash("shipper123"), role: "shipper", phone: "0901000031", is_active: true },
  ]);
  console.log(`   ✔ ${1 + sellers.length + buyers.length + shippers.length} users\n`);

  /* 2. CATEGORIES */
  console.log("🏷️  Creating categories...");
  const cats = await Category.insertMany(CATEGORIES_DATA);
  const catMap = {};
  cats.forEach((c) => { catMap[c.name] = c._id; });
  console.log(`   ✔ ${cats.length} categories\n`);

  /* 3. SHOPS + PRODUCTS + VARIANTS */
  console.log("🏪 Creating shops & products...");
  const allShops = [];
  const allVariants = []; // { variant, product, shop }

  for (let i = 0; i < SHOPS_RAW.length; i++) {
    const raw = SHOPS_RAW[i];
    const shop = await Shop.create({
      user_id: sellers[i]._id,
      name: raw.name,
      description: raw.description,
      address: raw.address,
      logo_url: raw.logo_url,
      cover_url: raw.cover_url,
      status: "approved",
      rating: 0, // sẽ được tính lại từ reviews
    });
    allShops.push(shop);

    for (const pRaw of raw.products) {
      const product = await Product.create({
        shop_id: shop._id,
        category_id: catMap[pRaw.cat],
        name: pRaw.name,
        description: pRaw.description,
        image_url: pRaw.image_url,
        is_active: true,
      });
      for (const vRaw of pRaw.variants) {
        const variant = await ProductVariant.create({
          product_id: product._id,
          name: vRaw.name, price: vRaw.price, stock: vRaw.stock,
          reserved_quantity: 0, is_active: true,
        });
        allVariants.push({ variant, product, shop });
      }
    }
    console.log(`   ✔ Shop "${raw.name}" (${raw.products.length} products)`);
  }

  /* 4. CARTS */
  console.log("\n🛒 Creating sample carts...");
  for (const buyer of buyers.slice(0, 3)) {
    const cart = await Cart.create({ user_id: buyer._id });
    for (const p of [pick(allVariants), pick(allVariants)]) {
      await CartItem.create({ cart_id: cart._id, variant_id: p.variant._id, shop_id: p.shop._id, quantity: rand(1, 3) });
    }
  }
  console.log("   ✔ 3 carts\n");

  /* 5. COMPLETED ORDERS + REVIEWS (tính lại rating sau) */
  console.log("📦 Creating completed orders...");
  const REVIEW_COMMENTS = [
    "Ngon lắm, lần sau sẽ đặt tiếp!", "Giao hàng nhanh, đồ ăn còn nóng sốt.",
    "Hương vị đúng như mô tả, rất hài lòng.", "Phần ăn vừa đủ, giá hợp lý.",
    "Tuyệt vời! Sẽ giới thiệu cho bạn bè.", "Đúng vị, thêm ít nước chấm là hoàn hảo.",
    "Giao đúng giờ, đóng gói cẩn thận.", "Sẽ ủng hộ thường xuyên!",
  ];

  const completedScenarios = [
    { buyer: buyers[0], shopIdx: 0, shipperIdx: 0, ratings: [5, 4] },
    { buyer: buyers[1], shopIdx: 1, shipperIdx: 1, ratings: [5, 5] },
    { buyer: buyers[2], shopIdx: 2, shipperIdx: 0, ratings: [4, 4] },
    { buyer: buyers[3], shopIdx: 3, shipperIdx: 1, ratings: [5, 5] },
    { buyer: buyers[4], shopIdx: 4, shipperIdx: 0, ratings: [4, 5] },
    { buyer: buyers[0], shopIdx: 5, shipperIdx: 1, ratings: [4, 4] },
  ];

  for (const sc of completedScenarios) {
    const shop = allShops[sc.shopIdx];
    const shopVariants = allVariants.filter((v) => v.shop._id.equals(shop._id));
    if (shopVariants.length < 2) continue;

    const items = [shopVariants[0], shopVariants[1 % shopVariants.length]];
    const qtys  = [rand(1, 2), rand(1, 2)];
    const subtotal = items.reduce((s, v, i) => s + v.variant.price * qtys[i], 0);

    const order = await Order.create({ user_id: sc.buyer._id, total_amount: subtotal + 15000, status: "PAID" });
    const shopOrder = await ShopOrder.create({ order_id: order._id, shop_id: shop._id, subtotal_amount: subtotal, shipping_fee: 15000, status: "COMPLETED" });

    const createdItems = [];
    for (let j = 0; j < items.length; j++) {
      const { variant, product } = items[j];
      const oi = await OrderItem.create({
        shop_order_id: shopOrder._id, variant_id: variant._id,
        product_name_snapshot: product.name, variant_name_snapshot: variant.name,
        quantity: qtys[j], price_at_order: variant.price,
      });
      createdItems.push(oi);
    }

    await Shipment.create({ shop_order_id: shopOrder._id, shipper_id: shippers[sc.shipperIdx]._id, status: "DELIVERED" });

    for (let j = 0; j < createdItems.length; j++) {
      await Review.create({
        order_item_id: createdItems[j]._id,
        user_id: sc.buyer._id,
        rating: sc.ratings[j] || 5,
        comment: pick(REVIEW_COMMENTS),
      });
    }
  }
  console.log(`   ✔ ${completedScenarios.length} completed orders (với reviews)\n`);

  /* 6. Tính lại shop.rating từ reviews thật */
  console.log("⭐ Calculating shop ratings from reviews...");
  for (const shop of allShops) {
    const products = await Product.find({ shop_id: shop._id }).select("_id").lean();
    const productIds = products.map((p) => p._id);
    const variants = await ProductVariant.find({ product_id: { $in: productIds } }).select("_id").lean();
    const variantIds = variants.map((v) => v._id);
    const orderItems = await OrderItem.find({ variant_id: { $in: variantIds } }).select("_id").lean();
    const orderItemIds = orderItems.map((oi) => oi._id);

    const agg = await Review.aggregate([
      { $match: { order_item_id: { $in: orderItemIds } } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const rating = agg[0] ? parseFloat(agg[0].avg.toFixed(1)) : 0;
    await Shop.findByIdAndUpdate(shop._id, { rating });
    console.log(`   ✔ "${shop.name}" → rating: ${rating}`);
  }

  /* 7. IN-PROGRESS ORDERS */
  console.log("\n⏳ Creating in-progress orders...");
  const progressScenarios = [
    { buyer: buyers[1], shopIdx: 0, soStatus: "CONFIRMED",          shipStatus: "ASSIGNED",          shipperIdx: 0 },
    { buyer: buyers[2], shopIdx: 2, soStatus: "PREPARING",          shipStatus: "UNASSIGNED",        shipperIdx: null },
    { buyer: buyers[3], shopIdx: 1, soStatus: "HANDED_TO_SHIPPER",  shipStatus: "HANDED_TO_SHIPPER", shipperIdx: 1 },
    { buyer: buyers[4], shopIdx: 3, soStatus: "DELIVERED",          shipStatus: "DELIVERED",         shipperIdx: 0 },
  ];
  for (const sc of progressScenarios) {
    const shop = allShops[sc.shopIdx];
    const sv = allVariants.filter((v) => v.shop._id.equals(shop._id));
    if (!sv.length) continue;
    const { variant, product } = pick(sv);
    const qty = rand(1, 2);
    const order = await Order.create({ user_id: sc.buyer._id, total_amount: variant.price * qty + 15000, status: "PAID" });
    const shopOrder = await ShopOrder.create({ order_id: order._id, shop_id: shop._id, subtotal_amount: variant.price * qty, shipping_fee: 15000, status: sc.soStatus });
    await OrderItem.create({ shop_order_id: shopOrder._id, variant_id: variant._id, product_name_snapshot: product.name, variant_name_snapshot: variant.name, quantity: qty, price_at_order: variant.price });
    await Shipment.create({ shop_order_id: shopOrder._id, shipper_id: sc.shipperIdx !== null ? shippers[sc.shipperIdx]._id : null, status: sc.shipStatus });
  }
  console.log(`   ✔ ${progressScenarios.length} in-progress orders\n`);

  /* 8. PENDING PAYMENT */
  console.log("💳 Creating pending payment orders...");
  for (const buyer of [buyers[0], buyers[2]]) {
    const { variant } = pick(allVariants);
    await Order.create({ user_id: buyer._id, total_amount: variant.price * 2 + 15000, status: "PENDING_PAYMENT" });
  }
  console.log("   ✔ 2 pending orders\n");

  /* DONE */
  const totalProducts = SHOPS_RAW.reduce((s, r) => s + r.products.length, 0);
  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ SEED HOÀN TẤT!\n");
  console.log("📋 TÀI KHOẢN MẪU:");
  console.log("  admin@foodgo.vn    / admin123");
  console.log("  seller1-6@foodgo.vn / seller123");
  console.log("  buyer1-5@foodgo.vn  / buyer123");
  console.log("  shipper1-2@foodgo.vn / shipper123");
  console.log("─────────────────────────────────────────");
  console.log("📊 DỮ LIỆU:");
  console.log(`  • ${6 + sellers.length + buyers.length + shippers.length} users`);
  console.log(`  • ${cats.length} categories`);
  console.log(`  • ${allShops.length} shops (approved, có hình ảnh, rating tính từ reviews)`);
  console.log(`  • ${totalProducts} products (có hình ảnh Unsplash)`);
  console.log(`  • ${allVariants.length} variants`);
  console.log(`  • ${completedScenarios.length} completed orders (có reviews + shipments)`);
  console.log(`  • ${progressScenarios.length} in-progress orders`);
  console.log(`  • 2 pending payment orders`);
  console.log("═══════════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ SEED FAILED:", err);
  mongoose.disconnect();
  process.exit(1);
});
