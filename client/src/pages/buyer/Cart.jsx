import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../../services/cart.service";
import { useCart } from "../../context/CartContext";
import { ShoppingCart, Trash2, ChevronRight, UtensilsCrossed, Loader2 } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    try { setCart(await getCart()); }
    catch { setError("Không tải được giỏ hàng. Vui lòng thử lại."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    setUpdatingId(itemId); setError("");
    try { await updateCartItem(itemId, quantity); await fetchCart(); refreshCartCount(); }
    catch (err) { setError(err.response?.data?.message || "Cập nhật thất bại"); }
    finally { setUpdatingId(null); }
  };

  const handleRemove = async (itemId) => {
    setUpdatingId(itemId); setError("");
    try { await removeCartItem(itemId); await fetchCart(); refreshCartCount(); }
    catch { setError("Xoá thất bại"); }
    finally { setUpdatingId(null); }
  };

  if (loading) return (
    <div className="container" style={{ padding: "40px 32px" }}>
      <div className="spinner-wrap"><div className="spinner" /><span>Đang tải giỏ hàng...</span></div>
    </div>
  );

  if (error && !cart) return (
    <div className="container" style={{ padding: "60px 32px" }}>
      <div className="alert alert-error">{error}</div>
    </div>
  );

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "60vh", padding: "40px 0 64px" }}>
      <div className="container">
        <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <ShoppingCart size={26} color="var(--color-primary)" />
          Giỏ hàng của bạn
        </h1>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        {cart.items.length === 0 ? (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div className="card card-body" style={{ textAlign: "center", padding: 56 }}>
              <UtensilsCrossed size={52} style={{ margin: "0 auto 20px", opacity: 0.25, color: "var(--color-muted)" }} />
              <h2 style={{ fontSize: 20, marginBottom: 10 }}>Giỏ hàng đang trống</h2>
              <p className="text-muted" style={{ marginBottom: 28, fontSize: 14 }}>
                Khám phá các quán ăn ngon và thêm món vào giỏ hàng nhé!
              </p>
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                Khám phá quán ăn
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>

            {/* ── Cart items ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.items.map((item) => (
                <div
                  key={item.item_id}
                  className="card card-body"
                  style={{
                    display: "flex", gap: 16, alignItems: "center",
                    opacity: updatingId === item.item_id ? 0.55 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Placeholder */}
                  <div style={{
                    width: 64, height: 64, borderRadius: "var(--radius-sm)",
                    background: "linear-gradient(135deg, var(--color-cream-mid) 0%, var(--color-cream-deep) 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <UtensilsCrossed size={22} color="var(--color-muted)" style={{ opacity: 0.5 }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.product?.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--color-muted)", marginBottom: 5 }}>
                      {item.shop?.name}{item.variant?.name && ` · ${item.variant.name}`}
                    </div>
                    <div className="text-price" style={{ fontSize: 13.5 }}>
                      {item.variant?.price?.toLocaleString()}đ / phần
                    </div>
                  </div>

                  {/* Qty */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => handleUpdateQuantity(item.item_id, item.quantity - 1)} disabled={item.quantity <= 1 || updatingId === item.item_id}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => handleUpdateQuantity(item.item_id, item.quantity + 1)} disabled={updatingId === item.item_id}>+</button>
                    </div>
                    <div style={{ minWidth: 80, textAlign: "right" }}>
                      <div className="text-price" style={{ fontSize: 15 }}>{item.line_total?.toLocaleString()}đ</div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.item_id)}
                      disabled={updatingId === item.item_id}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--color-muted)", padding: "6px", borderRadius: "var(--radius-xs)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "color 0.15s, background 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--color-danger)"; e.currentTarget.style.background = "var(--color-danger-bg)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--color-muted)"; e.currentTarget.style.background = "none"; }}
                      aria-label="Xoá"
                    >
                      {updatingId === item.item_id ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order summary ── */}
            <div className="card card-body" style={{ position: "sticky", top: 80 }}>
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>Tóm tắt đơn hàng</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span className="text-muted">Tạm tính ({cart.items.length} món)</span>
                  <span>{cart.total_amount?.toLocaleString()}đ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span className="text-muted">Phí giao hàng</span>
                  <span style={{ fontSize: 13, color: "var(--color-muted)" }}>Tính khi checkout</span>
                </div>
              </div>
              <div className="divider-dashed" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng cộng</span>
                <span className="text-price" style={{ fontSize: 22 }}>{cart.total_amount?.toLocaleString()}đ</span>
              </div>
              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={() => navigate("/checkout")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                Tiến hành thanh toán <ChevronRight size={17} />
              </button>
              <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 14, fontSize: 13, color: "var(--color-muted)", textDecoration: "none" }}>
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Cart;