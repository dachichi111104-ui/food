import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listMyOrders, reorder } from "../../services/order.service";
import { createPayment } from "../../services/payment.service";
import { useCart } from "../../context/CartContext";
import {
  ClipboardList,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  CreditCard,
  Loader2,
  RotateCcw,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: "Chờ thanh toán VNPay", badge: "badge-warning", Icon: Clock },
  UNPAID_COD:      { label: "Chưa thanh toán (COD)", badge: "badge-warning", Icon: Clock },
  PAID:            { label: "Đã thanh toán",         badge: "badge-success", Icon: CheckCircle2 },
  CANCELLED:       { label: "Đã hủy",                 badge: "badge-danger",  Icon: XCircle },
  COMPLETED:       { label: "Hoàn tất",                badge: "badge-success", Icon: CheckCircle2 },
};

const getStatusConfig = (order) => {
  if (order.status === "UNPAID_COD" || (order.payment_method === "COD" && order.status !== "CANCELLED" && order.status !== "COMPLETED")) {
    return { label: "Chưa thanh toán (COD)", badge: "badge-warning", Icon: Clock };
  }
  return STATUS_CONFIG[order.status] || { label: order.status, badge: "", Icon: Package };
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [reorderingOrderId, setReorderingOrderId] = useState(null);

  useEffect(() => {
    listMyOrders().then((data) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  const handleRetryPayment = async (orderId) => {
    setPayingOrderId(orderId);
    try {
      const res = await createPayment(orderId);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Không thể kết nối đến cổng VNPay. Vui lòng thử lại!");
      setPayingOrderId(null);
    }
  };

  const handleReorder = async (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();
    setReorderingOrderId(orderId);
    try {
      await reorder(orderId);
      await refreshCartCount();
      navigate("/cart");
    } catch (err) {
      alert(err.response?.data?.message || "Không thể mua lại đơn này. Món ăn có thể đã hết hàng!");
      setReorderingOrderId(null);
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: "40px 32px" }}>
      <div className="spinner-wrap"><div className="spinner" /><span>Đang tải đơn hàng...</span></div>
    </div>
  );

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "60vh", padding: "40px 0 64px" }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <ClipboardList size={24} color="var(--color-primary)" />
          Lịch sử đơn hàng
        </h1>

        {orders.length === 0 ? (
          <div className="card card-body" style={{ padding: 64, textAlign: "center" }}>
            <ClipboardList size={48} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--color-muted)" }} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>Chưa có đơn hàng nào</div>
            <p className="text-muted" style={{ marginBottom: 28, fontSize: 14 }}>
              Đặt món ngay để trải nghiệm dịch vụ của FoodGo!
            </p>
            <Link to="/" className="btn btn-primary">Khám phá quán ăn</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.map((order) => {
              const { label, badge, Icon } = getStatusConfig(order);
              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="card card-body card-hoverable"
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "var(--radius-sm)",
                        background: "var(--color-cream-mid)", display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon size={20} color="var(--color-muted)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--color-ink)", marginBottom: 3, display: "flex", alignItems: "center", gap: 8 }}>
                          <span>Đơn #{order._id.slice(-8).toUpperCase()}</span>
                          <span className={`badge ${order.payment_method === "COD" ? "badge-gold" : "badge-outline"}`} style={{ fontSize: 10, padding: "2px 6px" }}>
                            {order.payment_method === "COD" ? "COD" : "VNPAY"}
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--color-muted)" }}>
                          {new Date(order.createdAt).toLocaleString("vi-VN", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      {order.status === "PENDING_PAYMENT" && order.payment_method !== "COD" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRetryPayment(order._id);
                          }}
                          disabled={payingOrderId === order._id}
                          className="btn btn-primary btn-sm"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            padding: "6px 12px",
                            fontWeight: 700,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          }}
                        >
                          {payingOrderId === order._id ? (
                            <Loader2 size={13} className="spin" />
                          ) : (
                            <CreditCard size={13} />
                          )}
                          {payingOrderId === order._id ? "Đang kết nối..." : "Thanh toán lại"}
                        </button>
                      )}
                      {/* Nút Mua lại đơn */}
                      <button
                        type="button"
                        onClick={(e) => handleReorder(e, order._id)}
                        disabled={reorderingOrderId === order._id}
                        className="btn btn-outline btn-sm"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 12,
                          padding: "6px 12px",
                          fontWeight: 700,
                        }}
                      >
                        {reorderingOrderId === order._id ? (
                          <Loader2 size={13} className="spin" />
                        ) : (
                          <RotateCcw size={13} />
                        )}
                        {reorderingOrderId === order._id ? "Đang thêm..." : "Mua lại"}
                      </button>

                      <span className={`badge ${badge}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span className="badge-dot" />{label}
                      </span>
                      <div className="text-price" style={{ fontSize: 17 }}>
                        {order.total_amount.toLocaleString()}đ
                      </div>
                      <ChevronRight size={18} color="var(--color-muted)" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;