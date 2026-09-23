import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listShops, listPublicCategories } from "../../services/shop.service";
import {
  Search, MapPin, Star, ChevronRight, Utensils,
  Zap, Shield, Store, ArrowRight, LayoutGrid,
} from "lucide-react";

/* ── Gradients cho shop card placeholder ── */
const COVER_GRADIENTS = [
  "linear-gradient(135deg, #3D1A0E 0%, #7A3020 100%)",
  "linear-gradient(135deg, #1A2E1A 0%, #2E5A2E 100%)",
  "linear-gradient(135deg, #1A1A3D 0%, #2E2E7A 100%)",
  "linear-gradient(135deg, #3D2E1A 0%, #7A5A20 100%)",
  "linear-gradient(135deg, #3D1A2E 0%, #7A2050 100%)",
];
const pickCover = (id) =>
  COVER_GRADIENTS[id.charCodeAt(id.length - 1) % COVER_GRADIENTS.length];

/* ── Skeleton card ── */
const ShopCardSkeleton = () => (
  <div className="restaurant-card" style={{ pointerEvents: "none" }}>
    <div className="skeleton" style={{ height: 148 }} />
    <div className="restaurant-card-body">
      <div className="skeleton skeleton-text-lg" style={{ width: "70%", marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: "55%", marginBottom: 12 }} />
      <div className="skeleton skeleton-text-sm" style={{ width: "30%" }} />
    </div>
  </div>
);

