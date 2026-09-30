import { useState, useEffect, useRef } from "react";
import { Sparkles, ShoppingBag, CheckCircle2, ChevronRight, Star, Utensils, Award, ArrowRight, MousePointerClick } from "lucide-react";

/* Import Burger PNG Layer Cutouts (created directly from burger.png / media_1790710681463.png) */
import b1 from "../assets/burger/layer1_top_bun.png";
import b2 from "../assets/burger/layer2_bacon.png";
import b3 from "../assets/burger/layer3_tomatoes.png";
import b4 from "../assets/burger/layer4_patty.png";
import b5 from "../assets/burger/layer5_bottom.png";

const BURGER_SHOWCASE = {
  id: "burger",
  title: "ALL-STAR DOUBLE BURGER",
  tagline: "BUILT LIKE AN ALL-STAR",
  subtitle: "Vỏ bánh nướng bơ tỏi giòn rụm, 100% bò nướng nhập khẩu hòa quyện cùng thịt xông khói & phô mai đặc biệt.",
  price: "79.000đ",
  badge: "Món Bán Chạy #1",
  layers: [
    { id: 1, name: "Vỏ Bánh Mì Nướng Bơ Tỏi", desc: "Giòn thơm, thơm béo vị bơ nguyên chất", img: b1 },
    { id: 2, name: "Thịt Xông Khói Giòn Rụm", desc: "Bacon nướng giòn thơm béo ngậy", img: b2 },
    { id: 3, name: "Cà Chua Tươi Tươi Sạch", desc: "Nông sản Đà Lạt tươi sạch trong ngày", img: b3 },
    { id: 4, name: "Thịt Bò Nướng Than Hồng", desc: "Thịt bò Úc nhập khẩu 100% mềm ngọt", img: b4 },
    { id: 5, name: "Rau Xà Lách & Đế Bánh", desc: "Giữ độ nóng hổi và hương vị vẹn toàn", img: b5 },
  ]
};

const FEATURED_FOOD_CARDS = [
  {
    id: "f1",
    name: "FREE THROW BURGER",
    tagline: "Combo Đầy Đủ",
    price: "69.000đ",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "f2",
    name: "LAYUP BURGER COMBO",
    tagline: "Khuyến Mãi Hot",
    price: "85.000đ",
    rating: 5.0,
    img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "f3",
    name: "HOOK SHOT BURGER",
    tagline: "Món Nổi Bật",
    price: "75.000đ",
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "f4",
    name: "PHỞ BÒ ĐẶC BIỆT",
    tagline: "Nước Dùng Đậm Đà",
    price: "60.000đ",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=500&q=80",
  },
];

