import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderDetail, cancelOrder } from "../../services/order.service";
import { createReview, createShipperReview, getShipperReview } from "../../services/review.service";
import { createReport } from "../../services/report.service";
import { ArrowLeft, Star, CheckCircle2, XCircle, Clock, Truck, Package, AlertCircle, Loader2, AlertTriangle, Upload, Camera, Bike, Store } from "lucide-react";

const SHOP_ORDER_STATUS = {
  PENDING_PAYMENT:   { label: "Chờ thanh toán",         step: 0, badge: "badge-warning",  Icon: Clock },
  CONFIRMED:         { label: "Đã xác nhận",             step: 1, badge: "badge-primary",  Icon: CheckCircle2 },
  PREPARING:         { label: "Đang chuẩn bị",           step: 2, badge: "badge-warning",  Icon: Package },
  HANDED_TO_SHIPPER: { label: "Đang giao",               step: 3, badge: "badge-primary",  Icon: Truck },
  DELIVERED:         { label: "Đã giao thành công",      step: 5, badge: "badge-success",  Icon: CheckCircle2 },
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

/* Food Review Component */
const ReviewBox = ({ item }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [savedReview, setSavedReview] = useState(item.review || null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item.review) {
      setSavedReview(item.review);
    }
  }, [item.review]);

  const handleSubmit = async () => {
    setSubmitting(true); setError("");
    try {
      const res = await createReview({ order_item_id: item._id, rating, comment });
      setSavedReview(res.review || { rating, comment });
    } catch (err) {
      const msg = err.response?.data?.message || "Gửi đánh giá thất bại";
      if (msg.toLowerCase().includes("đã được gửi đánh giá")) {
        setSavedReview({ rating: 5, comment: comment || "Đã gửi đánh giá trước đó" });
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (savedReview) return (
    <div style={{ padding: "8px 12px", background: "var(--color-primary-pale)", borderRadius: "var(--radius-xs)", fontSize: 13, color: "var(--color-primary)", marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
      <Star size={14} fill="var(--color-primary)" color="var(--color-primary)" /> Đã đánh giá món ăn ({savedReview.rating}/5 ⭐): "{savedReview.comment || 'Ngon hợp vị'}"
    </div>
  );

  return (
    <div style={{ background: "var(--color-cream-mid)", border: "1px solid var(--color-border)", padding: "12px 14px", borderRadius: "var(--radius-sm)", marginTop: 10 }}>
      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700 }}>Đánh giá chất lượng món ăn</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((r) => (
          <button key={r} onClick={() => setRating(r)} type="button" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <Star size={20} fill={r <= rating ? "#C9A15A" : "none"} color={r <= rating ? "#C9A15A" : "var(--color-border)"} />
          </button>
        ))}
      </div>
      <textarea
        className="input" placeholder="Nhận xét của bạn về hương vị món ăn..."
        value={comment} onChange={(e) => setComment(e.target.value)}
        style={{ minHeight: 54, resize: "vertical", marginBottom: 8, fontSize: 13 }}
      />
      {error && <p style={{ color: "var(--color-danger)", fontSize: 12, margin: "0 0 6px" }}>{error}</p>}
      <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
        {submitting ? "Đang gửi..." : "Gửi đánh giá món ăn"}
      </button>
    </div>
  );
};

/* Shipper Review Component */
const ShipperReviewBox = ({ shopOrderId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [savedReview, setSavedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getShipperReview(shopOrderId)
      .then((res) => {
        if (res.review) setSavedReview(res.review);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shopOrderId]);

  const handleSubmit = async () => {
    setSubmitting(true); setError("");
    try {
      const res = await createShipperReview({ shop_order_id: shopOrderId, rating, comment });
      setSavedReview(res.review || { rating, comment });
    } catch (err) {
      setError(err.response?.data?.message || "Gửi đánh giá Shipper thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (savedReview) return (
    <div style={{ padding: "10px 14px", background: "var(--color-primary-pale)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-primary)", marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
      <Bike size={16} /> Đã đánh giá Shipper ({savedReview.rating}/5 ⭐): "{savedReview.comment || 'Tài xế giao nhanh, thân thiện'}"
    </div>
  );

  return (
    <div style={{ background: "var(--color-cream-pale)", border: "1px solid var(--color-border)", padding: "14px 16px", borderRadius: "var(--radius-sm)", marginTop: 14 }}>
      <p style={{ margin: "0 0 8px", fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
        <Bike size={16} color="var(--color-primary)" /> Đánh giá thái độ & tốc độ của Tài xế Shipper
      </p>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((r) => (
          <button key={r} onClick={() => setRating(r)} type="button" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <Star size={20} fill={r <= rating ? "#C9A15A" : "none"} color={r <= rating ? "#C9A15A" : "var(--color-border)"} />
          </button>
        ))}
      </div>
      <input
        className="input" placeholder="Tài xế giao hàng đúng hẹn, lịch sự..."
        value={comment} onChange={(e) => setComment(e.target.value)}
        style={{ marginBottom: 8, fontSize: 13 }}
      />
      {error && <p style={{ color: "var(--color-danger)", fontSize: 12, margin: "0 0 6px" }}>{error}</p>}
      <button onClick={handleSubmit} disabled={submitting} className="btn btn-outline btn-sm" style={{ fontSize: 12 }}>
        {submitting ? "Đang gửi..." : "Gửi đánh giá Shipper"}
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

  /* Complaint modal state */
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintShopOrderId, setComplaintShopOrderId] = useState(null);
  const [targetType, setTargetType] = useState("shop"); // 'shop' | 'shipper'
  const [complaintReason, setComplaintReason] = useState("Giao thiếu món / sai món");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [proofImages, setProofImages] = useState([]);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintMsg, setComplaintMsg] = useState("");

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setProofImages((prev) => [...prev, evt.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setComplaintSubmitting(true);
    try {
      await createReport({
        shop_order_id: complaintShopOrderId,
        target_type: targetType,
        reason: complaintReason,
        description: complaintDesc,
        images: proofImages,
      });
      setComplaintMsg(`Đã gửi khiếu nại (${targetType === "shop" ? "Chủ Quán" : "Tài xế Shipper"}) tới Admin! Admin sẽ xử lý hoàn tiền.`);
      setTimeout(() => {
        setShowComplaintModal(false);
        setComplaintMsg("");
        setComplaintDesc("");
        setProofImages([]);
      }, 1800);
    } catch {
      setComplaintMsg("Gửi khiếu nại thất bại. Vui lòng thử lại!");
    } finally {
      setComplaintSubmitting(false);
    }
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
      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="logout-modal-overlay" onClick={() => setShowComplaintModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, textAlign: "left" }}>
            <h3 style={{ fontSize: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "var(--color-danger)" }}>
              <AlertTriangle size={20} /> Gửi Khiếu nại / Phản ánh đơn hàng
            </h3>

            {complaintMsg && <div className="alert alert-success" style={{ marginBottom: 14, fontSize: 13 }}>{complaintMsg}</div>}

            <form onSubmit={handleSubmitComplaint} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Target Selector */}
              <div className="field">
                <label>Đối tượng khiếu nại *</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className={`btn ${targetType === "shop" ? "btn-primary" : "btn-outline"} btn-sm`}
                    onClick={() => { setTargetType("shop"); setComplaintReason("Giao thiếu món / sai món"); }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Store size={14} /> Khiếu nại Chủ Quán
                  </button>
                  <button
                    type="button"
                    className={`btn ${targetType === "shipper" ? "btn-primary" : "btn-outline"} btn-sm`}
                    onClick={() => { setTargetType("shipper"); setComplaintReason("Shipper có thái độ xấu / không lịch sự"); }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Bike size={14} /> Khiếu nại Tài xế Shipper
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Lý do khiếu nại *</label>
                {targetType === "shop" ? (
                  <select className="input" value={complaintReason} onChange={(e) => setComplaintReason(e.target.value)}>
                    <option value="Giao thiếu món / sai món">Giao thiếu món / sai món</option>
                    <option value="Đồ ăn hư hỏng / đổ vỡ / ôi thiu">Đồ ăn hư hỏng / đổ vỡ / ôi thiu</option>
                    <option value="Chất lượng đồ ăn kém xa quảng cáo">Chất lượng đồ ăn kém xa quảng cáo</option>
                    <option value="Khác">Lý do khác</option>
                  </select>
                ) : (
                  <select className="input" value={complaintReason} onChange={(e) => setComplaintReason(e.target.value)}>
                    <option value="Shipper có thái độ xấu / không lịch sự">Shipper có thái độ xấu / không lịch sự</option>
                    <option value="Giao hàng quá chậm / không đúng giờ">Giao hàng quá chậm / không đúng giờ</option>
                    <option value="Làm đổ vỡ / dập nát hộp đồ ăn">Làm đổ vỡ / dập nát hộp đồ ăn</option>
                    <option value="Thu tiền sai so với tổng đơn">Thu tiền sai so với tổng đơn</option>
                    <option value="Khác">Lý do khác</option>
                  </select>
                )}
              </div>

              <div className="field">
                <label>Mô tả chi tiết sự cố</label>
                <textarea
                  className="input"
                  placeholder="Mô tả sự cố bạn gặp phải..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  style={{ minHeight: 70, resize: "vertical" }}
                />
              </div>

              {/* Upload Proof Images */}
              <div className="field">
                <label>Hình ảnh minh chứng (đổ vỡ, hỏng đồ ăn...)</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {proofImages.map((imgSrc, idx) => (
                    <div key={idx} style={{ position: "relative", width: 60, height: 60, borderRadius: 8, overflow: "hidden", border: "1px solid var(--color-border)" }}>
                      <img src={imgSrc} alt="Proof" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => setProofImages((prev) => prev.filter((_, i) => i !== idx))}
                        style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                    <Camera size={14} /> Thêm ảnh
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowComplaintModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={complaintSubmitting}>
                  {complaintSubmitting ? "Đang gửi..." : "Gửi khiếu nại tới Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            const isCompletedOrDelivered = ["DELIVERED", "COMPLETED"].includes(so.status);

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
                        const isStepDone = i + 1 <= currentStep;
                        const StepIcon = step.Icon;
                        return (
                          <div key={step.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                            {i < STEPS.length - 1 && (
                              <div style={{
                                position: "absolute", top: 15, left: "50%", width: "100%", height: 2,
                                background: i + 1 < currentStep ? "var(--color-success)" : "var(--color-border)", zIndex: 0,
                              }} />
                            )}
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: isStepDone ? "var(--color-success)" : "var(--color-border)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              position: "relative", zIndex: 1,
                            }}>
                              <StepIcon size={14} color="#fff" />
                            </div>
                            <div style={{
                              fontSize: 11, marginTop: 6, textAlign: "center", maxWidth: 60,
                              color: isStepDone ? "var(--color-ink)" : "var(--color-muted)",
                              fontWeight: isStepDone ? 600 : 400,
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
                      {isCompletedOrDelivered && <ReviewBox item={item} />}
                    </div>
                  ))}
                </div>

                {/* Shipper Review Box */}
                {isCompletedOrDelivered && <ShipperReviewBox shopOrderId={so._id} />}

                <div className="divider-dashed" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5, paddingTop: 12 }}>
                  <span className="text-muted">Tạm tính + Ship</span>
                  <span style={{ fontWeight: 600 }}>{(so.subtotal_amount + so.shipping_fee).toLocaleString()}đ</span>
                </div>

                {isCompletedOrDelivered && (
                  <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => {
                        setComplaintShopOrderId(so._id);
                        setShowComplaintModal(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: 12, color: "var(--color-danger)", borderColor: "var(--color-danger)", display: "inline-flex", alignItems: "center", gap: 5 }}
                    >
                      <AlertTriangle size={13} /> Khiếu nại / Phản ánh đơn này
                    </button>
                  </div>
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