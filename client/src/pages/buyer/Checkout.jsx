import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCheckoutPreview } from "../../services/cart.service";
import { checkout } from "../../services/order.service";
import { createPayment } from "../../services/payment.service";
import { listAddresses } from "../../services/address.service";
import { applyVoucher, listPublicVouchers } from "../../services/voucher.service";
import {
  MapPin, Store, CreditCard, ArrowLeft, Lock, Loader2, ChevronRight,
  Plus, Check, Tag, Banknote, FileText, CheckCircle2, AlertCircle
} from "lucide-react";

import { useCart } from "../../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  const [preview, setPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("VNPAY"); // 'VNPAY' | 'COD'

  /* Vouchers */
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [publicVouchers, setPublicVouchers] = useState([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const previewData = await getCheckoutPreview();
        setPreview(previewData);

        const addrData = await listAddresses();
        setAddresses(addrData.addresses || []);
        const defaultAddr = (addrData.addresses || []).find((a) => a.is_default) || addrData.addresses?.[0];
        if (defaultAddr) setSelectedAddress(defaultAddr);

        const vData = await listPublicVouchers();
        setPublicVouchers(vData.vouchers || []);
      } catch (err) {
        setError(err.response?.data?.message || "Không tải được thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleApplyVoucherCode = async (codeToApply) => {
    const code = codeToApply || voucherCode;
    if (!code || !preview) return;

    setVoucherLoading(true);
    setVoucherError("");
    try {
      const subtotal = preview.shopOrders.reduce((s, g) => s + g.subtotal_amount, 0);
      const res = await applyVoucher({
        code,
        order_subtotal: subtotal,
      });
      setAppliedVoucher(res);
      setVoucherCode(res.code);
    } catch (err) {
      setVoucherError(err.response?.data?.message || "Mã ưu đãi không hợp lệ");
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const handleConfirmCheckout = async () => {
    setProcessing(true);
    setError("");

    try {
      // 1. Tạo order tổng
      const orderPayload = {
        payment_method: paymentMethod,
        recipient_name: selectedAddress?.recipient_name || "",
        recipient_phone: selectedAddress?.recipient_phone || "",
        shipping_address: selectedAddress?.full_address || "",
      };
      const orderResult = await checkout(orderPayload);
      refreshCartCount();

      // 2. COD hay VNPay
      if (paymentMethod === "COD") {
        navigate(`/payment-result?vnp_ResponseCode=00&cod=true&order_id=${orderResult.order._id}`);
      } else {
        const paymentResult = await createPayment(orderResult.order._id);
        window.location.href = paymentResult.paymentUrl;
      }
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

  const subtotal = preview.shopOrders.reduce((s, g) => s + g.subtotal_amount, 0);
  const totalShipping = preview.shopOrders.reduce((s, g) => s + g.shipping_fee, 0);
  const discount = appliedVoucher ? appliedVoucher.discount_amount : 0;
  const finalTotal = Math.max(0, subtotal + totalShipping - discount);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "60vh", padding: "40px 0 64px" }}>
      <div className="container">
        <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <CreditCard size={26} color="var(--color-primary)" />
          Xác nhận & Thanh toán
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>

          {/* ── LEFT: Delivery Address, Notes, Items, Payment Method ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* 1. Address Selection */}
            <div className="card card-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "var(--radius-xs)",
                    background: "var(--color-primary-pale)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <MapPin size={18} color="var(--color-primary)" />
                  </div>
                  <h3 style={{ fontSize: 16, margin: 0 }}>Địa chỉ giao hàng</h3>
                </div>
                <Link to="/profile" className="btn btn-ghost btn-sm" style={{ fontSize: 12.5 }}>
                  <Plus size={13} /> Quản lý địa chỉ
                </Link>
              </div>

              {addresses.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress?._id === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddress(addr)}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "var(--radius-sm)",
                          border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                          background: isSelected ? "var(--color-primary-pale)" : "var(--color-white)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="badge badge-gold" style={{ fontSize: 10 }}>{addr.label}</span>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{addr.recipient_name}</span>
                            <span className="text-muted" style={{ fontSize: 13 }}>({addr.recipient_phone})</span>
                          </div>
                          {isSelected && <CheckCircle2 size={16} color="var(--color-primary)" />}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.5 }}>
                          {addr.full_address}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="alert alert-warning" style={{ fontSize: 13 }}>
                  Bạn chưa có địa chỉ lưu sẵn. <Link to="/profile" style={{ fontWeight: 700 }}>Thêm địa chỉ ngay</Link> để nhận hàng nhanh nhất.
                </div>
              )}

              {/* Delivery Note for Shipper */}
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <FileText size={14} color="var(--color-muted)" />
                  Lưu ý cho tài xế giao hàng (Không bắt buộc)
                </label>
                <input
                  className="input"
                  placeholder="VD: Hẻm nhỏ, gọi trước khi tới, tòa nhà A tầng 5..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  style={{ fontSize: 13 }}
                />
              </div>
            </div>

            {/* 2. Payment Method Options */}
            <div className="card card-body">
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Phương thức thanh toán</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  onClick={() => setPaymentMethod("VNPAY")}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: paymentMethod === "VNPAY" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: paymentMethod === "VNPAY" ? "var(--color-primary-pale)" : "var(--color-white)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: paymentMethod === "VNPAY" ? "6px solid var(--color-primary)" : "2px solid var(--color-border)",
                    background: "#fff",
                  }} />
                  <CreditCard size={20} color="#0055A5" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>Thanh toán qua Ví / Thẻ VNPay (Sandbox)</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Hỗ trợ thẻ ATM nội địa, QR Code, Visa/Mastercard</div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("COD")}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: paymentMethod === "COD" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: paymentMethod === "COD" ? "var(--color-primary-pale)" : "var(--color-white)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: paymentMethod === "COD" ? "6px solid var(--color-primary)" : "2px solid var(--color-border)",
                    background: "#fff",
                  }} />
                  <Banknote size={20} color="var(--color-success)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>Thanh toán khi nhận hàng (COD)</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Trả tiền mặt trực tiếp cho shipper khi nhận được đồ ăn</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Shop items review */}
            {preview.shopOrders.map((group) => (
              <div key={group.shop_id} className="card card-body">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Store size={16} color="var(--color-primary)" />
                  <h4 style={{ fontSize: 15, margin: 0 }}>{group.shop_name}</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {group.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{item.product?.name}</span>
                        {item.variant?.name && <span className="text-muted"> · {item.variant.name}</span>}
                        <span className="text-muted"> ×{item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>{item.line_total.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── RIGHT: Voucher & Order Summary ── */}
          <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Voucher Box */}
            <div className="card card-body">
              <h3 style={{ fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Tag size={16} color="var(--color-gold)" /> Mã khuyến mãi / Voucher
              </h3>

              {appliedVoucher ? (
                <div style={{
                  padding: "10px 14px", background: "var(--color-gold-pale)", borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-gold-soft)", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--color-warning)", fontSize: 14 }}>{appliedVoucher.code}</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Giảm -{appliedVoucher.discount_amount.toLocaleString()}đ</div>
                  </div>
                  <button onClick={handleRemoveVoucher} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", fontSize: 12, fontWeight: 700 }}>
                    Gỡ bỏ
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Nhập mã voucher..."
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      style={{ fontSize: 13, textTransform: "uppercase" }}
                    />
                    <button
                      onClick={() => handleApplyVoucherCode()}
                      disabled={voucherLoading || !voucherCode.trim()}
                      className="btn btn-gold btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      {voucherLoading ? <Loader2 size={14} className="spin" /> : "Áp dụng"}
                    </button>
                  </div>

                  {publicVouchers.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 700 }}>Voucher khả dụng:</span>
                      {publicVouchers.slice(0, 3).map((v) => (
                        <div
                          key={v._id}
                          onClick={() => handleApplyVoucherCode(v.code)}
                          style={{
                            padding: "6px 10px", borderRadius: 4, background: "var(--color-cream-mid)",
                            fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
                            cursor: "pointer", border: "1px dashed var(--color-border)",
                          }}
                        >
                          <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{v.code}</span>
                          <span className="text-muted" style={{ fontSize: 11 }}>
                            Giảm {v.discount_type === "PERCENT" ? `${v.discount_value}%` : `${v.discount_value.toLocaleString()}đ`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {voucherError && <div className="alert alert-error" style={{ marginTop: 10, fontSize: 12 }}>{voucherError}</div>}
            </div>

            {/* Summary Box */}
            <div className="card card-body">
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Tổng cộng đơn hàng</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span className="text-muted">Tạm tính</span>
                  <span>{subtotal.toLocaleString()}đ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span className="text-muted">Phí giao hàng</span>
                  <span>{totalShipping.toLocaleString()}đ</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--color-success)" }}>
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString()}đ</span>
                  </div>
                )}
              </div>

              <div className="divider-dashed" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Thanh toán</span>
                <span className="text-price" style={{ fontSize: 24 }}>{finalTotal.toLocaleString()}đ</span>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 14, fontSize: 13 }}>{error}</div>}

              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handleConfirmCheckout}
                disabled={processing}
                style={{
                  fontSize: 15, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {processing ? (
                  <><Loader2 size={18} className="spin" /> Đang tạo đơn...</>
                ) : paymentMethod === "COD" ? (
                  <><Banknote size={18} /> Đặt đơn hàng (COD)</>
                ) : (
                  <><CreditCard size={18} /> Thanh toán VNPay</>
                )}
              </button>

              <button
                className="btn btn-ghost btn-block"
                onClick={() => navigate("/cart")}
                disabled={processing}
                style={{ marginTop: 10, fontSize: 13 }}
              >
                ← Quay lại giỏ hàng
              </button>
            </div>

            <div style={{
              padding: "10px 14px", background: "var(--color-cream)", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)", fontSize: 12, color: "var(--color-muted)",
              lineHeight: 1.5, display: "flex", alignItems: "center", gap: 6,
            }}>
              <Lock size={13} color="var(--color-success)" /> Cam kết bảo mật & thông tin đơn hàng đầy đủ.
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;