const FoodShowcaseSection = () => {
  const [selectedLayerId, setSelectedLayerId] = useState(0); // 0 = none selected
  const [isIntroExploded, setIsIntroExploded] = useState(true); // 2.5s intro explode state
  const sectionRef = useRef(null);

  const item = BURGER_SHOWCASE;

  // Initial 2.5s explode intro on load / mount
  useEffect(() => {
    setIsIntroExploded(true);
    setSelectedLayerId(0);
    const timer = setTimeout(() => {
      setIsIntroExploded(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Trigger 2.5s intro explode when scrolling section into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsIntroExploded(true);
          setTimeout(() => setIsIntroExploded(false), 2500);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "linear-gradient(180deg, var(--color-bg) 0%, #F5EDE0 100%)",
        color: "var(--color-ink)",
        padding: "56px 0 64px",
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

        {/* Showcase Card — 5 Cutout PNG Layers Display */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center",
          background: "var(--color-white)", borderRadius: 24, padding: "40px",
          border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)",
          marginBottom: 56
        }}>
          {/* Left: 5 Cutout PNG Layer Images from burger.png */}
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{
              position: "relative", width: "100%", maxWidth: 440, height: 460, margin: "0 auto",
              borderRadius: 24, padding: 20, background: "var(--color-cream-mid)",
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

              {/* Stack of 5 Isolated Cutout PNG Ingredient Images */}
              <div style={{
                position: "relative", width: 260, height: 360,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
              }}>
                {item.layers.map((layer, idx) => {
                  const isSelected = selectedLayerId === layer.id;
                  const selectedIdx = item.layers.findIndex(l => l.id === selectedLayerId);
                  const isHoveredOrSelected = selectedIdx !== -1;

                  // 1. Initial 2.5s Intro: start exploded in mid-air, then smoothly collapse into complete burger!
                  // Assembled compact top positions (tight complete burger): idx * 28 + 80
                  // Exploded intro top positions (mid-air spread): idx * 52 + 30
                  let baseTop = isIntroExploded ? (idx * 52 + 30) : (idx * 28 + 80);

                  let translateY = 0;
                  let translateX = 0;

                  // 2. When an ingredient is selected/hovered:
                  // Open a clean focus gap (upper layers -24px, lower layers +24px)
                  // so the selected ingredient NEVER covers adjacent layers!
                  if (isHoveredOrSelected) {
                    if (idx < selectedIdx) {
                      translateY = -24; // Upper layers shift UP away from selected item
                    } else if (idx > selectedIdx) {
                      translateY = 24;  // Lower layers shift DOWN away from selected item
                    } else {
                      translateX = 22;  // Selected ingredient slides out RIGHT into clean spotlight space
                      translateY = 0;
                    }
                  }

                  const scale = isSelected ? 1.06 : isIntroExploded ? 1.02 : 1;
                  const zIndex = isSelected ? 30 : 10 - idx;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerId(isSelected ? 0 : layer.id)}
                      onMouseEnter={() => setSelectedLayerId(layer.id)}
                      style={{
                        position: "absolute",
                        top: baseTop,
                        width: 175,
                        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        cursor: "pointer",
                        zIndex: zIndex,
                        filter: isSelected
                          ? "drop-shadow(0 8px 20px rgba(201,161,90,0.95)) brightness(1.08)"
                          : isIntroExploded
                          ? "drop-shadow(0 4px 10px rgba(0,0,0,0.12))"
                          : "drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                      }}
                    >
                      {/* Transparent PNG Ingredient Layer Image */}
                      <img
                        src={layer.img}
                        alt={layer.name}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                          objectFit: "contain",
                          pointerEvents: "auto"
                        }}
                      />

                      {/* Floating Badge on Selected Layer */}
                      {isSelected && (
                        <div style={{
                          position: "absolute",
                          top: -6,
                          right: -10,
                          background: "var(--color-primary-dark)",
                          color: "#fff",
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 800,
                          border: "1.5px solid var(--color-gold)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                          whiteSpace: "nowrap",
                          animation: "bounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        }}>
                          <span style={{ color: "var(--color-gold)" }}>{layer.id}.</span> {layer.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Banner */}
              <div style={{
                fontSize: 11.5, color: "var(--color-muted)", marginTop: 16,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}>
                <MousePointerClick size={14} color="var(--color-primary)" /> Bấm chọn từng nguyên liệu để xem lớp vị nẩy lên nhẹ nhàng
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
                      transform: isSelected ? "translateX(8px)" : "none",
                      boxShadow: isSelected ? "0 4px 14px rgba(201,161,90,0.25)" : "none",
                      transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
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

            <a
              href="#shops-section"
              className="btn btn-primary btn-lg"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5, borderRadius: "var(--radius-sm)" }}
            >
              <ShoppingBag size={18} /> Đặt Món Ngay <ChevronRight size={16} />
            </a>
          </div>
        </div>

        {/* Featured Food Cards Section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
                Món Ăn Nổi Bật & Combo Khuyến Mãi
              </h3>
              <p className="text-muted" style={{ fontSize: 13.5 }}>Các món ăn đang được ưa chuộng nhất tuần này</p>
            </div>
            <a href="#shops-section" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Xem tất cả <ArrowRight size={14} />
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {FEATURED_FOOD_CARDS.map((card) => (
              <div key={card.id} className="card card-hoverable" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: 160, width: "100%", background: "var(--color-cream-mid)" }}>
                  <img src={card.img} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{
                    position: "absolute", top: 10, left: 10, background: "rgba(36,21,18,0.8)",
                    color: "#fff", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700
                  }}>
                    {card.tagline}
                  </span>
                  <span className="badge badge-rating" style={{ position: "absolute", top: 10, right: 10 }}>
                    <Star size={11} fill="currentColor" /> {card.rating}
                  </span>
                </div>

                <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-ink)", marginBottom: 4, fontFamily: "var(--font-display)" }}>
                      {card.name}
                    </h4>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)" }}>
                      {card.price}
                    </div>
                  </div>

                  <a
                    href="#shops-section"
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: 14, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5 }}
                  >
                    <ShoppingBag size={14} /> Xem Thực Đơn Quán
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodShowcaseSection;
