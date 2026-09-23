import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCheckoutPreview } from "../../services/cart.service";
import { checkout } from "../../services/order.service";
import { createPayment } from "../../services/payment.service";
import { MapPin, Store, CreditCard, ArrowLeft, Lock, Loader2, ChevronRight } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCheckoutPreview()
      .then(setPreview)
      .catch((err) => setError(err.response?.data?.message || "Không tải được thông tin đơn hàng"))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirmCheckout = async () => {
    setProcessing(true); setError("");
    try {
      const orderResult = await checkout();
      const paymentResult = await createPayment(orderResult.order._id);
      window.location.href = paymentResult.paymentUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: "40px 32px" }}>
      <div className="spinner-wrap"><div className="spinner" /><span>Đang tải thông tin đơn hàng...</span></div>
    </div>
  );

  if (error && !preview) return (
    <div className="container" style={{ padding: "60px 32px", maxWidth: 640 }}>
      <div className="alert alert-error">{error}</div>
      <button onClick={() => navigate("/cart")} className="btn btn-outline" style={{ marginTop: 16 }}>← Quay lại giỏ hàng</button>
    </div>
  );

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "60vh", padding: "40px 0 64px" }}>
      <div className="container">
        <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
          <CreditCard size={24} color="var(--color-primary)" />
          Xác nhận đơn hàng
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>

          {/* ── Order details ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Delivery address */}
            <div className="card card-body">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "var(--radius-xs)",
                  background: "var(--color-primary-pale)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MapPin size={17} color="var(--color-primary)" />
                </div>
                <h3 style={{ fontSize: 15 }}>Địa chỉ giao hàng</h3>
              </div>
              <div style={{
                padding: "12px 16px", background: "var(--color-cream)", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)", fontSize: 14, color: "var(--color-muted)",
              }}>
                Địa chỉ giao hàng mặc định của bạn
              </div>
            </div>

            {/* Shop groups */}
            {preview.shopOrders.map((group) => (
              <div key={group.shop_id} className="card card-body">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "var(--radius-xs)",
                    background: "var(--color-cream-mid)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Store size={16} color="var(--color-primary)" />
                  </div>
                  <h4 style={{ fontSize: 14.5 }}>{group.shop_name}</h4>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {group.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>{item.product?.name}</span>
                        {item.variant?.name && <span className="text-muted"> · {item.variant.name}</span>}
                        <span className="text-muted"> ×{item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>{item.line_total.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>

                <div className="divider-dashed" style={{ margin: "12px 0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-muted)" }}>
                    <span>Tạm tính</span><span>{group.subtotal_amount.toLocaleString()}đ</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-muted)" }}>
                    <span>Phí giao hàng</span><span>{group.shipping_fee.toLocaleString()}đ</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                    <span>Tổng shop này</span>
                    <span className="text-primary">{(group.subtotal_amount + group.shipping_fee).toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Payment summary ── */}
          <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card card-body">
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>Tóm tắt thanh toán</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span className="text-muted">Tạm tính</span>
                  <span>{preview.shopOrders.reduce((s, g) => s + g.subtotal_amount, 0).toLocaleString()}đ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span className="text-muted">Phí giao hàng</span>
                  <span>{preview.shopOrders.reduce((s, g) => s + g.shipping_fee, 0).toLocaleString()}đ</span>
                </div>
              </div>

              <div className="divider-dashed" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng cộng</span>
                <span className="text-price" style={{ fontSize: 24 }}>{preview.order_total.toLocaleString()}đ</span>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

              {/* VNPay button */}
              <button
                className="btn btn-block btn-lg"
                onClick={handleConfirmCheckout}
                disabled={processing}
                style={{
                  background: processing ? "var(--color-muted)" : "linear-gradient(135deg, #0055A5 0%, #003475 100%)",
                  color: "#fff", fontSize: 14.5, fontWeight: 700,
                  gap: 10, opacity: processing ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {processing
                  ? <><Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} /> Đang xử lý...</>
                  : <><CreditCard size={17} /> Thanh toán qua VNPay</>
                }
              </button>

              <button className="btn btn-ghost btn-block" onClick={() => navigate("/cart")} disabled={processing} style={{ marginTop: 8 }}>
                <ArrowLeft size={14} style={{ marginRight: 4 }} />
                Quay lại giỏ hàng
              </button>
            </div>

            {/* Security note */}
            <div style={{
              padding: "12px 16px", background: "var(--color-cream)", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)", fontSize: 12.5, color: "var(--color-muted)",
              lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <Lock size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--color-success)" }} />
              Thanh toán bảo mật qua VNPay. Thông tin của bạn được mã hoá an toàn.
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Checkout;