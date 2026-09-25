import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getShop } from "../../services/shop.service";
import { listProducts } from "../../services/product.service";
import { toggleFavorite, checkIsFavorite } from "../../services/favorite.service";
import ProductCustomizationModal from "../../components/ProductCustomizationModal";
import { useAuth } from "../../context/AuthContext";
import { MapPin, Star, Utensils, ChevronRight, Store, ArrowLeft, Heart, ShoppingCart } from "lucide-react";

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #3D1A0E 0%, #7A3020 100%)",
  "linear-gradient(135deg, #1A2E1A 0%, #2E5A2E 100%)",
  "linear-gradient(135deg, #1A1A3D 0%, #2E2E7A 100%)",
  "linear-gradient(135deg, #3D2E1A 0%, #7A5A20 100%)",
  "linear-gradient(135deg, #3D1A2E 0%, #7A2050 100%)",
];
const pickGradient = (id) => COVER_GRADIENTS[id.charCodeAt(id.length - 1) % COVER_GRADIENTS.length];

const ProductCardSkeleton = () => (
  <div className="food-card" style={{ pointerEvents: "none" }}>
    <div className="skeleton" style={{ height: 120 }} />
    <div className="food-card-body">
      <div className="skeleton skeleton-text-lg" style={{ width: "75%", marginBottom: 6 }} />
      <div className="skeleton skeleton-text-sm" style={{ width: "45%", marginBottom: 10 }} />
      <div className="skeleton skeleton-text" style={{ width: "35%" }} />
    </div>
  </div>
);

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const shopData = await getShop(id);
        const productData = await listProducts({ shop_id: id });
        setShop(shopData.shop);
        setProducts(productData.products);

        if (user) {
          try {
            const favRes = await checkIsFavorite(id);
            setIsFav(favRes.isFavorite);
          } catch {
            // guest or error
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không tải được thông tin quán ăn");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleToggleFav = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const res = await toggleFavorite(id);
      setIsFav(res.isFavorite);
    } catch {
      // ignore
    }
  };

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
      <div className="container" style={{ padding: "24px 32px 48px" }}>
        <div className="skeleton skeleton-text-lg" style={{ width: "40%", marginBottom: 12 }} />
        <div className="skeleton skeleton-text" style={{ width: "60%", marginBottom: 8 }} />
        <div className="skeleton skeleton-text-sm" style={{ width: "30%", marginBottom: 40 }} />
        <div className="grid-food">
          {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container" style={{ padding: "60px 32px" }}>
      <div className="alert alert-error">{error}</div>
      <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>← Quay về trang chủ</Link>
    </div>
  );

  return (
    <div>
      {/* Quick Add Customization Modal */}
      <ProductCustomizationModal
        product={selectedProduct}
        shop={shop}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />

      {/* ── Cover Banner ── */}
      <div style={{
        background: shop.cover_url ? "#111" : pickGradient(shop._id),
        height: 220,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 16, left: 24, zIndex: 10 }}>
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        {/* Favorite Heart Button */}
        <div style={{ position: "absolute", top: 16, right: 24, zIndex: 10 }}>
          <button
            onClick={handleToggleFav}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
            title={isFav ? "Xoá khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <Heart
              size={20}
              fill={isFav ? "var(--color-danger)" : "none"}
              color={isFav ? "var(--color-danger)" : "var(--color-ink)"}
            />
          </button>
        </div>

        {shop.cover_url ? (
          <img src={shop.cover_url} alt={shop.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.8)" }} />
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
            <Store size={64} color="rgba(255,255,255,0.20)"
              style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          </>
        )}
      </div>

      {/* ── Shop Info Strip ── */}
      <div style={{ background: "var(--color-white)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container" style={{ padding: "24px 32px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", marginBottom: 8 }}>{shop.name}</h1>
              <p style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={14} style={{ flexShrink: 0 }} />
                {shop.address || "Đang cập nhật địa chỉ"}
              </p>
              {shop.description && (
                <p style={{ fontSize: 14, color: "var(--color-muted)", maxWidth: 500, lineHeight: 1.65, marginTop: 8 }}>
                  {shop.description}
                </p>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 24, flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--color-primary)" }}>
                  <Star size={18} fill="var(--color-gold)" color="var(--color-gold)" />
                  {shop.rating ? shop.rating.toFixed(1) : "Mới"}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>Đánh giá</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--color-border)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--color-ink)" }}>
                  {products.length}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>Món</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--color-border)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--color-ink)" }}>
                  {shop.order_count > 0 ? `${shop.order_count}+` : "—"}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>Đơn đã phục vụ</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--color-border)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--color-success)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-success)", display: "inline-block" }} />
                  Đang hoạt động
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Menu ── */}
      <div style={{ background: "var(--color-bg)", padding: "36px 0 64px" }}>
        <div className="container">
          <div className="section-heading">
            <h2>Thực đơn</h2>
            {products.length > 0 && <span className="text-muted text-sm">{products.length} món</span>}
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <div style={{ marginBottom: 16 }}><Utensils size={40} style={{ opacity: 0.4, margin: "0 auto" }} /></div>
              <div className="empty-state-title">Chưa có món ăn</div>
              <p className="empty-state-desc">Quán này chưa cập nhật thực đơn.</p>
            </div>
          ) : (
            <div className="grid-food">
              {products.map((product) => {
                const minPrice = product.variants?.[0]?.price;
                return (
                  <div key={product._id} className="food-card" style={{ position: "relative" }}>
                    <Link to={`/products/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="food-card-img" style={{
                        background: product.image_url
                          ? "#f5f5f5"
                          : "linear-gradient(135deg, var(--color-cream-mid) 0%, var(--color-cream-deep) 100%)",
                        alignItems: "center", justifyContent: "center",
                        overflow: "hidden", position: "relative",
                      }}>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : (
                          <Utensils size={28} color="var(--color-cream-deep)" style={{ opacity: 0.6 }} />
                        )}
                      </div>
                    </Link>

                    <div className="food-card-body">
                      <Link to={`/products/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="food-card-name">{product.name}</div>
                        {product.description && (
                          <div style={{
                            fontSize: 12, color: "var(--color-muted)", marginBottom: 8,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}>
                            {product.description}
                          </div>
                        )}
                      </Link>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10 }}>
                        {minPrice && (
                          <div className="food-card-price">
                            Từ {minPrice.toLocaleString()}đ
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                          {product.average_rating && (
                            <span style={{ fontSize: 11, color: "var(--color-gold)", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                              <Star size={10} fill="currentColor" />
                              {product.average_rating}
                            </span>
                          )}

                          {/* Quick Add Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className="btn btn-primary btn-sm"
                            style={{
                              borderRadius: "50%",
                              width: 32,
                              height: 32,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Thêm món nhanh"
                          >
                            <ShoppingCart size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;