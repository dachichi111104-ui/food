import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listShops, listPublicCategories } from "../../services/shop.service";
import { toggleFavorite } from "../../services/favorite.service";
import BannerCarousel from "../../components/BannerCarousel";
import FoodShowcaseSection from "../../components/FoodShowcaseSection";
import HeroScrollSection from "../../components/HeroScrollSection";
import { useAuth } from "../../context/AuthContext";
import {
  Search, MapPin, Star, ChevronRight, Utensils,
  Zap, Shield, Store, ArrowRight, LayoutGrid, Heart, SlidersHorizontal,
  Coffee, Soup, Cake, Flame, Briefcase, Leaf, X, Check
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

const getCategoryIcon = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("cơm văn phòng")) return <Briefcase size={16} />;
  if (n.includes("cơm")) return <Utensils size={16} />;
  if (n.includes("phở") || n.includes("bún")) return <Soup size={16} />;
  if (n.includes("nhanh")) return <Zap size={16} />;
  if (n.includes("trà") || n.includes("uống")) return <Coffee size={16} />;
  if (n.includes("bánh") || n.includes("tráng miệng")) return <Cake size={16} />;
  if (n.includes("gà") || n.includes("bbq")) return <Flame size={16} />;
  if (n.includes("salad") || n.includes("healthy")) return <Leaf size={16} />;
  return <Utensils size={16} />;
};

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

const CITIES = [
  { value: "", label: "Tất cả vị trí" },
  { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
  { value: "Cần Thơ", label: "Cần Thơ" },
];

const Home = () => {
  const { user } = useAuth();
  const [shops, setShops]               = useState([]);
  const [categories, setCategories]     = useState([]);
  const [search, setSearch]             = useState("");
  const [cityFilter, setCityFilter]     = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [catLoading, setCatLoading]     = useState(true);
  const [error, setError]               = useState("");

  /* Advanced Filter State */
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    listPublicCategories()
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const fetchShops = async (searchTerm = "", categoryId = null, city = "") => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryId) params.category_id = categoryId;
      if (city) params.city = city;
      const data = await listShops(params);

      let resultShops = data.shops || [];
      if (minRating > 0) {
        resultShops = resultShops.filter((s) => s.rating >= minRating);
      }
      setShops(resultShops);
    } catch {
      setError("Không tải được danh sách quán ăn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(search, activeCategory?._id || null, cityFilter);
  }, [activeCategory, cityFilter, minRating]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchShops(search, activeCategory?._id || null, cityFilter);
  };

  const handleSelectCategory = (cat) => {
    setActiveCategory((prev) => (prev?._id === cat._id ? null : cat));
    setSearch("");
  };

  const handleReset = () => {
    setActiveCategory(null);
    setSearch("");
    setCityFilter("");
    setMinRating(0);
    setPriceRange("all");
  };

  return (
    <div>
      {/* ── Advanced Filter Modal ── */}
      {showFilterModal && (
        <div className="logout-modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <SlidersHorizontal size={18} color="var(--color-primary)" /> Bộ lọc nâng cao
              </h3>
              <button onClick={() => setShowFilterModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>Xếp hạng đánh giá sao:</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "Tất cả", val: 0 },
                    { label: "Từ 4.0 ★", val: 4.0 },
                    { label: "Từ 4.5 ★", val: 4.5 },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      className={`btn ${minRating === r.val ? "btn-primary" : "btn-outline"} btn-sm`}
                      onClick={() => setMinRating(r.val)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>Khoảng giá bình quân:</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "Tất cả giá", val: "all" },
                    { label: "Dưới 50k", val: "under50" },
                    { label: "50k - 100k", val: "50to100" },
                    { label: "Trên 100k", val: "above100" },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      className={`btn ${priceRange === p.val ? "btn-primary" : "btn-outline"} btn-sm`}
                      onClick={() => setPriceRange(p.val)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={handleReset}>Xóa bộ lọc</button>
              <button className="btn btn-primary" onClick={() => { fetchShops(search, activeCategory?._id, cityFilter); setShowFilterModal(false); }}>
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          HERO SCROLL ANIMATION (GSAP)
      ══════════════════════════════ */}
      <HeroScrollSection />

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Interactive Food Showcase Section (matching ui.mp4) */}
      <FoodShowcaseSection />

      {/* ══════════════════════════════
          CATEGORY PILLS WITH ICONS
      ══════════════════════════════ */}
      {!catLoading && categories.length > 0 && (
        <section style={{
          background: "var(--color-white)", padding: "18px 0",
          borderBottom: "1px solid var(--color-border-light)",
          position: "sticky", top: 64, zIndex: 90,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <div className="container">
            <div className="category-scroll">
              <button
                className={`category-pill${!activeCategory ? " active" : ""}`}
                onClick={handleReset}
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                <span className="category-pill-icon">
                  <LayoutGrid size={16} />
                </span>
                <span>Tất cả</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`category-pill${activeCategory?._id === cat._id ? " active" : ""}`}
                  onClick={() => handleSelectCategory(cat)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}
                >
                  <span className="category-pill-icon">
                    {getCategoryIcon(cat.name)}
                  </span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RESTAURANT GRID (THE LINEUP) */}
      <section id="lineup-section" style={{ padding: "40px 0 72px" }}>
        <div className="container">
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 24, flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <h2>
                {activeCategory
                  ? activeCategory.name
                  : search
                  ? `Kết quả cho "${search}"`
                  : cityFilter
                  ? `Quán ăn tại ${cityFilter}`
                  : "Quán ăn nổi bật"}
              </h2>
            </div>
            {!loading && <span className="text-muted text-sm">{shops.length} quán</span>}
          </div>

          {loading && (
            <div className="grid-restaurants">
              {Array.from({ length: 8 }).map((_, i) => <ShopCardSkeleton key={i} />)}
            </div>
          )}

          {!loading && !error && shops.length > 0 && (
            <div className="grid-restaurants">
              {shops.map((shop) => (
                <Link key={shop._id} to={`/shops/${shop._id}`} className="restaurant-card">
                  <div className="restaurant-card-cover" style={{
                    background: shop.cover_url ? undefined : pickCover(shop._id),
                    position: "relative", overflow: "hidden",
                  }}>
                    {shop.cover_url ? (
                      <img src={shop.cover_url} alt={shop.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <Store size={38} color="rgba(255,255,255,0.25)" style={{ margin: "auto" }} />
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
                          {shop.order_count}+ đơn
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;