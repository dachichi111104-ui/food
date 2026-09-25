const { Cart, CartItem, ProductVariant, Product, Shop } = require("../models");
const ApiError = require("../utils/ApiError");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }
  return cart;
};

const addItem = async (userId, { variant_id, quantity }) => {
  const variant = await ProductVariant.findOne({ _id: variant_id, is_active: true });
  if (!variant) {
    throw new ApiError(404, "Product variant not found");
  }

  const cart = await getOrCreateCart(userId);

  const existing = await CartItem.findOne({ cart_id: cart._id, variant_id });
  if (existing) {
    existing.quantity += quantity;
    await existing.save();
    return existing;
  }

  const item = await CartItem.create({
    cart_id: cart._id,
    variant_id,
    quantity,
  });
  return item;
};

const updateItem = async (userId, itemId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const item = await CartItem.findOne({ _id: itemId, cart_id: cart._id });
  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }
  item.quantity = quantity;
  await item.save();
  return item;
};

const removeItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  const item = await CartItem.findOneAndDelete({ _id: itemId, cart_id: cart._id });
  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }
  return item;
};

/**
 * Trả về giỏ hàng đầy đủ, kèm thông tin sản phẩm/shop, đã tính subtotal.
 * Không nhóm theo shop - dùng cho trang giỏ hàng.
 */
const getCartDetail = async (userId) => {
  const cart = await getOrCreateCart(userId);
  const items = await CartItem.find({ cart_id: cart._id });

  const variantIds = items.map((i) => i.variant_id);
  const variants = await ProductVariant.find({ _id: { $in: variantIds } });

  const productIds = variants.map((v) => v.product_id);
  const products = await Product.find({ _id: { $in: productIds } });

  const shopIds = products.map((p) => p.shop_id);
  const shops = await Shop.find({ _id: { $in: shopIds } });

  const enrichedItems = items.map((item) => {
    const variant = variants.find((v) => v._id.toString() === item.variant_id.toString());
    const product = variant
      ? products.find((p) => p._id.toString() === variant.product_id.toString())
      : null;
    const shop = product
      ? shops.find((s) => s._id.toString() === product.shop_id.toString())
      : null;

    return {
      item_id: item._id,
      quantity: item.quantity,
      variant: variant
        ? { id: variant._id, name: variant.name, price: variant.price, available: variant.stock - variant.reserved_quantity }
        : null,
      product: product ? { id: product._id, name: product.name, image_url: product.image_url } : null,
      shop: shop ? { id: shop._id, _id: shop._id, name: shop.name } : null,
      line_total: variant ? variant.price * item.quantity : 0,
    };
  });

  return {
    cart_id: cart._id,
    items: enrichedItems,
    total_items: enrichedItems.length,
    total_amount: enrichedItems.reduce((sum, i) => sum + i.line_total, 0),
  };
};

/**
 * CỐT LÕI MULTI-VENDOR: nhóm cart items theo shop_id.
 * Dùng chung cho cả "preview checkout" (Phase 4) và "checkout thật" (Phase 5).
 * Trả về mảng group, mỗi group tương ứng với 1 ShopOrder sẽ được tạo.
 */
const getCartGroupedByShop = async (userId) => {
  const cartDetail = await getCartDetail(userId);

  if (cartDetail.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Kiểm tra toàn vẹn dữ liệu: nếu có item nào bị null variant/product/shop
  // (vì sản phẩm đã bị xoá/deactivate) thì báo lỗi rõ ràng thay vì crash ngầm
  const invalidItems = cartDetail.items.filter((i) => !i.variant || !i.product || !i.shop);
  if (invalidItems.length > 0) {
    throw new ApiError(
      409,
      "Some items in your cart are no longer available. Please remove them before checkout."
    );
  }

  const groupsMap = new Map();

  for (const item of cartDetail.items) {
    const shopId = item.shop.id.toString();
    if (!groupsMap.has(shopId)) {
      groupsMap.set(shopId, {
        shop_id: item.shop.id,
        shop_name: item.shop.name,
        items: [],
        subtotal_amount: 0,
        shipping_fee: 15000, // phí cố định theo ShopOrder, đúng theo tài liệu
      });
    }
    const group = groupsMap.get(shopId);
    group.items.push(item);
    group.subtotal_amount += item.line_total;
  }

  const shopOrders = Array.from(groupsMap.values());
  const order_total = shopOrders.reduce(
    (sum, g) => sum + g.subtotal_amount + g.shipping_fee,
    0
  );

  return { shopOrders, order_total };
};

module.exports = {
  getOrCreateCart,
  addItem,
  updateItem,
  removeItem,
  getCartDetail,
  getCartGroupedByShop,
};