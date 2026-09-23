import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getProductDetail } from "../../services/product.service";
import { addToCart } from "../../services/cart.service";
import { listReviewsByProduct } from "../../services/review.service";
import { Star, ShoppingCart, ArrowLeft, Store, Utensils, Package, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const StarRating = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={14}
        fill={n <= Math.round(rating) ? "#C9A15A" : "none"}
        color={n <= Math.round(rating) ? "#C9A15A" : "var(--color-border)"}
      />
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
  const [data, setData] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getProductDetail(id);
        setData(result);
        setSelectedVariant(result.variants[0]?._id || null);
        const reviews = await listReviewsByProduct(id);
        setReviewData(reviews);
      } catch (err) {
        setError(err.response?.data?.message || "Không tải được sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    setError(""); setMessage(""); setAddingToCart(true);
    try {
      await addToCart(selectedVariant, quantity);
      setMessage("Đã thêm vào giỏ hàng thành công!");
      refreshCartCount();
    } catch (err) {
      setError(err.response?.data?.message || "Thêm giỏ hàng thất bại");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: "40px 32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div className="skeleton" style={{ height: 320, borderRadius: "var(--radius-lg)" }} />
        <div>
          <div className="skeleton skeleton-text-lg" style={{ width: "80%", marginBottom: 12 }} />
          <div className="skeleton skeleton-text" style={{ width: "50%", marginBottom: 24 }} />
          <div className="skeleton skeleton-text-lg" style={{ width: "30%", marginBottom: 32 }} />
          <div className="skeleton" style={{ height: 48, borderRadius: "var(--radius-sm)" }} />
        </div>
      </div>
    </div>
  );

  if (error && !data) return (
    <div className="container" style={{ padding: "60px 32px" }}>
      <div className="alert alert-error">{error}</div>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginTop: 16 }}>← Quay lại</button>
    </div>
  );

  const variant = data.variants.find((v) => v._id === selectedVariant);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "60vh" }}>
      <div className="container" style={{ padding: "40px 32px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 28, fontSize: 13, color: "var(--color-muted)" }}>
          <Link to="/" style={{ color: "var(--color-muted)", textDecoration: "none" }}>Trang chủ</Link>
          <span style={{ opacity: 0.5 }}>›</span>
          <Link to={`/shops/${data.shop._id}`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>{data.shop.name}</Link>
          <span style={{ opacity: 0.5 }}>›</span>
          <span style={{ color: "var(--color-ink)" }}>{data.product.name}</span>
        </div>

        {/* 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>

          {/* ── LEFT: Image ── */}
          <div>
            <div style={{
              background: "linear-gradient(135deg, var(--color-cream-mid) 0%, var(--color-cream-deep) 100%)",
              borderRadius: "var(--radius-lg)", height: 300,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid var(--color-border)", overflow: "hidden",
            }}>
              <Utensils size={72} color="var(--color-cream-deep)" style={{ opacity: 0.5 }} />
            </div>

            {/* Shop card */}
            <Link to={`/shops/${data.shop._id}`} style={{
              display: "flex", alignItems: "center", gap: 14, marginTop: 18,
              padding: "14px 16px", background: "var(--color-white)",
              border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)",
              textDecoration: "none", transition: "box-shadow 0.2s ease",
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: "var(--radius-sm)",
                background: "var(--color-cream-mid)", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <Store size={20} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-ink)" }}>{data.shop.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Xem thực đơn →</div>
              </div>
            </Link>
          </div>

          {/* ── RIGHT: Info ── */}
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <h1 style={{ fontSize: "clamp(20px, 3vw, 26px)", lineHeight: 1.3 }}>{data.product.name}</h1>
              {reviewData?.average_rating > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginTop: 4 }}>
                  <span className="badge badge-rating" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={11} fill="currentColor" />
                    {reviewData.average_rating.toFixed(1)}
                  </span>
                  <span className="text-muted text-xs">({reviewData.total})</span>
                </div>
              )}
            </div>

            {data.product.description && (
              <p style={{ color: "var(--color-muted)", fontSize: 14.5, lineHeight: 1.75, marginBottom: 24 }}>
                {data.product.description}
              </p>
            )}

            {/* Price */}
            {variant && (
              <div style={{ marginBottom: 24 }}>
                <div className="text-price" style={{ fontSize: 30 }}>
                  {variant.price.toLocaleString()}đ
                </div>
                <div style={{ marginTop: 8 }}>
                  {variant.available > 0 ? (
                    <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <CheckCircle2 size={12} /> Còn {variant.available} phần
                    </span>
                  ) : (
                    <span className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <XCircle size={12} /> Hết hàng
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Variant selector */}
            {data.variants.length > 1 && (
              <div className="field" style={{ marginBottom: 20 }}>
                <label>Chọn loại</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {data.variants.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => v.available > 0 && setSelectedVariant(v._id)}
                      disabled={v.available <= 0}
                      style={{
                        padding: "8px 16px", borderRadius: "var(--radius-sm)",
                        border: `2px solid ${selectedVariant === v._id ? "var(--color-primary)" : "var(--color-border)"}`,
                        background: selectedVariant === v._id ? "var(--color-primary-pale)" : "var(--color-white)",
                        color: selectedVariant === v._id ? "var(--color-primary)" : v.available <= 0 ? "var(--color-muted)" : "var(--color-ink)",
                        cursor: v.available <= 0 ? "not-allowed" : "pointer",
                        fontSize: 13.5, fontWeight: 600,
                        opacity: v.available <= 0 ? 0.5 : 1,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {v.name}
                      {v.available <= 0 && <span style={{ marginLeft: 4, fontWeight: 400 }}>(Hết)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {data.variants.length === 1 && data.variants[0] && (
              <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 600 }}>Loại:</span>
                <span style={{
                  padding: "6px 14px", background: "var(--color-primary-pale)",
                  color: "var(--color-primary)", borderRadius: "var(--radius-sm)",
                  fontSize: 13.5, fontWeight: 600, border: "1.5px solid var(--color-primary)",
                }}>
                  {data.variants[0].name}
                </span>
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 600 }}>Số lượng:</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => quantity > 1 && setQuantity(q => q - 1)} disabled={quantity <= 1}>−</button>
                <span className="qty-num">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              {variant?.available > 0 && (
                <span className="text-muted text-sm">Tổng: {(variant.price * quantity).toLocaleString()}đ</span>
              )}
            </div>

            {message && (
              <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} /> {message}
              </div>
            )}
            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {user?.role === "buyer" ? (
                <button
                  onClick={handleAddToCart}
                  disabled={!variant || variant.available <= 0 || addingToCart}
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", gap: 8 }}
                >
                  {addingToCart
                    ? <><Loader2 size={16} className="spin-icon" /> Đang thêm...</>
                    : <><ShoppingCart size={16} /> Thêm vào giỏ hàng</>
                  }
                </button>
              ) : (
                <button onClick={() => navigate("/login")} className="btn btn-primary" style={{ flex: 1, minWidth: 160 }}>
                  Đăng nhập để đặt món
                </button>
              )}
              {user?.role === "buyer" && (
                <Link to="/cart" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ShoppingCart size={15} /> Xem giỏ hàng
                </Link>
              )}
            </div>

            {!user && (
              <p style={{ marginTop: 12, fontSize: 13, color: "var(--color-muted)" }}>
                <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Đăng ký</Link>{" "}
                hoặc{" "}
                <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>đăng nhập</Link>{" "}
                để tiếp tục đặt món.
              </p>
            )}
          </div>
        </div>

        {/* ── Reviews ── */}
        <div style={{ marginTop: 56 }}>
          <div className="divider" />
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Đánh giá ({reviewData?.total || 0})</h2>

          {reviewData?.reviews?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviewData.reviews.map((r) => (
                <div key={r._id} className="card card-body">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", background: "var(--color-cream-deep)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 14, color: "var(--color-primary)",
                      }}>
                        {(r.user_id?.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{r.user_id?.name || "Người dùng"}</div>
                        <StarRating rating={r.rating} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--color-muted)", flexShrink: 0 }}>
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{ marginTop: 10, fontSize: 14, color: "var(--color-ink)", lineHeight: 1.65, paddingLeft: 46 }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <div style={{ marginBottom: 12 }}><Star size={32} style={{ opacity: 0.3, margin: "0 auto" }} /></div>
              <div className="empty-state-title" style={{ fontSize: 16 }}>Chưa có đánh giá</div>
              <p className="empty-state-desc">Hãy là người đầu tiên đánh giá món này!</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 0.8s linear infinite; }
        @media (max-width: 768px) {
          .product-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;