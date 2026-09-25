const { Shop, Product, Order, ShopOrder, Shipment, Voucher, User } = require("../models");

const processChatMessage = async (userId, userMessage) => {
  const msg = (userMessage || "").toLowerCase().trim();

  let user = null;
  if (userId) {
    user = await User.findById(userId);
  }

  const role = user?.role || "buyer";

  // ────────────── 1. SELLER ASSISTANT ──────────────
  if (role === "seller") {
    const myShop = await Shop.findOne({ user_id: userId });
    if (!myShop) {
      return {
        reply: "Bạn chưa đăng ký quán ăn. Hãy vào phần 'Quản lý Shop' để điền thông tin và tạo quán ăn mới nhé!",
        action: "create_shop",
      };
    }

    if (msg.includes("doanh thu") || msg.includes("thống kê") || msg.includes("báo cáo")) {
      const orders = await ShopOrder.find({ shop_id: myShop._id, status: "COMPLETED" });
      const totalRev = orders.reduce((sum, o) => sum + (o.subtotal_amount || 0), 0);
      return {
        reply: `✦ Báo cáo Shop "${myShop.name}":\n• Tổng doanh thu từ đơn hoàn tất: ${totalRev.toLocaleString()}đ\n• Số đơn đã phục vụ thành công: ${orders.length} đơn.\n\nBạn có thể lọc theo khoảng ngày cụ thể tại Bảng thống kê!`,
        action: "view_dashboard",
      };
    }

    if (msg.includes("đơn hàng") || msg.includes("cần chuẩn bị") || msg.includes("đang xử lý")) {
      const pendingOrders = await ShopOrder.find({ shop_id: myShop._id, status: { $in: ["CONFIRMED", "PREPARING"] } });
      return {
        reply: `Quán "${myShop.name}" hiện đang có ${pendingOrders.length} đơn hàng cần xử lý.\n\nVui lòng vào mục "Đơn hàng của shop" để xác nhận Bắt đầu chuẩn bị hoặc Bàn giao cho Shipper!`,
        action: "view_shop_orders",
      };
    }

    if (msg.includes("thực đơn") || msg.includes("món ăn") || msg.includes("thêm món")) {
      const prodCount = await Product.countDocuments({ shop_id: myShop._id });
      return {
        reply: `Quán của bạn đang có ${prodCount} món ăn trong thực đơn. Bạn có thể thêm món mới, cập nhật giá hoặc điều chỉnh tồn kho bất kỳ lúc nào.`,
        action: "view_products",
      };
    }

    return {
      reply: `Xin chào Chủ quán "${myShop.name}"! Tôi là Trợ lý AI dành riêng cho Chủ quán FoodGo ✦.\nTôi có thể giúp bạn xem nhanh doanh thu, kiểm tra đơn hàng cần chuẩn bị, hoặc hướng dẫn quản lý thực đơn!`,
    };
  }

  // ────────────── 2. SHIPPER ASSISTANT ──────────────
  if (role === "shipper") {
    if (msg.includes("đơn khả dụng") || msg.includes("nhận đơn") || msg.includes("đơn gần đây")) {
      const count = await Shipment.countDocuments({ status: "UNASSIGNED" });
      return {
        reply: `Hiện đang có ${count} đơn hàng chờ giao trên hệ thống.\n\nCông thức phí ship dành cho bạn: 12.000đ cho 2km đầu + 3.000đ/km phát sinh. Hãy chọn đơn tiện đường nhất nhé!`,
        action: "available_shipments",
      };
    }

    if (msg.includes("đơn của tôi") || msg.includes("đang giao") || msg.includes("lấy hàng")) {
      const myShipments = await Shipment.find({ shipper_id: userId, status: { $in: ["ASSIGNED", "HANDED_TO_SHIPPER"] } });
      return {
        reply: `Bạn đang có ${myShipments.length} đơn hàng đang thực hiện.\n\nMở tab "Đơn của tôi" để bấm Dẫn đường Google Maps tới quán lấy hàng hoặc tới nhà khách!`,
        action: "my_shipments",
      };
    }

    return {
      reply: `Xin chào Tài xế FoodGo ✦!\nTôi có thể giúp bạn kiểm tra đơn khả dụng xung quanh, hướng dẫn tính phí ship và xem lộ trình giao hàng nhanh nhất!`,
    };
  }

  // ────────────── 3. ADMIN ASSISTANT ──────────────
  if (role === "admin") {
    if (msg.includes("duyệt shop") || msg.includes("quán chờ duyệt") || msg.includes("shop")) {
      const pendingCount = await Shop.countDocuments({ status: "pending" });
      return {
        reply: `Hệ thống hiện có ${pendingCount} quán ăn đang chờ bạn duyệt.\n\nBạn có thể duyệt, từ chối, tạm khóa hoặc ẩn shop tại trang Quản lý Shop!`,
        action: "admin_shops",
      };
    }

    if (msg.includes("giám sát") || msg.includes("tổng đơn") || msg.includes("hệ thống")) {
      const totalOrdersCount = await Order.countDocuments();
      return {
        reply: `✦ Thống kê toàn hệ thống FoodGo:\n• Tổng số đơn đặt: ${totalOrdersCount} đơn hàng.\n• Giám sát đơn thời gian thực sẵn sàng tại trang Quản lý đơn!`,
        action: "admin_orders",
      };
    }

    return {
      reply: `Xin chào Quản trị viên FoodGo ✦!\nTôi là Trợ lý AI hỗ trợ quản trị hệ thống, giúp bạn giám sát shop, đơn hàng và xử lý khiếu nại hoàn tiền!`,
    };
  }

  // ────────────── 4. BUYER ASSISTANT (Default) ──────────────
  if (msg.includes("đơn hàng") || msg.includes("đơn của tôi") || msg.includes("trạng thái đơn")) {
    if (!userId) {
      return {
        reply: "Bạn cần đăng nhập để kiểm tra trạng thái các đơn hàng cá nhân của mình trên FoodGo.",
        action: "login",
      };
    }
    const orders = await Order.find({ user_id: userId }).sort({ createdAt: -1 }).limit(3);
    if (!orders.length) {
      return {
        reply: "Bạn chưa có đơn hàng nào trên FoodGo. Hãy tham khảo danh sách quán ăn nổi bật và đặt món nhé!",
      };
    }
    const orderSummaries = orders.map(
      (o) => `• Đơn #${o._id.toString().slice(-6).toUpperCase()} - ${o.total_amount.toLocaleString()}đ (${translateStatus(o.status)})`
    );
    return {
      reply: `Dưới đây là 3 đơn hàng gần nhất của bạn:\n${orderSummaries.join("\n")}\n\nBạn có thể nhấn vào mục "Lịch sử đơn hàng" trên thanh điều hướng để xem chi tiết.`,
      action: "view_orders",
    };
  }

  if (msg.includes("quán") || msg.includes("gần tôi") || msg.includes("gợi ý") || msg.includes("ăn gì")) {
    const topShops = await Shop.find({ status: "approved" }).sort({ rating: -1, order_count: -1 }).limit(4);
    if (!topShops.length) {
      return { reply: "Hiện chưa có quán ăn nào mở cửa." };
    }
    const shopList = topShops.map(
      (s) => `• ${s.name} (⭐ ${s.rating || 5.0}) - ${s.address || "TP.HCM"}`
    );
    return {
      reply: `FoodGo gợi ý cho bạn các quán ăn nổi bật nhất hiện tại:\n${shopList.join("\n")}\n\nBạn có thể click vào quán để xem thực đơn chi tiết!`,
      action: "browse_shops",
    };
  }

  if (msg.includes("khuyến mãi") || msg.includes("voucher") || msg.includes("giảm giá") || msg.includes("ưu đãi")) {
    const vouchers = await Voucher.find({ is_active: true }).sort({ discount_value: -1 }).limit(4);
    if (!vouchers.length) {
      return { reply: "Hiện tại chưa có mã giảm giá chung. Đừng quên theo dõi banner để nhận quà nhé!" };
    }
    const vList = vouchers.map(
      (v) => `• Mã: ${v.code} - Giảm ${v.discount_type === "PERCENT" ? `${v.discount_value}%` : `${v.discount_value.toLocaleString()}đ`} (Đơn tối thiểu ${v.min_order_amount.toLocaleString()}đ)`
    );
    return {
      reply: `Danh sách các mã ưu đãi đang áp dụng trên FoodGo:\n${vList.join("\n")}\n\nBạn chỉ cần nhập mã tại bước Thanh toán để áp dụng!`,
      action: "use_voucher",
    };
  }

  if (msg.includes("đặt món") || msg.includes("đặt hàng") || msg.includes("thanh toán") || msg.includes("cod")) {
    return {
      reply: `Quy trình đặt món trên FoodGo vô cùng đơn giản:\n1. Chọn quán ăn & món ăn yêu thích.\n2. Thêm vào giỏ hàng và chọn địa chỉ giao hàng.\n3. Chọn phương thức thanh toán: Ví điện tử VNPay hoặc Thanh toán khi nhận hàng (COD).\n4. Xác nhận đặt đơn và chờ shipper giao hàng tận nơi!`,
    };
  }

  if (msg.length > 2) {
    const products = await Product.find({ name: { $regex: msg, $options: "i" }, is_active: true }).limit(3);
    if (products.length) {
      const pList = products.map((p) => `• ${p.name}`);
      return {
        reply: `FoodGo tìm thấy một số món ăn liên quan đến từ khoá "${userMessage}":\n${pList.join("\n")}`,
      };
    }
  }

  return {
    reply: `Chào bạn! Tôi là trợ lý ảo FoodGo ✦.\nTôi có thể giúp bạn tìm quán ăn ngon, kiểm tra đơn hàng, xem mã khuyến mãi hoặc hướng dẫn đặt món. Bạn cần tôi hỗ trợ gì?`,
  };
};

const translateStatus = (status) => {
  const map = {
    PENDING_PAYMENT: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    CANCELLED: "Đã hủy",
    COMPLETED: "Hoàn tất",
    CONFIRMED: "Đã xác nhận",
    PREPARING: "Đang chuẩn bị",
    HANDED_TO_SHIPPER: "Đang giao",
    DELIVERED: "Đã giao",
  };
  return map[status] || status;
};

module.exports = { processChatMessage };
