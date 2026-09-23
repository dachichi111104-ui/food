import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderDetail, cancelOrder, completeShopOrder } from "../../services/order.service";
import { createReview } from "../../services/review.service";
import { ArrowLeft, Star, CheckCircle2, XCircle, Clock, Truck, Package, AlertCircle, Loader2 } from "lucide-react";

const SHOP_ORDER_STATUS = {
  PENDING_PAYMENT:   { label: "Chờ thanh toán",         step: 0, badge: "badge-warning",  Icon: Clock },
  CONFIRMED:         { label: "Đã xác nhận",             step: 1, badge: "badge-primary",  Icon: CheckCircle2 },
  PREPARING:         { label: "Đang chuẩn bị",           step: 2, badge: "badge-warning",  Icon: Package },
  HANDED_TO_SHIPPER: { label: "Đang giao",               step: 3, badge: "badge-primary",  Icon: Truck },
  DELIVERED:         { label: "Đã giao — chờ xác nhận", step: 4, badge: "badge-gold",     Icon: CheckCircle2 },
  COMPLETED:         { label: "Hoàn tất",                step: 5, badge: "badge-success",  Icon: CheckCircle2 },
  CANCELLED:         { label: "Đã hủy",                  step: -1, badge: "badge-danger",  Icon: XCircle },
  REFUNDING:         { label: "Đang hoàn tiền",          step: -1, badge: "badge-warning", Icon: Clock },
  REFUNDED:          { label: "Đã hoàn tiền",            step: -1, badge: "badge-success", Icon: CheckCircle2 },
};

const STEPS = [
  { label: "Xác nhận", Icon: CheckCircle2 },
  { label: "Chuẩn bị", Icon: Package },
  { label: "Đang giao", Icon: Truck },
  { label: "Đã giao", Icon: CheckCircle2 },
  { label: "Hoàn tất", Icon: CheckCircle2 },
];

