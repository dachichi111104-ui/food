import { useState, useEffect } from "react";
import { listMyShopOrders, startPreparing, handToShipper, cancelShopOrder } from "../../services/shopOrder.service";
import DashboardLayout from "../../components/DashboardLayout";
import { AlertCircle, Package, ChefHat, Bike, XCircle, Eye, User, Phone, MapPin, CreditCard, X, Check } from "lucide-react";

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: "Chờ TT VNPay",  badge: "badge-warning" },
  CONFIRMED:       { label: "Cần xử lý/chuẩn bị", badge: "badge-primary" },
  PREPARING:       { label: "Đang làm món", badge: "badge-warning" },
  HANDED_TO_SHIPPER: { label: "Đã giao Shipper", badge: "" },
  DELIVERED:       { label: "Đã giao hàng",     badge: "" },
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

  /* Order Detail Modal */
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);

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
    try {
      await fn(id);
      fetchOrders();
      if (selectedOrderModal && selectedOrderModal._id === id) {
        setSelectedOrderModal(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt("Nhập lý do hủy đơn hàng:");
    if (!reason) return;
    setActionLoading(id);
    try {
      await cancelShopOrder(id, reason);
      fetchOrders();
      if (selectedOrderModal && selectedOrderModal._id === id) {
        setSelectedOrderModal(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Hủy thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout title="Quản lý Đơn hàng Quán">
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

      {loading && <div className="spinner-wrap"><div className="spinner" /><span>Đang tải đơn hàng...</span></div>}
      {error && <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={16} /> {error}</div>}

      {!loading && shopOrders.length === 0 && (
        <div className="empty-state card card-body" style={{ padding: 48 }}>
          <div style={{ marginBottom: 16 }}>
            <Package size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
          </div>
          <div className="empty-state-title">Không có đơn hàng nào</div>
          <p className="empty-state-desc">Các đơn hàng mới của quán sẽ hiển thị tại đây.</p>
        </div>
      )}

      {/* Order Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {shopOrders.map((so) => {
          const cfg = STATUS_CONFIG[so.status] || { label: so.status, badge: "" };
          const isCOD = so.payment_method === "COD";

          return (
            <div key={so._id} className="card card-body" style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
              {/* Header Info */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    {/* Payment & Order Status Badges */}
                    {isCOD ? (
                      <span className="badge badge-gold" style={{ fontSize: 11 }}>COD - Thu tiền khi giao</span>
                    ) : so.status === "PENDING_PAYMENT" ? (
                      <span className="badge badge-warning" style={{ fontSize: 11 }}>VNPay - Chờ thanh toán online</span>
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: 11 }}>VNPay - Đã thanh toán</span>
                    )}

                    {so.status !== "PENDING_PAYMENT" && (
                      <span className={`badge ${cfg.badge}`}>
                        <span className="badge-dot" />
                        {cfg.label}
                      </span>
                    )}

                    <span style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 700 }}>
                      Mã: #{so._id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  {/* Customer Brief Info */}
                  <div style={{ fontSize: 13.5, color: "var(--color-ink)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <User size={14} color="var(--color-primary)" />
                    {so.recipient_name}
                    <span style={{ color: "var(--color-muted)", fontWeight: 400, fontSize: 12.5 }}>({so.recipient_phone})</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--color-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={13} color="var(--color-muted)" />
                    {so.shipping_address}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="text-price" style={{ fontSize: 18 }}>
                    {(so.subtotal_amount + (so.shipping_fee || 0)).toLocaleString()}đ
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
                    Tạm tính: {so.subtotal_amount?.toLocaleString()}đ
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div style={{ background: "var(--color-cream-pale)", padding: "10px 14px", borderRadius: "var(--radius-sm)", marginBottom: 12 }}>
                {so.items.map((item) => (
                  <div key={item._id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, margin: "2px 0" }}>
                    <span>
                      <strong>{item.quantity}x</strong> {item.product_name_snapshot} {item.variant_name_snapshot && <span className="text-muted">({item.variant_name_snapshot})</span>}
                    </span>
                    <span style={{ fontWeight: 600 }}>{(item.price_at_order * item.quantity).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, paddingTop: 6, borderTop: "1px dashed var(--color-border)" }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedOrderModal(so)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}
                >
                  <Eye size={14} /> Xem chi tiết đơn
                </button>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(so.status === "CONFIRMED" || (so.status === "PENDING_PAYMENT" && isCOD)) && (
                    <button
                      onClick={() => handleAction(startPreparing, so._id)}
                      disabled={actionLoading === so._id}
                      className="btn btn-primary btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <ChefHat size={14} /> {isCOD ? "Xác nhận & Bắt đầu làm" : "Bắt đầu làm món"}
                    </button>
                  )}

                  {so.status === "PREPARING" && (
                    <button
                      onClick={() => handleAction(handToShipper, so._id)}
                      disabled={actionLoading === so._id}
                      className="btn btn-primary btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <Bike size={14} /> Bàn giao cho Shipper
                    </button>
                  )}

                  {["CONFIRMED", "PREPARING", "PENDING_PAYMENT"].includes(so.status) && (
                    <button
                      onClick={() => handleCancel(so._id)}
                      disabled={actionLoading === so._id}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--color-danger)", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <XCircle size={14} /> Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderModal && (
        <div className="logout-modal-overlay" onClick={() => setSelectedOrderModal(null)}>
          <div
            className="logout-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 580, width: "92vw", textAlign: "left", borderRadius: 20, padding: 0, overflow: "hidden" }}
          >
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 17, margin: 0, color: "#fff" }}>Chi tiết đơn hàng #{selectedOrderModal._id.slice(-8).toUpperCase()}</h3>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Ngày đặt: {new Date(selectedOrderModal.createdAt).toLocaleString("vi-VN")}</span>
              </div>
              <button onClick={() => setSelectedOrderModal(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, maxHeight: "75vh", overflowY: "auto" }}>
              {/* Customer Info Box */}
              <div style={{ padding: 14, background: "var(--color-cream-mid)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "var(--color-ink)", display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={16} color="var(--color-primary)" /> Thông tin người đặt & giao hàng:
                </div>
                <div style={{ fontSize: 13.5, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div><strong>Người nhận:</strong> {selectedOrderModal.recipient_name}</div>
                  <div><strong>Số điện thoại:</strong> {selectedOrderModal.recipient_phone}</div>
                  <div><strong>Địa chỉ giao:</strong> {selectedOrderModal.shipping_address}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <strong>Hình thức thanh toán:</strong>
                    <span className={`badge ${selectedOrderModal.payment_method === "COD" ? "badge-gold" : "badge-success"}`}>
                      <CreditCard size={12} /> {selectedOrderModal.payment_method === "COD" ? "COD - Thu tiền mặt khi giao" : "VNPay - Đã thanh toán online"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Danh sách món ăn:</div>
                <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  {selectedOrderModal.items.map((item, idx) => (
                    <div
                      key={item._id}
                      style={{
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: idx === selectedOrderModal.items.length - 1 ? "none" : "1px solid var(--color-border-light)",
                        fontSize: 13.5,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.product_name_snapshot}</div>
                        {item.variant_name_snapshot && <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Loại: {item.variant_name_snapshot}</div>}
                        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Đơn giá: {item.price_at_order.toLocaleString()}đ × {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                        {(item.price_at_order * item.quantity).toLocaleString()}đ
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div style={{ padding: "12px 14px", background: "var(--color-white)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>Tạm tính món ăn:</span>
                  <span>{selectedOrderModal.subtotal_amount?.toLocaleString()}đ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span>Phí giao hàng:</span>
                  <span>{(selectedOrderModal.shipping_fee || 15000).toLocaleString()}đ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, borderTop: "1px solid var(--color-border)", paddingTop: 6, color: "var(--color-primary)" }}>
                  <span>Tổng giá trị đơn hàng:</span>
                  <span>{(selectedOrderModal.subtotal_amount + (selectedOrderModal.shipping_fee || 15000)).toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ padding: "14px 20px", background: "var(--color-cream-mid)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setSelectedOrderModal(null)}>Đóng</button>

              {(selectedOrderModal.status === "CONFIRMED" || (selectedOrderModal.status === "PENDING_PAYMENT" && selectedOrderModal.payment_method === "COD")) && (
                <button
                  onClick={() => handleAction(startPreparing, selectedOrderModal._id)}
                  disabled={actionLoading === selectedOrderModal._id}
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <ChefHat size={15} /> Bắt đầu chuẩn bị
                </button>
              )}

              {selectedOrderModal.status === "PREPARING" && (
                <button
                  onClick={() => handleAction(handToShipper, selectedOrderModal._id)}
                  disabled={actionLoading === selectedOrderModal._id}
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Bike size={15} /> Bàn giao Shipper
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ShopOrders;