import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { listMyShopOrders } from "../../services/shopOrder.service";
import { getMyShopProducts } from "../../services/product.service";
import { getMyShops, createShop } from "../../services/shop.service";
import { VIETNAM_LOCATIONS } from "../../data/vietnamLocations";
import { Star, Calendar, Store, Plus, DollarSign, ShoppingBag, CheckCircle, XCircle, TrendingUp, Loader2, ArrowUpRight } from "lucide-react";

const SellerDashboard = () => {
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Time Filter state */
  const [timeFilter, setTimeFilter] = useState("all"); // 'all' | 'today' | '7days' | '30days' | 'custom'
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  /* Create new shop modal */
  const [showCreateShopModal, setShowCreateShopModal] = useState(false);
  const [newShopForm, setNewShopForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "TP. Hồ Chí Minh",
  });
  const [createShopLoading, setCreateShopLoading] = useState(false);
  const [createShopError, setCreateShopError] = useState("");

  const fetchShops = async () => {
    try {
      const res = await getMyShops();
      const shopList = res.shops || [];
      setShops(shopList);
      if (shopList.length > 0 && !selectedShopId) {
        setSelectedShopId(shopList[0]._id);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = selectedShopId ? { shop_id: selectedShopId } : {};
      const orderRes = await listMyShopOrders(params);
      const prodRes = await getMyShopProducts(params);
      setOrders(orderRes.shopOrders || []);
      setProducts(prodRes.products || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedShopId]);

  /* Handle Create New Shop */
  const handleCreateNewShopSubmit = async (e) => {
    e.preventDefault();
    setCreateShopLoading(true);
    setCreateShopError("");
    try {
      const res = await createShop(newShopForm);
      setShowCreateShopModal(false);
      setNewShopForm({ name: "", description: "", address: "", city: "TP. Hồ Chí Minh" });
      await fetchShops();
      if (res.shop?._id) {
        setSelectedShopId(res.shop._id);
      }
    } catch (err) {
      setCreateShopError(err.response?.data?.message || "Tạo quán ăn mới thất bại");
    } finally {
      setCreateShopLoading(false);
    }
  };

  /* Accurate Date Filtering Logic */
  const getFilteredOrders = () => {
    if (timeFilter === "all") return orders;
    const now = new Date();

    return orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      if (isNaN(orderDate.getTime())) return false;

      if (timeFilter === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      } else if (timeFilter === "7days") {
        const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= past7;
      } else if (timeFilter === "30days") {
        const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= past30;
      } else if (timeFilter === "custom") {
        let match = true;
        if (customStart) {
          const sDate = new Date(customStart);
          sDate.setHours(0, 0, 0, 0);
          if (orderDate < sDate) match = false;
        }
        if (customEnd) {
          const eDate = new Date(customEnd);
          eDate.setHours(23, 59, 59, 999);
          if (orderDate > eDate) match = false;
        }
        return match;
      }
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();
  const completedOrders = filteredOrders.filter((o) => ["COMPLETED", "DELIVERED"].includes(o.status));
  const pendingOrders = filteredOrders.filter((o) => ["CONFIRMED", "PREPARING", "HANDED_TO_SHIPPER", "PENDING_PAYMENT"].includes(o.status));
  const cancelledOrders = filteredOrders.filter((o) => o.status === "CANCELLED");

  // Total revenue includes food subtotal + shipping fee
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.subtotal_amount || 0) + (o.shipping_fee || 0), 0);
  const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

  // Daily revenue breakdown grouping
  const dailyBreakdownMap = {};
  completedOrders.forEach((o) => {
    const dayStr = new Date(o.createdAt).toLocaleDateString("vi-VN");
    if (!dailyBreakdownMap[dayStr]) {
      dailyBreakdownMap[dayStr] = { date: dayStr, count: 0, revenue: 0 };
    }
    dailyBreakdownMap[dayStr].count += 1;
    dailyBreakdownMap[dayStr].revenue += (o.subtotal_amount || 0) + (o.shipping_fee || 0);
  });
  const dailyBreakdownList = Object.values(dailyBreakdownMap);

  const activeShopObj = shops.find((s) => s._id === selectedShopId) || shops[0];

  return (
    <DashboardLayout title="Báo cáo Doanh thu & Quản lý Quán">
      {/* 1. Multi-shop Switcher & Create Shop Header */}
      <div
        className="card card-body"
        style={{
          marginBottom: 24,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          background: "linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)",
          color: "#fff",
          borderRadius: "var(--radius-md)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Store size={26} color="var(--color-gold)" />
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Đang chọn Quán ăn:</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>
              {activeShopObj ? activeShopObj.name : "Chưa có quán ăn"}
              {shops.length > 1 && <span style={{ fontSize: 12, opacity: 0.8, marginLeft: 8 }}>({shops.length} quán của bạn)</span>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {shops.length > 1 && (
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255,255,255,0.4)",
                background: "#fff",
                color: "var(--color-ink)",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {shops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          )}

          <button
            className="btn btn-gold btn-sm"
            onClick={() => setShowCreateShopModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
          >
            <Plus size={15} /> Tạo thêm Quán ăn mới
          </button>
        </div>
      </div>

      {/* 2. Time Filter Selection Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={16} color="var(--color-primary)" /> Lọc mốc thời gian:
        </span>
        {[
          { key: "all", label: "Tất cả thời gian" },
          { key: "today", label: "Hôm nay" },
          { key: "7days", label: "7 ngày qua" },
          { key: "30days", label: "30 ngày qua" },
          { key: "custom", label: "Tùy chọn khoảng ngày" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTimeFilter(t.key)}
            className={`btn ${timeFilter === t.key ? "btn-primary" : "btn-outline"} btn-sm`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Selector */}
      {timeFilter === "custom" && (
        <div
          className="card card-body"
          style={{
            marginBottom: 20,
            padding: "14px 20px",
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
            background: "var(--color-cream-pale)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Từ ngày:</span>
            <input
              type="date"
              className="input"
              style={{ width: "auto", padding: "6px 10px" }}
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Đến ngày:</span>
            <input
              type="date"
              className="input"
              style={{ width: "auto", padding: "6px 10px" }}
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
          {(customStart || customEnd) && (
            <button
              onClick={() => {
                setCustomStart("");
                setCustomEnd("");
              }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12 }}
            >
              Đặt lại mốc ngày
            </button>
          )}
        </div>
      )}

      {/* 3. Key Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div className="card card-body" style={{ borderLeft: "4px solid var(--color-primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--color-muted)", fontWeight: 700 }}>TỔNG DOANH THU</span>
            <DollarSign size={20} color="var(--color-primary)" />
          </div>
          <div className="text-price" style={{ fontSize: 24 }}>
            {totalRevenue.toLocaleString()}đ
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
            {completedOrders.length} đơn hoàn thành
          </div>
        </div>

        <div className="card card-body" style={{ borderLeft: "4px solid #2B6CB0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--color-muted)", fontWeight: 700 }}>ĐƠN GIÁ TRỊ TRUNG BÌNH</span>
            <TrendingUp size={20} color="#2B6CB0" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)" }}>
            {avgOrderValue.toLocaleString()}đ
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>Trên 1 đơn hàng</div>
        </div>

        <div className="card card-body" style={{ borderLeft: "4px solid #D69E2E" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--color-muted)", fontWeight: 700 }}>ĐƠN ĐANG XỬ LÝ</span>
            <ShoppingBag size={20} color="#D69E2E" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#D69E2E" }}>
            {pendingOrders.length}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>Cần làm & giao</div>
        </div>

        <div className="card card-body" style={{ borderLeft: "4px solid var(--color-danger)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--color-muted)", fontWeight: 700 }}>ĐƠN HỦY / TỔN THẤT</span>
            <XCircle size={20} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-danger)" }}>
            {cancelledOrders.length}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>Tỉ lệ: {filteredOrders.length > 0 ? Math.round((cancelledOrders.length / filteredOrders.length) * 100) : 0}%</div>
        </div>
      </div>

      {/* 4. Daily Revenue Breakdown Table */}
      <div className="card card-body" style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={18} color="var(--color-primary)" /> Bảng Chi Tiết Doanh Thu Theo Ngày ({dailyBreakdownList.length} ngày phát sinh đơn)
        </h3>

        {dailyBreakdownList.length === 0 ? (
          <div className="empty-state" style={{ padding: "24px 0" }}>
            <p className="text-muted">Chưa có doanh thu trong khoảng thời gian này.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "var(--color-cream-mid)", textAlign: "left" }}>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-border)" }}>Ngày</th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-border)" }}>Số đơn hoàn thành</th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-border)", textAlign: "right" }}>Tổng Doanh Thu</th>
                </tr>
              </thead>
              <tbody>
                {dailyBreakdownList.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700 }}>{row.date}</td>
                    <td style={{ padding: "10px 14px" }}>{row.count} đơn</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "var(--color-primary)" }}>
                      {row.revenue.toLocaleString()}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create New Shop */}
      {showCreateShopModal && (
        <div className="logout-modal-overlay" onClick={() => setShowCreateShopModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, textAlign: "left" }}>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Đăng ký tạo thêm Quán ăn mới</h3>

            {createShopError && <div className="alert alert-error" style={{ marginBottom: 12 }}>{createShopError}</div>}

            <form onSubmit={handleCreateNewShopSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label>Tên Quán ăn mới *</label>
                <input
                  className="input"
                  placeholder="VD: Quán Cơm Tấm Sài Gòn Branch 2"
                  value={newShopForm.name}
                  onChange={(e) => setNewShopForm({ ...newShopForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Thành phố *</label>
                <select
                  className="input"
                  value={newShopForm.city}
                  onChange={(e) => setNewShopForm({ ...newShopForm, city: e.target.value })}
                >
                  {VIETNAM_LOCATIONS.map((c) => (
                    <option key={c.city} value={c.city}>{c.city}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Địa chỉ chi tiết Quán *</label>
                <input
                  className="input"
                  placeholder="VD: 120 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3"
                  value={newShopForm.address}
                  onChange={(e) => setNewShopForm({ ...newShopForm, address: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Mô tả ngắn về Quán ăn</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Giới thiệu món ăn đặc trưng của quán..."
                  value={newShopForm.description}
                  onChange={(e) => setNewShopForm({ ...newShopForm, description: e.target.value })}
                />
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateShopModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={createShopLoading}>
                  {createShopLoading ? <Loader2 size={15} className="spin" /> : "Xác nhận tạo quán"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SellerDashboard;
