import { useState, useEffect } from "react";
import { getAdminStats } from "../../services/admin.service";
import { DollarSign, ShoppingBag, Store, Users, TrendingUp, Package, AlertCircle, Loader2 } from "lucide-react";

const STATUS_LABELS = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", bg: "#FEFCBF", color: "#744210" },
  CONFIRMED: { label: "Đã xác nhận", bg: "#EBF8FF", color: "#2B6CB0" },
  PREPARING: { label: "Đang chuẩn bị", bg: "#FEFCBF", color: "#D69E2E" },
  HANDED_TO_SHIPPER: { label: "Đang giao", bg: "#EBF8FF", color: "#2B6CB0" },
  DELIVERED: { label: "Đã giao thành công", bg: "#C6F6D5", color: "#22543D" },
  COMPLETED: { label: "Hoàn tất", bg: "#C6F6D5", color: "#22543D" },
  CANCELLED: { label: "Đã hủy", bg: "#FED7D7", color: "#9B2C2C" },
  REFUNDING: { label: "Đang hoàn tiền", bg: "#FEEBC8", color: "#C05621" },
  REFUNDED: { label: "Đã hoàn tiền", bg: "#E2E8F0", color: "#4A5568" },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải số liệu thống kê Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return (
    <div className="container" style={{ padding: "60px 32px", textAlign: "center" }}>
      <Loader2 size={32} className="spin" style={{ color: "var(--color-primary)", margin: "0 auto 12px" }} />
      <p style={{ color: "var(--color-muted)" }}>Đang tải số liệu thống kê hệ thống...</p>
    </div>
  );

  if (error || !stats) return (
    <div className="container" style={{ padding: "40px 32px" }}>
      <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AlertCircle size={18} />
        <span>{error || "Lỗi tải số liệu."}</span>
      </div>
    </div>
  );

  const { totalRevenue, totalOrders, totalShops, totalUsers, ordersByStatus, topProducts, recentRevenue } = stats;
  const maxRevenue = Math.max(...recentRevenue.map((r) => r.revenue), 1);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "80vh", padding: "36px 0 60px" }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: "var(--color-ink)", marginBottom: 6 }}>
            Bảng điều khiển Thống kê Admin 📊
          </h1>
          <p className="text-muted" style={{ fontSize: 14 }}>
            Tổng quan doanh thu, đơn hàng, người dùng và sản phẩm bán chạy trên toàn hệ thống FoodGo.
          </p>
        </div>

        {/* Overview Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 28 }}>
          {/* Total Revenue */}
          <div className="card card-body" style={{ background: "linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>Tổng doanh thu</span>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DollarSign size={20} color="#fff" />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{(totalRevenue || 0).toLocaleString()}đ</div>
            <span style={{ fontSize: 11.5, opacity: 0.8, marginTop: 4, display: "block" }}>Từ các đơn hoàn tất/đã giao</span>
          </div>

          {/* Total Orders */}
          <div className="card card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 600 }}>Tổng đơn hàng</span>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary-pale)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingBag size={18} color="var(--color-primary)" />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-ink)" }}>{totalOrders || 0}</div>
            <span style={{ fontSize: 11.5, color: "var(--color-muted)", marginTop: 4, display: "block" }}>Toàn bộ đơn hàng</span>
          </div>

          {/* Total Shops */}
          <div className="card card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 600 }}>Tổng quán ăn</span>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EBF8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Store size={18} color="#2B6CB0" />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-ink)" }}>{totalShops || 0}</div>
            <span style={{ fontSize: 11.5, color: "var(--color-muted)", marginTop: 4, display: "block" }}>Cửa hàng trên hệ thống</span>
          </div>

          {/* Total Users */}
          <div className="card card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 600 }}>Người dùng</span>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEFCBF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={18} color="#D69E2E" />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-ink)" }}>{totalUsers || 0}</div>
            <span style={{ fontSize: 11.5, color: "var(--color-muted)", marginTop: 4, display: "block" }}>Tài khoản đã đăng ký</span>
          </div>
        </div>

        {/* 7-Day Revenue Trend Section */}
        <div className="card card-body" style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--color-primary)" /> Doanh thu 7 ngày gần nhất
          </h3>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180, padding: "10px 0", borderBottom: "1px solid var(--color-border-light)" }}>
            {recentRevenue.map((r) => {
              const heightPercent = maxRevenue > 0 ? Math.max((r.revenue / maxRevenue) * 100, 8) : 8;
              return (
                <div key={r.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-primary)", marginBottom: 4 }}>
                    {r.revenue > 0 ? `${(r.revenue / 1000).toFixed(0)}k` : "0"}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 36,
                      height: `${heightPercent}%`,
                      background: "linear-gradient(180deg, var(--color-primary) 0%, #2B6CB0 100%)",
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.3s ease",
                    }}
                    title={`${r.date}: ${r.revenue.toLocaleString()}đ (${r.ordersCount} đơn)`}
                  />
                  <span style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 8, transform: "rotate(-20deg)", whiteSpace: "nowrap" }}>
                    {r.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Orders by status */}
          <div className="card card-body">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={18} color="var(--color-primary)" /> Phân loại đơn hàng theo trạng thái
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.keys(STATUS_LABELS).map((stKey) => {
                const count = ordersByStatus[stKey] || 0;
                const { label, bg, color } = STATUS_LABELS[stKey];
                return (
                  <div key={stKey} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--color-bg)", borderRadius: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, padding: "3px 8px", background: bg, color, borderRadius: 4 }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>{count} đơn</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 5 Best Selling Products */}
          <div className="card card-body">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              🔥 Top 5 Sản phẩm bán chạy nhất
            </h3>

            {topProducts.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 13, textAlign: "center", marginTop: 40 }}>Chưa có dữ liệu bán hàng.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {topProducts.map((p, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--color-bg)", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: idx === 0 ? "var(--color-gold)" : "var(--color-muted)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p._id || "Sản phẩm"}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>{p.totalQuantity} đã bán</div>
                      <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{(p.totalSales || 0).toLocaleString()}đ</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