const ReviewBox = ({ item }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true); setError("");
    try {
      await createReview({ order_item_id: item._id, rating, comment });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div style={{ fontSize: 13, color: "var(--color-success)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
      <CheckCircle2 size={14} /> Đã gửi đánh giá
    </div>
  );

  return (
    <div style={{ background: "var(--color-cream)", border: "1px solid var(--color-border)", padding: "14px 16px", borderRadius: "var(--radius-sm)", marginTop: 10 }}>
      <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700 }}>Đánh giá món này</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map((r) => (
          <button key={r} onClick={() => setRating(r)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 2,
          }}>
            <Star
              size={22}
              fill={r <= rating ? "#C9A15A" : "none"}
              color={r <= rating ? "#C9A15A" : "var(--color-border)"}
            />
          </button>
        ))}
      </div>
      <textarea
        className="input" placeholder="Nhận xét về món ăn (không bắt buộc)"
        value={comment} onChange={(e) => setComment(e.target.value)}
        style={{ minHeight: 64, resize: "vertical", marginBottom: 10 }}
      />
      {error && <p style={{ color: "var(--color-danger)", fontSize: 13, margin: "0 0 8px" }}>{error}</p>}
      <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm">
        {submitting ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> Đang gửi...</> : "Gửi đánh giá"}
      </button>
    </div>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { setData(await getOrderDetail(id)); }
    catch (err) { setError(err.response?.data?.message || "Không tải được đơn hàng"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCancel = async () => {
    setActionLoading(true);
    try { await cancelOrder(id); fetchData(); }
    catch (err) { setError(err.response?.data?.message || "Hủy đơn thất bại"); }
    finally { setActionLoading(false); }
  };

  const handleComplete = async (shopOrderId) => {
    setActionLoading(true);
    try { await completeShopOrder(shopOrderId); fetchData(); }
    catch (err) { setError(err.response?.data?.message || "Xác nhận thất bại"); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="container" style={{ padding: "40px 32px" }}>
      <div className="spinner-wrap"><div className="spinner" /><span>Đang tải đơn hàng...</span></div>
    </div>
  );
  if (error && !data) return (
    <div className="container" style={{ padding: "60px 32px", maxWidth: 640 }}>
      <div className="alert alert-error">{error}</div>
      <Link to="/orders" className="btn btn-outline" style={{ marginTop: 16 }}>← Lịch sử đơn hàng</Link>
    </div>
  );

  const { order, shopOrders } = data;

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "60vh", padding: "40px 0 64px" }}>
      <div className="container" style={{ maxWidth: 760 }}>

        <Link to="/orders" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--color-muted)", marginBottom: 24, textDecoration: "none" }}>
          <ArrowLeft size={15} /> Lịch sử đơn hàng
        </Link>

        {/* Order header */}
        <div className="card card-body" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "clamp(18px, 3vw, 22px)", marginBottom: 6 }}>
                Đơn #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-muted" style={{ fontSize: 13 }}>
                {new Date(order.createdAt).toLocaleString("vi-VN", {
                  day: "2-digit", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="text-price" style={{ fontSize: 24 }}>{order.total_amount.toLocaleString()}đ</div>
              {order.status === "PENDING_PAYMENT" && (
                <button onClick={handleCancel} disabled={actionLoading} className="btn btn-danger btn-sm" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <XCircle size={14} /> {actionLoading ? "Đang hủy..." : "Hủy đơn hàng"}
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><AlertCircle size={15} />{error}</div>}

        {/* Shop orders */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {shopOrders.map((so) => {
            const cfg = SHOP_ORDER_STATUS[so.status] || { label: so.status, step: 0, badge: "", Icon: Package };
            const currentStep = cfg.step;
            const StatusIcon = cfg.Icon;

            return (
              <div key={so._id} className="card card-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                  <h3 style={{ fontSize: 15 }}>Chi tiết đơn</h3>
                  <span className={`badge ${cfg.badge}`} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                </div>

                {/* Progress tracker */}
                {currentStep >= 1 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
                      {STEPS.map((step, i) => {
                        const done = i < currentStep - 1;
                        const current = i === currentStep - 1;
                        const StepIcon = step.Icon;
                        return (
                          <div key={step.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                            {i < STEPS.length - 1 && (
                              <div style={{
                                position: "absolute", top: 15, left: "50%", width: "100%", height: 2,
                                background: done ? "var(--color-success)" : "var(--color-border)", zIndex: 0,
                              }} />
                            )}
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: done || current
                                ? (done ? "var(--color-success)" : "var(--color-primary)")
                                : "var(--color-border)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              position: "relative", zIndex: 1,
                            }}>
                              <StepIcon size={14} color="#fff" />
                            </div>
                            <div style={{
                              fontSize: 11, marginTop: 6, textAlign: "center", maxWidth: 60,
                              color: done || current ? "var(--color-ink)" : "var(--color-muted)",
                              fontWeight: done || current ? 600 : 400,
                            }}>
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {so.items.map((item) => (
                    <div key={item._id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600 }}>{item.product_name_snapshot}</span>
                          {item.variant_name_snapshot && <span className="text-muted"> · {item.variant_name_snapshot}</span>}
                          <span className="text-muted"> ×{item.quantity}</span>
                        </div>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>{item.price_at_order.toLocaleString()}đ</span>
                      </div>
                      {so.status === "COMPLETED" && <ReviewBox item={item} />}
                    </div>
                  ))}
                </div>

                <div className="divider-dashed" />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, paddingTop: 12 }}>
                  <span className="text-muted">Tạm tính + Ship</span>
                  <span style={{ fontWeight: 600 }}>{(so.subtotal_amount + so.shipping_fee).toLocaleString()}đ</span>
                </div>

                {so.status === "DELIVERED" && (
                  <button onClick={() => handleComplete(so._id)} disabled={actionLoading} className="btn btn-primary btn-sm" style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7 }}>
                    {actionLoading
                      ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Đang xác nhận...</>
                      : <><CheckCircle2 size={14} /> Xác nhận đã nhận hàng</>
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrderDetail;