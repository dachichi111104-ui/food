const { Product, ProductVariant, Shop, OrderItem, ShopOrder, Review } = require("../models");
const ApiError = require("../utils/ApiError");

const createProduct = async (shopId, data) => {
  const variants =
    typeof data.variants === "string" ? JSON.parse(data.variants) : data.variants;

  const product = await Product.create({
    shop_id: shopId,
    category_id: data.category_id,
    name: data.name,
    description: data.description,
    image_url: data.image_url,
  });

  const variantDocs = await ProductVariant.insertMany(
    variants.map((v) => ({
      product_id: product._id,
      name: v.name,
      price: v.price,
      stock: v.stock,
      reserved_quantity: 0,
    }))
  );

  return { product, variants: variantDocs };
};

const updateProduct = async (shopId, productId, data) => {
  const product = await Product.findOne({ _id: productId, shop_id: shopId });
  if (!product) {
    throw new ApiError(404, "Product not found or not owned by your shop");
  }

  if (data.name) product.name = data.name;
  if (data.description !== undefined) product.description = data.description;
  if (data.category_id) product.category_id = data.category_id;
  if (data.image_url) product.image_url = data.image_url;
  if (data.is_active !== undefined) product.is_active = data.is_active;

  await product.save();
  return product;
};

const deleteProduct = async (shopId, productId) => {
  const product = await Product.findOne({ _id: productId, shop_id: shopId });
  if (!product) {
    throw new ApiError(404, "Product not found or not owned by your shop");
  }
  // Soft delete: chỉ ẩn đi, không xoá cứng để giữ toàn vẹn dữ liệu Order cũ
  product.is_active = false;
  await product.save();
  return product;
};

const getMyShopProducts = async (shopId) => {
  const products = await Product.find({ shop_id: shopId }).sort({ createdAt: -1 });
  const productIds = products.map((p) => p._id);
  const variants = await ProductVariant.find({ product_id: { $in: productIds } });

  return products.map((p) => ({
    ...p.toObject(),
    variants: variants.filter((v) => v.product_id.toString() === p._id.toString()),
  }));
};

/**
 * Helper: tính order_count và average_rating cho danh sách products
 * Chỉ tính từ đơn COMPLETED (đã giao xong).
 */
const enrichProducts = async (products) => {
  if (!products.length) return products;

  const productIds = products.map((p) => p._id || p.id);

  // 1. Lấy tất cả variant thuộc các product này
  const variants = await ProductVariant.find({ product_id: { $in: productIds } })
    .select("_id product_id").lean();
  const variantIds = variants.map((v) => v._id);

  // Map: variantId (string) -> productId (string)
  const variantToProduct = {};
  variants.forEach((v) => { variantToProduct[v._id.toString()] = v.product_id.toString(); });

  // 2. ShopOrder đã COMPLETED
  const completedSoIds = (
    await ShopOrder.find({ status: "COMPLETED" }).select("_id").lean()
  ).map((so) => so._id);

  // 3. OrderItems của các variant này trong đơn COMPLETED
  const orderItems = await OrderItem.find({
    variant_id: { $in: variantIds },
    shop_order_id: { $in: completedSoIds },
  }).select("_id variant_id quantity").lean();

  // 4. order_count: tổng quantity bán được (COMPLETED) theo product
  const orderCountMap = {};
  orderItems.forEach((oi) => {
    const pId = variantToProduct[oi.variant_id.toString()];
    if (pId) orderCountMap[pId] = (orderCountMap[pId] || 0) + oi.quantity;
  });

  // 5. Rating: lấy reviews của tất cả orderItems, group theo productId
  const orderItemIds = orderItems.map((oi) => oi._id);
  const reviews = await Review.find({ order_item_id: { $in: orderItemIds } })
    .select("order_item_id rating").lean();

  // Map orderItemId -> productId
  const oiToProduct = {};
  orderItems.forEach((oi) => {
    oiToProduct[oi._id.toString()] = variantToProduct[oi.variant_id.toString()];
  });

  const ratingByProduct = {}; // productId -> { sum, count }
  reviews.forEach((r) => {
    const pId = oiToProduct[r.order_item_id.toString()];
    if (!pId) return;
    if (!ratingByProduct[pId]) ratingByProduct[pId] = { sum: 0, count: 0 };
    ratingByProduct[pId].sum += r.rating;
    ratingByProduct[pId].count += 1;
  });

  return products.map((p) => {
    const pId = (p._id || p.id).toString();
    const rEntry = ratingByProduct[pId];
    return {
      ...p,
      order_count: orderCountMap[pId] || 0,
      average_rating: rEntry ? parseFloat((rEntry.sum / rEntry.count).toFixed(1)) : null,
    };
  });
};


// Public: chỉ sản phẩm active thuộc shop đã approved
const listPublicProducts = async ({ shop_id, category_id, search, page = 1, limit = 20 }) => {
  const filter = { is_active: true };
  if (shop_id) filter.shop_id = shop_id;
  if (category_id) filter.category_id = category_id;
  if (search) filter.name = { $regex: search, $options: "i" };

  let approvedShopIds = null;
  if (!shop_id) {
    const approvedShops = await Shop.find({ status: "approved" }).select("_id");
    approvedShopIds = approvedShops.map((s) => s._id);
    filter.shop_id = { $in: approvedShopIds };
  } else {
    const shop = await Shop.findOne({ _id: shop_id, status: "approved" });
    if (!shop) throw new ApiError(404, "Shop not found");
  }

  const products = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const productIds = products.map((p) => p._id);
  const variants = await ProductVariant.find({
    product_id: { $in: productIds },
    is_active: true,
  });

  const total = await Product.countDocuments(filter);

  const rawProducts = products.map((p) => ({
    ...p.toObject(),
    variants: variants.filter((v) => v.product_id.toString() === p._id.toString()),
  }));

  const enriched = await enrichProducts(rawProducts);

  return {
    products: enriched,
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

const getPublicProductDetail = async (productId) => {
  const product = await Product.findOne({ _id: productId, is_active: true });
  if (!product) throw new ApiError(404, "Product not found");

  const shop = await Shop.findOne({ _id: product.shop_id, status: "approved" });
  if (!shop) throw new ApiError(404, "Product not found");

  const variants = await ProductVariant.find({
    product_id: product._id,
    is_active: true,
  });

  const enriched = await enrichProducts([product.toObject()]);

  return { product: enriched[0], shop, variants };
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getMyShopProducts,
  listPublicProducts,
  getPublicProductDetail,
};