import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ShoppingBag, CheckCircle2, ChevronRight, Star, Utensils, Award, ArrowRight } from "lucide-react";
import { listShops } from "../services/shop.service";

/* Import Full Burger PNG Image (original un-cut high-res burger) */
import fullBurgerImg from "../assets/burger.png";

const BURGER_SHOWCASE = {
  id: "burger",
  title: "ALL-STAR DOUBLE BURGER",
  tagline: "BUILT LIKE AN ALL-STAR",
  subtitle: "Vỏ bánh nướng bơ tỏi giòn rụm, 100% bò nướng nhập khẩu hòa quyện cùng thịt xông khói & phô mai đặc biệt.",
  price: "79.000đ",
  badge: "Món Bán Chạy #1",
  layers: [
    { id: 1, name: "Vỏ Bánh Mì Nướng Bơ Tỏi", desc: "Giòn thơm, thơm béo vị bơ nguyên chất" },
    { id: 2, name: "Thịt Xông Khói Giòn Rụm", desc: "Bacon nướng giòn thơm béo ngậy" },
    { id: 3, name: "Cà Chua Tươi Tươi Sạch", desc: "Nông sản Đà Lạt tươi sạch trong ngày" },
    { id: 4, name: "Thịt Bò Nướng Than Hồng", desc: "Thịt bò Úc nhập khẩu 100% mềm ngọt" },
    { id: 5, name: "Rau Xà Lách & Đế Bánh", desc: "Giữ độ nóng hổi và hương vị vẹn toàn" },
  ]
};

const DEFAULT_REAL_FOOD_CARDS = [
  {
    id: "f1",
    shopId: "6ab55af366c83c440a071a2f",
    name: "Burger & Co. Thủ Công",
    tagline: "Combo Bò Nướng 2 Lớp",
    price: "79.000đ",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "f2",
    shopId: "6ab55af266c83c440a0719fb",
    name: "Cơm Tấm Sài Gòn Ba Đình",
    tagline: "Sườn Bì Chả Đặc Biệt",
    price: "55.000đ",
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "f3",
    shopId: "6ab55af466c83c440a071a4f",
    name: "Gà Nướng Honey & BBQ",
    tagline: "Gà Sốt Mật Ong Giòn",
    price: "89.000đ",
    rating: 5.0,
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "f4",
    shopId: "6ab55af366c83c440a071a13",
    name: "Phở Hà Nội Gốc Gia Truyền",
    tagline: "Nước Dùng Đậm Đà 24h",
    price: "60.000đ",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80",
  },
];

