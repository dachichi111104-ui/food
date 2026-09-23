import { useState, useEffect } from "react";
import { listMyShopOrders, startPreparing, handToShipper, cancelShopOrder } from "../../services/shopOrder.service";
import DashboardLayout from "../../components/DashboardLayout";

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: "Chờ TT",     badge: "badge-warning" },
  CONFIRMED:       { label: "Cần chuẩn bị", badge: "badge-primary" },
  PREPARING:       { label: "Đang chuẩn bị", badge: "badge-warning" },
  HANDED_TO_SHIPPER: { label: "Đã bàn giao", badge: "" },
  DELIVERED:       { label: "Đã giao",     badge: "" },
  COMPLETED:       { label: "Hoàn tất",    badge: "badge-success" },
  CANCELLED:       { label: "Đã hủy",      badge: "badge-danger" },
  REFUNDING:       { label: "Hoàn tiền",   badge: "badge-warning" },
  REFUNDED:        { label: "Đã hoàn",     badge: "badge-success" },
};

const FILTER_TABS = [
  { value: "", label: "Tất cả" },
  { value: "CONFIRMED", label: "Cần chuẩn bị" },
  { value: "PREPARING", label: "Đang chuẩn bị" },
  { value: "HANDED_TO_SHIPPER", label: "Đã bàn giao" },
  { value: "COMPLETED", label: "Hoàn tất" },
];

const ShopOrders = () => {
  const [shopOrders, setShopOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      setShopOrders(
        (await listMyShopOrders(filterStatus ? { status: filterStatus } : {})).shopOrders
      );
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const handleAction = async (fn, id) => {
    setActionLoading(id);
    setError("");
    try { await fn(id); fetchOrders(); }
    catch (err) { setError(err.response?.data?.message || "Thao tác thất bại"); }
    finally { setActionLoading(null); }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt("Nhập lý do hủy đơn:");
    if (!reason) return;
    setActionLoading(id);
    try { await cancelShopOrder(id, reason); fetchOrders(); }
    catch (err) { setError(err.response?.data?.message || "Hủy thất bại"); }
    finally { setActionLoading(null); }
  };

  return (
    <DashboardLayout title="Đơn hàng của shop">
      {/* Filter tabs */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`tab-btn ${filterStatus === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {!loading && shopOrders.length === 0 && (
        <div className="empty-state card card-body" style={{ padding: 48 }}>
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">Không có đơn hàng nào</div>
          <p className="empty-state-desc">Đơn hàng mới sẽ hiển thị tại đây.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shopOrders.map((so) => {
          const cfg = STATUS_CONFIG[so.status] || { label: so.status, badge: "" };
          return (
            <div key={so._id} className="card card-body">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span className={`badge ${cfg.badge}`}>
                      <span className="badge-dot" />
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                      {so._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {so.items.map((item) => (
                      <p key={item._id} style={{ margin: 0, fontSize: 14 }}>
                        <span style={{ fontWeight: 600 }}>{item.product_name_snapshot}</span>
                        {item.variant_name_snapshot && (
                          <span className="text-muted"> · {item.variant_name_snapshot}</span>
                        )}
                        <span className="text-muted"> ×{item.quantity}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="text-price" style={{ fontSize: 16 }}>
                    {so.subtotal_amount?.toLocaleString()}đ
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>Tạm tính</div>
                </div>
              </div>

              {(so.status === "CONFIRMED" || so.status === "PREPARING") && (
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {so.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleAction(startPreparing, so._id)}
                      disabled={actionLoading === so._id}
                      className="btn btn-primary btn-sm"
                    >
                      🍳 Bắt đầu chuẩn bị
                    </button>
                  )}
                  {so.status === "PREPARING" && (
                    <button
                      onClick={() => handleAction(handToShipper, so._id)}
                      disabled={actionLoading === so._id}
                      className="btn btn-primary btn-sm"
                    >
                      🛵 Bàn giao Shipper
                    </button>
                  )}
                  <button
                    onClick={() => handleCancel(so._id)}
                    disabled={actionLoading === so._id}
                    className="btn btn-danger btn-sm"
                  >
                    Hủy đơn
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default ShopOrders;