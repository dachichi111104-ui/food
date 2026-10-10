/**
 * FoodGo — Database Seed Script
 * ==============================
 * Chạy: node seed.js
 *
 * Bộ dữ liệu chuẩn 100% với 100 ảnh thật lấy từ thư mục người dùng:
 *   - 1 admin, 10 sellers, 5 buyers (theo yêu cầu), 2 shippers
 *   - 10 categories (có danh mục cha/con)
 *   - 10 shops với ảnh logo & cover lấy từ ảnh thật
 *   - 100 products với 100 ảnh món ăn thật tương ứng 100%
 *   - 200 productvariants (mỗi món 2 biến thể)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const {
  User, Shop, Category, Product, ProductVariant,
  Order, ShopOrder, OrderItem, Shipment, Review, Cart, CartItem, Banner,
} = require("./models");

const hash = (pw) => bcrypt.hashSync(pw, 10);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const categoryDefinitions = [
  { name: "Món Việt", parent: null },
  { name: "Cơm", parent: "Món Việt" },
  { name: "Món nước", parent: "Món Việt" },
  { name: "Bánh mì", parent: "Món Việt" },
  { name: "Đồ ăn vặt", parent: null },
  { name: "Món nướng", parent: null },
  { name: "Hải sản", parent: null },
  { name: "Dim sum", parent: null },
  { name: "Đồ uống", parent: null },
  { name: "Món ăn kèm", parent: null }
];

const shopDefinitions = [
  {
    name: "Cơm Tấm Sài Gòn",
    description: "Cơm tấm với sườn nướng, bì, chả và nước mắm đặc mắm truyền thống.",
    district: "Phú Nhuận",
    ward: "Phường 10",
    street: "Đặng Văn Ngữ",
    house_number: "84",
    cover: "/images/food/comtamdacbiet.jpg",
    logo: "/images/food/comtamsuon.jpg",
    menu: [
      ["Cơm tấm sườn nướng", "Cơm", 45000, "/images/food/comtamsuon.jpg"],
      ["Cơm tấm sườn bì", "Cơm", 50000, "/images/food/comtamsuonbi.jpg"],
      ["Cơm tấm sườn chả", "Cơm", 50000, "/images/food/comtamsuoncha.jpg"],
      ["Cơm tấm ba rọi nướng", "Cơm", 55000, "/images/food/comtambaroinuong.jpg"],
      ["Cơm tấm đùi gà nướng", "Cơm", 55000, "/images/food/comtamduiga.jpg"],
      ["Cơm tấm bì chả", "Cơm", 40000, "/images/food/comtambicha.jpg"],
      ["Cơm tấm trứng ốp la", "Cơm", 35000, "/images/food/comtamtrungopla.jpg"],
      ["Cơm tấm sườn trứng", "Cơm", 50000, "/images/food/comtamsuontrung.jpg"],
      ["Cơm tấm đặc biệt", "Cơm", 65000, "/images/food/comtamdacbiet.jpg"],
      ["Canh rong biển", "Món ăn kèm", 15000, "/images/food/canhrongbien.jpg"]
    ]
  },
  {
    name: "Phở Bò Gia Truyền",
    description: "Phở bò với nước dùng thơm, phục vụ ăn sáng và cả ngày.",
    district: "Quận 1",
    ward: "Phường Bến Thành",
    street: "Lê Thánh Tôn",
    house_number: "120",
    cover: "/images/food/phodacbiet.jpg",
    logo: "/images/food/phobotai.jpg",
    menu: [
      ["Phở bò tái", "Món nước", 55000, "/images/food/phobotai.jpg"],
      ["Phở bò chín", "Món nước", 55000, "/images/food/phobochin.jpg"],
      ["Phở tái nạm", "Món nước", 60000, "/images/food/photainam.jpg"],
      ["Phở bò viên", "Món nước", 50000, "/images/food/phobovien.jpg"],
      ["Phở gầu bò", "Món nước", 60000, "/images/food/phogaubo.jpg"],
      ["Phở đặc biệt", "Món nước", 75000, "/images/food/phodacbiet.jpg"],
      ["Phở gà", "Món nước", 50000, "/images/food/phoga.jpg"],
      ["Phở sốt vang", "Món nước", 65000, "/images/food/phosotvang.jpg"],
      ["Quẩy nóng", "Món ăn kèm", 10000, "/images/food/quaynong.jpg"],
      ["Trứng chần", "Món ăn kèm", 10000, "/images/food/trungchan.jpg"]
    ]
  },
  {
    name: "Bún Bò Huế Cố Đô",
    description: "Bún bò đậm vị sả, ăn kèm rau sống và sa tế.",
    district: "Bình Thạnh",
    ward: "Phường 25",
    street: "Xô Viết Nghệ Tĩnh",
    house_number: "210",
    cover: "/images/food/bunbodacbiet.jpg",
    logo: "/images/food/bunbotai.jpg",
    menu: [
      ["Bún bò tái", "Món nước", 45000, "/images/food/bunbotai.jpg"],
      ["Bún bò nạm", "Món nước", 45000, "/images/food/bunbonam.jpg"],
      ["Bún bò giò heo", "Món nước", 55000, "/images/food/bunbogioheo.jpg"],
      ["Bún bò chả cua", "Món nước", 55000, "/images/food/bunbochacua.jpg"],
      ["Bún bò đặc biệt", "Món nước", 65000, "/images/food/bunbodacbiet.jpg"],
      ["Bún bò gân", "Món nước", 50000, "/images/food/bunbogan.jpg"],
      ["Bún bò thập cẩm", "Món nước", 60000, "/images/food/bunbothapcam.jpg"],
      ["Bún bò chả lụa", "Món nước", 45000, "/images/food/bunbochalua.jpg"],
      ["Bún thêm", "Món ăn kèm", 10000, "/images/food/bunthem.jpg"],
      ["Chả cua thêm", "Món ăn kèm", 15000, "/images/food/chacuathem.jpg"]
    ]
  },
  {
    name: "Bánh Mì Góc Phố",
    description: "Bánh mì giòn với nhiều loại nhân và rau ăn kèm.",
    district: "Quận 3",
    ward: "Phường 7",
    street: "Cách Mạng Tháng Tám",
    house_number: "180",
    cover: "/images/food/banhmidacbiet.jpg",
    logo: "/images/food/banhmithitnguoi.jpg",
    menu: [
      ["Bánh mì thịt nguội", "Bánh mì", 25000, "/images/food/banhmithitnguoi.jpg"],
      ["Bánh mì xíu mại", "Bánh mì", 30000, "/images/food/banhmixiumai.jpg"],
      ["Bánh mì gà xé", "Bánh mì", 30000, "/images/food/banhmigaxe.jpg"],
      ["Bánh mì bò nướng", "Bánh mì", 35000, "/images/food/banhmibonuong.jpg"],
      ["Bánh mì chả cá", "Bánh mì", 30000, "/images/food/banhmichaca.jpg"],
      ["Bánh mì trứng", "Bánh mì", 20000, "/images/food/banhmitrung.jpg"],
      ["Bánh mì pate", "Bánh mì", 20000, "/images/food/banhmipate.jpg"],
      ["Bánh mì heo quay", "Bánh mì", 35000, "/images/food/banhmiheoquay.jpg"],
      ["Bánh mì đặc biệt", "Bánh mì", 40000, "/images/food/banhmidacbiet.jpg"],
      ["Bánh mì chay", "Bánh mì", 25000, "/images/food/banhmichay.jpg"]
    ]
  },
  {
    name: "Hủ Tiếu Nam Vang",
    description: "Hủ tiếu với tôm, thịt, trứng cút và nước dùng thanh.",
    district: "Quận 10",
    ward: "Phường 12",
    street: "Sư Vạn Hạnh",
    house_number: "358",
    cover: "/images/food/hutieuthapcam.jpg",
    logo: "/images/food/hutieunamvangnuoc.jpg",
    menu: [
      ["Hủ tiếu Nam Vang nước", "Món nước", 45000, "/images/food/hutieunamvangnuoc.jpg"],
      ["Hủ tiếu Nam Vang khô", "Món nước", 50000, "/images/food/hutieunamvangkho.jpg"],
      ["Hủ tiếu sườn", "Món nước", 45000, "/images/food/hutieusuon.jpg"],
      ["Hủ tiếu tôm thịt", "Món nước", 50000, "/images/food/hutieutomthit.jpg"],
      ["Hủ tiếu xương", "Món nước", 40000, "/images/food/hutieuxuong.jpg"],
      ["Hủ tiếu bò viên", "Món nước", 40000, "/images/food/hutieubovien.jpg"],
      ["Hủ tiếu thập cẩm", "Món nước", 60000, "/images/food/hutieuthapcam.jpg"],
      ["Hủ tiếu hải sản", "Món nước", 60000, "/images/food/hutieuhaisan.jpg"],
      ["Mì khô xá xíu", "Món nước", 45000, "/images/food/mikhoxaxiu.jpg"],
      ["Trứng cút thêm", "Món ăn kèm", 10000, "/images/food/trungcutthem.jpg"]
    ]
  },
  {
    name: "Ăn Vặt Nhà Gạo",
    description: "Đồ ăn vặt phù hợp cho học sinh, sinh viên và nhóm bạn.",
    district: "Tân Bình",
    ward: "Phường 4",
    street: "Bàu Cát",
    house_number: "25",
    cover: "/images/food/hamburger.jpg",
    logo: "/images/food/banhtrangtron.jpg",
    menu: [
      ["Hamburger All-Star Bò Nướng", "Đồ ăn vặt", 79000, "/images/food/hamburger.jpg"],
      ["Khoai tây chiên", "Đồ ăn vặt", 30000, "/images/food/khoaitaychien.jpg"],
      ["Cá viên chiên", "Đồ ăn vặt", 25000, "/images/food/cavienchien.jpg"],
      ["Phô mai que", "Đồ ăn vặt", 30000, "/images/food/phomaique.jpg"],
      ["Gà viên chiên", "Đồ ăn vặt", 35000, "/images/food/gavienchien.jpg"],
      ["Bánh tráng trộn", "Đồ ăn vặt", 25000, "/images/food/banhtrangtron.jpg"],
      ["Bánh tráng cuốn", "Đồ ăn vặt", 30000, "/images/food/banhtrangcuon.jpg"],
      ["Xúc xích chiên", "Đồ ăn vặt", 20000, "/images/food/xucxichchien.jpg"],
      ["Tokbokki", "Đồ ăn vặt", 40000, "/images/food/tokbokki.jpg"],
      ["Chân gà sốt Thái", "Đồ ăn vặt", 45000, "/images/food/changasotthai.jpg"]
    ]
  },
  {
    name: "Cơm Niêu Quê Nhà",
    description: "Cơm niêu nóng ăn kèm món kho và món xào kiểu Việt.",
    district: "Gò Vấp",
    ward: "Phường 10",
    street: "Quang Trung",
    house_number: "320",
    cover: "/images/food/comnieubosottieuden.jpg",
    logo: "/images/food/comnieucakhoto.jpg",
    menu: [
      ["Cơm niêu cá kho tộ", "Cơm", 65000, "/images/food/comnieucakhoto.jpg"],
      ["Cơm niêu thịt kho trứng", "Cơm", 60000, "/images/food/comnieuthitkhotrung.jpg"],
      ["Cơm niêu gà sốt nấm", "Cơm", 65000, "/images/food/comnieugasotnam.jpg"],
      ["Cơm niêu bò tiêu đen", "Cơm", 70000, "/images/food/comnieubosottieuden.jpg"],
      ["Cơm niêu cá thu sốt cà", "Cơm", 65000, "/images/food/comnieucathusotca.jpg"],
      ["Cơm niêu sườn ram", "Cơm", 60000, "/images/food/comnieusuonram.jpg"],
      ["Cơm niêu tôm rim", "Cơm", 70000, "/images/food/comnieutomrim.jpg"],
      ["Cơm niêu đậu hũ sốt nấm", "Cơm", 50000, "/images/food/comnieudauhusotnam.jpg"],
      ["Rau muống xào tỏi", "Món ăn kèm", 30000, "/images/food/raumuongxaotoi.jpg"],
      ["Canh chua cá", "Món ăn kèm", 40000, "/images/food/canhchuaca.jpg"]
    ]
  },
  {
    name: "BBQ Phố Đêm",
    description: "Thịt nướng và món ăn kèm cho các buổi tụ họp.",
    district: "Quận 7",
    ward: "Phường Tân Phong",
    street: "Nguyễn Thị Thập",
    house_number: "88",
    cover: "/images/food/suongheonuongbbq.jpg",
    logo: "/images/food/bachibonuong.jpg",
    menu: [
      ["Ba chỉ bò nướng", "Món nướng", 89000, "/images/food/bachibonuong.jpg"],
      ["Ba chỉ heo nướng", "Món nướng", 79000, "/images/food/bachiheonuong.jpg"],
      ["Sườn heo nướng BBQ", "Món nướng", 99000, "/images/food/suongheonuongbbq.jpg"],
      ["Gà nướng mật ong", "Món nướng", 85000, "/images/food/ganuongmatong.jpg"],
      ["Bạch tuộc nướng", "Món nướng", 109000, "/images/food/bachtuocnuong.jpg"],
      ["Tôm nướng muối ớt", "Món nướng", 99000, "/images/food/tomnuongmuoiot.jpg"],
      ["Nấm nướng bơ", "Món nướng", 45000, "/images/food/namnuongbo.jpg"],
      ["Bắp nướng mỡ hành", "Món nướng", 25000, "/images/food/bapnuongmohanh.jpg"],
      ["Cơm chiên kim chi", "Cơm", 55000, "/images/food/comchienkimchi.jpg"],
      ["Salad rau củ", "Món ăn kèm", 40000, "/images/food/saladraucu.jpg"]
    ]
  },
  {
    name: "Hải Sản Biển Xanh",
    description: "Các món hải sản hấp, nướng và xào.",
    district: "TP. Thủ Đức",
    ward: "Phường An Phú",
    street: "Song Hành",
    house_number: "50",
    cover: "/images/food/lauhaisan.jpg",
    logo: "/images/food/cuarangme.jpg",
    menu: [
      ["Tôm sú hấp", "Hải sản", 150000, "/images/food/tomsuhap.jpg"],
      ["Mực nướng sa tế", "Hải sản", 120000, "/images/food/mucnuongsate.jpg"],
      ["Nghêu hấp sả", "Hải sản", 80000, "/images/food/ngheuhapsa.jpg"],
      ["Sò điệp nướng mỡ hành", "Hải sản", 130000, "/images/food/sodiepnuongmohanh.jpg"],
      ["Cua rang me", "Hải sản", 220000, "/images/food/cuarangme.jpg"],
      ["Ốc hương rang muối", "Hải sản", 160000, "/images/food/ochuongrangmuoi.jpg"],
      ["Bạch tuộc xào cay", "Hải sản", 120000, "/images/food/bachtuocxaocay.jpg"],
      ["Cá nướng muối ớt", "Hải sản", 180000, "/images/food/canuongmuoiot.jpg"],
      ["Tôm rang bơ tỏi", "Hải sản", 140000, "/images/food/tomrangbotoi.jpg"],
      ["Lẩu hải sản", "Hải sản", 250000, "/images/food/lauhaisan.jpg"]
    ]
  },
  {
    name: "Dim Sum Hồng Kông",
    description: "Các món dim sum hấp, chiên theo phong cách Quảng Đông.",
    district: "Quận 5",
    ward: "Phường 11",
    street: "Nguyễn Trãi",
    house_number: "650",
    cover: "/images/food/hacaosodiep.jpg",
    logo: "/images/food/hacaotom.jpg",
    menu: [
      ["Há cảo tôm", "Dim sum", 45000, "/images/food/hacaotom.jpg"],
      ["Xíu mại tôm thịt", "Dim sum", 40000, "/images/food/xiumaitomthit.jpg"],
      ["Bánh bao xá xíu", "Dim sum", 35000, "/images/food/banhbaoxaxiu.jpg"],
      ["Bánh cuốn tôm", "Dim sum", 50000, "/images/food/banhcuontom.jpg"],
      ["Chân gà tàu xì", "Dim sum", 45000, "/images/food/changatauxi.jpg"],
      ["Sườn hấp tàu xì", "Dim sum", 50000, "/images/food/suonhaptauxi.jpg"],
      ["Bánh bao kim sa", "Dim sum", 40000, "/images/food/banhbaokimsa.jpg"],
      ["Há cảo sò điệp", "Dim sum", 55000, "/images/food/hacaosodiep.jpg"],
      ["Bánh củ cải chiên", "Dim sum", 35000, "/images/food/banhcucaichien.jpg"],
      ["Xíu mại trứng cua", "Dim sum", 50000, "/images/food/xiumaitrungcua.jpg"]
    ]
  }
];

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
    Shipment.deleteMany({}), Review.deleteMany({}), Banner.deleteMany({})
  ]);
  console.log("✅ Cleared!\n");

  /* 1. USERS */
  console.log("👤 Creating users...");
  await User.create({
    name: "Admin FoodGo",
    email: "admin@foodgo.vn",
    password_hash: hash("admin123"),
    role: "admin",
    phone: "0901000001",
    is_active: true
  });

  // 10 Sellers
  const sellerDocs = shopDefinitions.map((s, i) => ({
    name: `Chủ Quán ${s.name}`,
    email: `seller${i + 1}@foodgo.vn`,
    password_hash: hash("seller123"),
    role: "seller",
    phone: `09010000${10 + i}`,
    is_active: true
  }));
  const sellers = await User.insertMany(sellerDocs);

  // 5 Specific Buyers requested by User
  const buyerDocs = [
    { name: "Lê Ngọc Trinh", email: "2431540114@vaa.edu.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0938379346", is_active: true },
    { name: "Nguyễn Doãn Ngọc Hân", email: "2431540093@vaa.edu.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0984323432", is_active: true },
    { name: "Phạm Thị Thanh Trúc", email: "2431540102@vaa.edu.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0989484083", is_active: true },
    { name: "Trần Đàm Gia Nghi", email: "2431540080@vaa.edu.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0776985586", is_active: true },
    { name: "Nguyễn Nhật Hoàng", email: "2154810019@vaa.edu.vn", password_hash: hash("buyer123"), role: "buyer", phone: "0909090909", is_active: true }
  ];
  const buyers = await User.insertMany(buyerDocs);

  // 2 Shippers
  const shippers = await User.insertMany([
    { name: "Nguyễn Tài Lộc", email: "shipper1@foodgo.vn", password_hash: hash("shipper123"), role: "shipper", phone: "0901000030", is_active: true },
    { name: "Trần Văn Bình", email: "shipper2@foodgo.vn", password_hash: hash("shipper123"), role: "shipper", phone: "0901000031", is_active: true }
  ]);
  console.log(`   ✔ Created ${1 + sellers.length + buyers.length + shippers.length} users\n`);

  /* 2. CATEGORIES */
  console.log("🏷️  Creating 10 categories...");
  const categoryIds = {};
  categoryDefinitions.forEach(c => {
    categoryIds[c.name] = new mongoose.Types.ObjectId();
  });

  const categoriesToInsert = categoryDefinitions.map(c => ({
    _id: categoryIds[c.name],
    name: c.name,
    parent_id: c.parent ? categoryIds[c.parent] : null
  }));
  await Category.insertMany(categoriesToInsert);
  console.log("   ✔ 10 categories created\n");

  /* 3. SHOPS, PRODUCTS, VARIANTS WITH REAL USER IMAGES */
  console.log("🏪 Creating 10 shops, 100 products & 200 variants (with REAL food images)...");
  const createdShops = [];
  const createdProducts = [];
  const createdVariants = [];

  for (let i = 0; i < shopDefinitions.length; i++) {
    const s = shopDefinitions[i];
    const shopDoc = await Shop.create({
      user_id: sellers[i]._id,
      name: s.name,
      description: s.description,
      address: `${s.house_number} ${s.street}, ${s.ward}, ${s.district}, TP. Hồ Chí Minh`,
      city: "TP. Hồ Chí Minh",
      district: s.district,
      ward: s.ward,
      street: s.street,
      house_number: s.house_number,
      logo_url: s.logo,
      cover_url: s.cover,
      status: "approved",
      rating: Number((4.2 + (i % 8) * 0.1).toFixed(1))
    });
    createdShops.push(shopDoc);

    for (let j = 0; j < s.menu.length; j++) {
      const [name, categoryName, basePrice, imgPath] = s.menu[j];
      const productDoc = await Product.create({
        shop_id: shopDoc._id,
        category_id: categoryIds[categoryName],
        name,
        description: `${name} chuẩn vị tươi ngon, chế biến nóng hổi trong ngày.`,
        image_url: imgPath,
        is_active: true
      });
      createdProducts.push(productDoc);

      // 2 Variants per Product
      const variant1 = await ProductVariant.create({
        product_id: productDoc._id,
        name: "Phần thường",
        price: basePrice,
        stock: 100,
        reserved_quantity: 0,
        is_active: true
      });

      const variant2 = await ProductVariant.create({
        product_id: productDoc._id,
        name: "Phần lớn",
        price: Math.round((basePrice * 1.3) / 1000) * 1000,
        stock: 100,
        reserved_quantity: 0,
        is_active: true
      });

      createdVariants.push(variant1, variant2);
    }
  }
  console.log(`   ✔ ${createdShops.length} shops with real logos & covers`);
  console.log(`   ✔ ${createdProducts.length} products with 100 REAL food images`);
  console.log(`   ✔ ${createdVariants.length} product variants\n`);

  /* 4. SAMPLE CARTS & ORDERS */
  console.log("🛒 Creating sample carts and completed orders...");
  for (const buyer of buyers) {
    const cart = await Cart.create({ user_id: buyer._id });
    const p1 = pick(createdVariants);
    await CartItem.create({ cart_id: cart._id, variant_id: p1._id, quantity: rand(1, 2) });
  }

  // Create 5 completed orders
  for (let i = 0; i < 5; i++) {
    const buyer = buyers[i];
    const shop = createdShops[i];
    const shopVariant = createdVariants.find(v => v.price > 0);
    const order = await Order.create({ user_id: buyer._id, total_amount: shopVariant.price + 15000, status: "PAID" });
    const shopOrder = await ShopOrder.create({ order_id: order._id, shop_id: shop._id, subtotal_amount: shopVariant.price, shipping_fee: 15000, status: "COMPLETED" });
    const orderItem = await OrderItem.create({
      shop_order_id: shopOrder._id,
      variant_id: shopVariant._id,
      product_name_snapshot: "Món ăn mẫu",
      variant_name_snapshot: shopVariant.name,
      quantity: 1,
      price_at_order: shopVariant.price
    });
    await Shipment.create({ shop_order_id: shopOrder._id, shipper_id: shippers[i % 2]._id, status: "DELIVERED" });
    await Review.create({ order_item_id: orderItem._id, user_id: buyer._id, rating: 5, comment: "Món ăn rất ngon, giao hàng siêu nhanh!" });
  }
  console.log("   ✔ Sample orders & reviews created\n");

  /* 5. BANNERS */
  console.log("🖼️  Creating banners...");
  await Banner.create([
    {
      title: "Cơm Tấm Sài Gòn Đậm Vị",
      description: "Thưởng thức cơm tấm sườn nướng mật ong thơm lừng.",
      image_url: "/images/food/comtamdacbiet.jpg",
      target_url: `/shops/${createdShops[0]._id}`,
      is_active: true,
      priority: 10
    },
    {
      title: "Phở Bò Gia Truyền Hà Nội",
      description: "Nước dùng hầm xương 12 tiếng ngọt thanh tự nhiên.",
      image_url: "/images/food/phodacbiet.jpg",
      target_url: `/shops/${createdShops[1]._id}`,
      is_active: true,
      priority: 5
    }
  ]);
  console.log("   ✔ Banners created\n");

  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ SEED HOÀN TẤT THÀNH CÔNG VỚI 100 ẢNH THẬT!");
  console.log("📊 KẾT QUẢ DATABASE:");
  console.log(`  • Shops: ${await Shop.countDocuments()}`);
  console.log(`  • Categories: ${await Category.countDocuments()}`);
  console.log(`  • Products: ${await Product.countDocuments()} (100% ảnh thật từ folder của bạn)`);
  console.log(`  • Product Variants: ${await ProductVariant.countDocuments()}`);
  console.log(`  • Users: ${await User.countDocuments()}`);
  console.log("═══════════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ SEED FAILED:", err);
  mongoose.disconnect();
  process.exit(1);
});