const FoodShowcaseSection = () => {
  const [selectedLayerId, setSelectedLayerId] = useState(0); // 0 = none selected
  const [targetShopId, setTargetShopId] = useState("6ab55af366c83c440a071a2f");
  const [featuredCards, setFeaturedCards] = useState(DEFAULT_REAL_FOOD_CARDS);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  const item = BURGER_SHOWCASE;

  // Fetch real shops on mount to match real shop IDs and images from backend
  useEffect(() => {
    listShops()
      .then((data) => {
        const shopsList = data.shops || [];
        if (shopsList.length > 0) {
          // Find a shop selling burger or use first available shop
          const burgerShop = shopsList.find((s) =>
            (s.name || "").toLowerCase().includes("burger")
          ) || shopsList[0];
          setTargetShopId(burgerShop._id);

          // Map real shops into featured food cards
          const realCards = shopsList.slice(0, 4).map((shop, idx) => ({
            id: shop._id,
            shopId: shop._id,
            name: shop.name,
            tagline: shop.address || "Quán Ăn Nổi Bật",
            price: shop.city || "Thực Đơn Đa Dạng",
            rating: shop.rating || 4.9,
            img: shop.cover_url || DEFAULT_REAL_FOOD_CARDS[idx % DEFAULT_REAL_FOOD_CARDS.length].img
          }));
          setFeaturedCards(realCards);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenShopMenu = (shopId) => {
    const idToOpen = shopId || targetShopId;
    if (idToOpen) {
      navigate(`/shops/${idToOpen}`);
    } else {
      const el = document.getElementById("shops-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="showcase-section"
      ref={sectionRef}
      style={{
        background: "linear-gradient(180deg, var(--color-bg) 0%, #F5EDE0 100%)",
        color: "var(--color-ink)",
        padding: "88px 0 72px",
        scrollMarginTop: "90px",
        borderTop: "1px solid var(--color-border-light)",
        borderBottom: "1px solid var(--color-border-light)",
      }}
    >
      <div className="container">
        {/* Header Title — Clean without extra explanations */}
        <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 36px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 16px", borderRadius: 999, background: "var(--color-gold-soft)",
            border: "1px solid var(--color-gold)", color: "#7A5A1E",
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14
          }}>
            <Sparkles size={14} color="var(--color-primary)" /> ALL-STAR BURGER SHOWCASE
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", color: "var(--color-ink)", fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>
            Trải nghiệm từng lớp vị ngon <span style={{ color: "var(--color-primary)" }}>đậm đà tuyệt hảo</span>
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: 15, lineHeight: 1.6 }}>
            Nguyên liệu tươi sạch được chuẩn bị kỳ công mỗi ngày cho chiếc Burger All-Star hoàn hảo.
          </p>
        </div>

        {/* Showcase Card — Full Un-cut Burger PNG Image */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center",
          background: "var(--color-white)", borderRadius: 24, padding: "40px",
          border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)",
          marginBottom: 56
        }}>
          {/* Left: Full Original Un-cut Burger PNG Image */}
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{
              position: "relative", width: "100%", maxWidth: 440, minHeight: 400, margin: "0 auto",
              borderRadius: 24, padding: "32px 20px", background: "var(--color-cream-mid)",
              border: "1px solid var(--color-border-light)", display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center"
            }}>
              {/* Badge Top Left */}
              <div style={{
                position: "absolute", top: 14, left: 14, background: "var(--color-gold)",
                color: "var(--color-primary-dark)", padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", gap: 6, zIndex: 30, boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}>
                <Award size={14} /> {item.badge}
              </div>

              {/* Price Tag Bottom Right */}
              <div style={{
                position: "absolute", bottom: 14, right: 14, background: "var(--color-primary-dark)",
                color: "#fff", padding: "6px 16px", borderRadius: 12, fontSize: 18, fontWeight: 800,
                zIndex: 30, boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
              }}>
                {item.price}
              </div>

              {/* Full Original Burger Image */}
              <div style={{
                position: "relative",
                width: "100%",
                maxWidth: 290,
                margin: "12px 0",
                display: "flex",
                alignItems: "center",
                justify: "center"
              }}>
                <img
                  src={fullBurgerImg}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: 340,
                    display: "block",
                    objectFit: "contain",
                    filter: selectedLayerId > 0
                      ? "drop-shadow(0 0 24px rgba(201,161,90,0.95)) brightness(1.12)"
                      : "drop-shadow(0 10px 22px rgba(0,0,0,0.16))",
                    transform: "none",
                    transition: "all 0.35s ease"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Ingredient Layer List */}
          <div>
            <span style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 800, letterSpacing: 2 }}>
              {item.tagline}
            </span>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: "var(--color-ink)", margin: "6px 0 10px", fontFamily: "var(--font-display)" }}>
              {item.title}
            </h3>
            <p style={{ color: "var(--color-muted)", fontSize: 14.5, marginBottom: 22, lineHeight: 1.6 }}>
              {item.subtitle}
            </p>

            {/* Layer List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {item.layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(isSelected ? 0 : layer.id)}
                    onMouseEnter={() => setSelectedLayerId(layer.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 14,
                      background: isSelected ? "var(--color-gold-soft)" : "var(--color-bg)",
                      border: isSelected ? "2px solid var(--color-gold)" : "1px solid var(--color-border-light)",
                      transform: "none",
                      boxShadow: isSelected ? "0 4px 18px rgba(201,161,90,0.35)" : "none",
                      filter: isSelected ? "brightness(1.04)" : "none",
                      transition: "all 0.25s ease",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: isSelected ? "var(--color-primary)" : "var(--color-primary-pale)",
                      color: isSelected ? "#fff" : "var(--color-primary)",
                      fontWeight: 800, fontSize: 13, display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      {layer.id}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? "var(--color-primary-dark)" : "var(--color-ink)" }}>
                        {layer.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{layer.desc}</div>
                    </div>
                    <CheckCircle2 size={18} color={isSelected ? "var(--color-primary)" : "var(--color-border)"} />
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => handleOpenShopMenu(targetShopId)}
              className="btn btn-primary btn-lg"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5, borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer" }}
            >
              <ShoppingBag size={18} /> Đặt Món Ngay <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodShowcaseSection;