const Home = () => {
  const [shops, setShops]               = useState([]);
  const [categories, setCategories]     = useState([]);
  const [search, setSearch]             = useState("");
  const [activeCategory, setActiveCategory] = useState(null); // { _id, name }
  const [loading, setLoading]           = useState(true);
  const [catLoading, setCatLoading]     = useState(true);
  const [error, setError]               = useState("");

  /* ── Fetch categories một lần ── */
  useEffect(() => {
    listPublicCategories()
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  /* ── Fetch shops — khi search hoặc category thay đổi ── */
  const fetchShops = async (searchTerm = "", categoryId = null) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (searchTerm)  params.search      = searchTerm;
      if (categoryId)  params.category_id = categoryId;
      const data = await listShops(params);
      setShops(data.shops || []);
    } catch {
      setError("Không tải được danh sách quán ăn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops("", activeCategory?._id || null);
  }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchShops(search, activeCategory?._id || null);
  };

  const handleSelectCategory = (cat) => {
    // Toggle: click lại category đang active → bỏ chọn
    setActiveCategory((prev) => (prev?._id === cat._id ? null : cat));
    setSearch(""); // xoá search khi đổi category
  };

  const handleReset = () => {
    setActiveCategory(null);
    setSearch("");
  };

  return (
    <div>
      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="panel-hero" style={{ padding: "72px 0 80px" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 580 }}>
            <p style={{
              color: "var(--color-gold)", fontWeight: 700, fontSize: 12,
              letterSpacing: "2px", textTransform: "uppercase", marginBottom: 18,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 24, height: 1, background: "var(--color-gold)", display: "inline-block" }} />
              Giao hàng tận nơi · Nhanh chóng · Tiện lợi
            </p>

            <h1 style={{
              fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 700, color: "#fff",
              lineHeight: 1.15, marginBottom: 18,
            }}>
              Thèm món gì?<br />
              <em style={{ color: "var(--color-gold)", fontStyle: "italic" }}>FoodGo lo.</em>
            </h1>

            <p style={{
              color: "rgba(255,255,255,0.76)", fontSize: 16.5, lineHeight: 1.7,
              marginBottom: 36, maxWidth: 440,
            }}>
              Khám phá hàng trăm quán ăn ngon quanh bạn — đặt món trong vài giây, giao tận cửa.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch}>
              <div style={{
                display: "flex", gap: 0, maxWidth: 500,
                background: "#fff", borderRadius: "var(--radius-pill)",
                padding: "5px 5px 5px 20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
              }}>
                <Search size={18} style={{ color: "var(--color-muted)", flexShrink: 0, alignSelf: "center", marginRight: 10 }} />
                <input
                  type="text"
                  placeholder="Tìm quán ăn, món ăn..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    flex: 1, border: "none", outline: "none", fontSize: 15,
                    color: "var(--color-ink)", background: "transparent", padding: "4px 0",
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: "var(--radius-pill)", padding: "11px 24px", fontSize: 14 }}>
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, marginTop: 36 }}>
              {[
                { num: "500+", label: "Quán đối tác" },
                { num: "50K+", label: "Đơn mỗi tháng" },
                { num: "15+",  label: "Quận phục vụ" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--color-gold)" }}>
                    {s.num}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative */}
        <div style={{
          position: "absolute", right: "7%", top: "50%", transform: "translateY(-50%)",
          fontSize: "clamp(80px, 11vw, 130px)", opacity: 0.12, userSelect: "none",
          pointerEvents: "none", filter: "blur(1px)",
        }}>✦</div>
      </section>

      {/* ══════════════════════════════
          CATEGORY PILLS — dữ liệu thật từ DB
      ══════════════════════════════ */}
      {!catLoading && categories.length > 0 && (
        <section style={{
          background: "var(--color-white)", padding: "20px 0",
          borderBottom: "1px solid var(--color-border-light)",
          position: "sticky", top: 64, zIndex: 90,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <div className="container">
            <div className="category-scroll">
              {/* "Tất cả" pill */}
              <button
                className={`category-pill${!activeCategory ? " active" : ""}`}
                onClick={handleReset}
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                <span className="category-pill-icon">
                  <LayoutGrid size={17} />
                </span>
                <span>Tất cả</span>
              </button>

              {/* Category pills thật từ backend */}
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`category-pill${activeCategory?._id === cat._id ? " active" : ""}`}
                  onClick={() => handleSelectCategory(cat)}
                >
                  <span className="category-pill-icon">
                    <Utensils size={15} />
                  </span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          RESTAURANT LIST
      ══════════════════════════════ */}
      <section style={{ background: "var(--color-bg)", padding: "36px 0 64px" }}>
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>
                {activeCategory
                  ? activeCategory.name
                  : search
                  ? `Kết quả cho "${search}"`
                  : "Quán ăn nổi bật"}
              </h2>
              {activeCategory && (
                <button
                  onClick={handleReset}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--color-muted)", fontSize: 13, padding: 0,
                    display: "flex", alignItems: "center", gap: 4, marginTop: 4,
                  }}
                >
                  ← Xem tất cả quán
                </button>
              )}
            </div>
            {!loading && (
              <span className="text-muted text-sm">{shops.length} quán</span>
            )}
          </div>

          {error && (
            <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>{error}</span>
              <button
                onClick={() => fetchShops(search, activeCategory?._id || null)}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 600 }}
              >
                Thử lại
              </button>
            </div>
          )}

          {loading && (
            <div className="grid-restaurants">
              {Array.from({ length: 8 }).map((_, i) => <ShopCardSkeleton key={i} />)}
            </div>
          )}

          {!loading && !error && shops.length > 0 && (
            <div className="grid-restaurants">
              {shops.map((shop) => (
                <Link key={shop._id} to={`/shops/${shop._id}`} className="restaurant-card">
                  {/* Cover — ảnh thật nếu có, fallback gradient */}
                  <div className="restaurant-card-cover" style={{
                    background: shop.cover_url ? undefined : pickCover(shop._id),
                    position: "relative", overflow: "hidden",
                  }}>
                    {shop.cover_url ? (
                      <img src={shop.cover_url} alt={shop.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <>
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)" }} />
                        <Store size={38} color="rgba(255,255,255,0.25)"
                          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                      </>
                    )}
                  </div>

                  <div className="restaurant-card-body">
                    <div className="restaurant-card-name">{shop.name}</div>

                    {shop.address && (
                      <div className="restaurant-card-meta" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={11} style={{ flexShrink: 0 }} />
                        {shop.address}
                      </div>
                    )}

                    <div className="restaurant-card-footer">
                      {shop.rating > 0 ? (
                        <span className="badge badge-rating" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Star size={11} fill="currentColor" />
                          {shop.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="badge" style={{ background: "var(--color-cream-mid)", color: "var(--color-muted)", fontSize: 11 }}>
                          Mới
                        </span>
                      )}

                      {shop.order_count > 0 && (
                        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                          {shop.order_count >= 1000
                            ? `${(shop.order_count / 1000).toFixed(1)}k`
                            : shop.order_count}+ đơn
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && shops.length === 0 && (
            <div className="empty-state">
              <div style={{ marginBottom: 16 }}>
                <Search size={40} style={{ opacity: 0.35, margin: "0 auto", color: "var(--color-muted)" }} />
              </div>
              <div className="empty-state-title">
                {activeCategory
                  ? `Chưa có quán nào trong danh mục "${activeCategory.name}"`
                  : "Không tìm thấy quán phù hợp"}
              </div>
              <p className="empty-state-desc">
                <button
                  onClick={handleReset}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)", fontWeight: 600, padding: 0 }}
                >
                  Xem tất cả quán
                </button>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════
          STORY SECTION
      ══════════════════════════════ */}
      <section style={{ background: "var(--color-primary-dark)", padding: "72px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <p style={{ color: "var(--color-gold)", fontWeight: 700, fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 24, height: 1, background: "var(--color-gold)", display: "inline-block" }} />
                Câu chuyện FoodGo
              </p>
              <h2 style={{ color: "#fff", fontSize: "clamp(24px, 3vw, 34px)", lineHeight: 1.3, marginBottom: 20 }}>
                Bắt đầu từ điều<br />rất đơn giản
              </h2>
              <p style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8, fontSize: 15, marginBottom: 24 }}>
                FoodGo ra đời từ một câu hỏi đơn giản: làm sao để những quán ăn nhỏ, những gánh hàng
                quen thuộc trong khu phố có thể đến gần hơn với thực khách?
              </p>
              <p style={{ color: "rgba(255,255,255,0.52)", lineHeight: 1.8, fontSize: 14, marginBottom: 36 }}>
                Chúng tôi xây dựng nền tảng này để mọi chủ quán — dù lớn hay nhỏ — đều có cơ hội được
                nhiều người biết đến, và để mỗi bữa ăn đến tay bạn đều còn nguyên vẹn hương vị.
              </p>
              <Link to="/about" className="btn btn-outline-white" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Đọc thêm <ArrowRight size={15} />
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { Icon: Store,  title: "Hỗ trợ quán nhỏ",    desc: "Giúp các chủ quán tiếp cận hàng nghìn khách hàng mới mỗi ngày." },
                { Icon: Zap,    title: "Đặt món cực nhanh",   desc: "Từ lúc chọn món đến lúc xác nhận đơn chỉ mất 60 giây." },
                { Icon: Shield, title: "Thanh toán an toàn",  desc: "Tích hợp VNPay, đảm bảo giao dịch bảo mật tuyệt đối." },
              ].map(({ Icon, title, desc }) => (
                <div key={title} style={{
                  display: "flex", gap: 16, alignItems: "flex-start",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "var(--radius-md)", padding: "18px 20px",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "var(--radius-xs)",
                    background: "rgba(201,161,90,0.15)", border: "1px solid rgba(201,161,90,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={18} color="var(--color-gold)" />
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{title}</div>
                    <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 13.5, lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA STRIP
      ══════════════════════════════ */}
      <section style={{ background: "var(--color-gold-pale)", borderTop: "1px solid var(--color-gold-soft)", padding: "48px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 22, marginBottom: 10, color: "var(--color-ink)" }}>
            Bạn là chủ quán? Hãy cùng FoodGo phát triển!
          </h2>
          <p style={{ color: "var(--color-muted)", marginBottom: 28, fontSize: 14.5 }}>
            Đăng ký đối tác — miễn phí — và tiếp cận hàng chục nghìn khách hàng ngay hôm nay.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Đăng ký bán hàng ngay <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;