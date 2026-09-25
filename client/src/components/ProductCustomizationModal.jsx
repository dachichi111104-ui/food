import { useState, useEffect } from "react";
import { X, ShoppingCart, Plus, Minus, Star, Check, Utensils, Loader2 } from "lucide-react";
import { addToCart } from "../services/cart.service";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductCustomizationModal = ({ product, shop, isOpen, onClose }) => {
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
  const navigate = useNavigate();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      setQuantity(1);
      setNote("");
      setError("");
      setSuccessMsg("");
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : 0;
  const totalPrice = currentPrice * quantity;

  const handleAddToCart = async () => {
    if (!user) {
      onClose();
      navigate("/login");
      return;
    }

    if (!selectedVariant) {
      setError("Vui lòng chọn biến thể món ăn");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await addToCart(selectedVariant._id || selectedVariant.id, quantity);
      setSuccessMsg("Đã thêm vào giỏ hàng!");
      refreshCartCount();
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Thêm vào giỏ hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div
        className="logout-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 460,
          maxHeight: "88vh",
          overflowY: "auto",
          textAlign: "left",
          padding: 0,
          borderRadius: 20,
        }}
      >
        {/* Header Image */}
        <div style={{ position: "relative", height: 180, background: "#f5f5f5" }}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-cream-mid)",
              }}
            >
              <Utensils size={48} color="var(--color-muted)" opacity={0.4} />
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
            <h3 style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>{product.name}</h3>
            {product.average_rating && (
              <span style={{ fontSize: 12, color: "var(--color-gold)", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                <Star size={12} fill="currentColor" /> {product.average_rating}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              {product.description}
            </p>
          )}

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 10 }}>
                Chọn khẩu phần / biến thể:
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?._id === v._id;
                  return (
                    <div
                      key={v._id}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: isSelected
                          ? "2px solid var(--color-primary)"
                          : "1px solid var(--color-border)",
                        background: isSelected ? "var(--color-primary-pale)" : "var(--color-white)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: isSelected
                              ? "5px solid var(--color-primary)"
                              : "2px solid var(--color-border)",
                            background: "var(--color-white)",
                          }}
                        />
                        <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500 }}>
                          {v.name}
                        </span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>
                        {v.price?.toLocaleString()}đ
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Food Note Input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>
              Ghi chú cho món ăn (Tùy chọn):
            </label>
            <input
              className="input"
              placeholder="VD: Ít cay, không hành, xin thêm đá, ngọt vừa..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>

          {/* Quantity Selector */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Số lượng:</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-cream-mid)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: "center" }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-cream-mid)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 12, fontSize: 13 }}>{error}</div>}
          {successMsg && <div className="alert alert-success" style={{ marginBottom: 12, fontSize: 13 }}>{successMsg}</div>}

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="btn btn-primary btn-block"
            style={{
              padding: "12px 20px",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {loading ? <Loader2 size={18} className="spin" /> : <ShoppingCart size={18} />}
              <span>Thêm vào giỏ hàng</span>
            </div>
            <span style={{ fontWeight: 800 }}>{totalPrice.toLocaleString()}đ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizationModal;
