import { useState, useEffect, useRef } from "react";
import { Sparkles, ShoppingBag, CheckCircle2, ChevronRight, Star, Flame, Utensils, Award, ArrowRight, MousePointerClick, Layers } from "lucide-react";
import comtamImg from "../assets/comtam.jpg";

const BURGER_IMG = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80";

const SHOWCASE_ITEMS = {
  burger: {
    id: "burger",
    title: "ALL-STAR DOUBLE BURGER",
    tagline: "BUILT LIKE AN ALL-STAR",
    subtitle: "Vỏ bánh nướng bơ tỏi giòn rụm, 100% bò nướng nhập khẩu hòa quyện cùng sốt phô mai đặc biệt.",
    price: "79.000đ",
    badge: "Món Bán Chạy #1",
    img: BURGER_IMG,
    layers: [
      { id: 1, name: "Vỏ Bánh Mì Nướng Bơ Tỏi", desc: "Giòn thơm, thơm béo vị bơ nguyên chất", color: "#E09A45" },
      { id: 2, name: "Sốt Phô Mai Cheddar Béo Ngậy", desc: "Được pha chế theo công thức độc quyền", color: "#F7B52C" },
      { id: 3, name: "Thịt Bò Nướng Than Hồng", desc: "Thịt bò Úc nhập khẩu 100% mềm ngọt", color: "#5C2918" },
      { id: 4, name: "Xà Lách & Cà Chua Tươi", desc: "Nông sản Đà Lạt tươi sạch trong ngày", color: "#4CAF50" },
      { id: 5, name: "Đế Bánh Nướng Giòn Rụm", desc: "Giữ độ nóng hổi và hương vị vẹn toàn", color: "#D48B38" },
    ]
  },
  comtam: {
    id: "comtam",
    title: "CƠM TẤM SƯỜN BÌ CHẢ ĐẶC BIỆT",
    tagline: "HƯƠNG VỊ SÀI GÒN CHUẨN VỊ",
    subtitle: "Sườn nướng mật ong thơm lừng, chả trứng hấp mềm béo & nước mắm kẹo ớt tỏi đậm đà.",
    price: "65.000đ",
    badge: "Signature FoodGo",
    img: comtamImg,
    layers: [
      { id: 1, name: "Mỡ Hành Phi Thơm Giòn", desc: "Hành lá tươi phi mỡ lợn thơm nức", color: "#2E7D32" },
      { id: 2, name: "Sườn Nướng Mật Ong", desc: "Ướp đậm đà 12 tiếng, nướng than hồng", color: "#7B241C" },
      { id: 3, name: "Chả Trứng Hấp & Bì Giòn", desc: "Trứng vịt muối béo ngậy mềm mịn", color: "#F39C12" },
      { id: 4, name: "Nước Mắm Kẹo Tỏi Ớt", desc: "Sóng sánh chuẩn vị truyền thống", color: "#E67E22" },
      { id: 5, name: "Cơm Tấm Hạt Dẻo Nóng", desc: "Gạo tấm thơm dẻo nguyên hạt tuyển chọn", color: "#D7CCC8" },
    ]
  }
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
    name: "CƠM TẤM SƯỜN BÌ CHẢ",
    tagline: "Món Truyền Thống",
    price: "65.000đ",
    rating: 4.8,
    img: comtamImg,
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
  const [activeTab, setActiveTab] = useState("burger");
  const [selectedLayerId, setSelectedLayerId] = useState(0); // 0 = none selected
  const [isIntroExploded, setIsIntroExploded] = useState(true); // Initial scroll explode state
  const sectionRef = useRef(null);

  const item = SHOWCASE_ITEMS[activeTab];

  // Hiệu ứng tự bóc tách trong 2.5 giây đầu khi chọn món hoặc cuộn tới
  useEffect(() => {
    setIsIntroExploded(true);
    setSelectedLayerId(0);
    const timer = setTimeout(() => {
      setIsIntroExploded(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Tự kích hoạt intro explode khi cuộn trang tới section
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

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const selectedLayer = item.layers.find((l) => l.id === selectedLayerId);

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
        {/* Header Title */}
        <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 36px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 16px", borderRadius: 999, background: "var(--color-gold-soft)",
            border: "1px solid var(--color-gold)", color: "#7A5A1E",
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14
          }}>
            <Sparkles size={14} color="var(--color-primary)" /> TRẢI NGHIỆM MÓN ĂN ĐỊNH CAO
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", color: "var(--color-ink)", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
            Khám phá hương vị <span style={{ color: "var(--color-primary)" }}>từng lớp nguyên liệu</span>
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: 15, lineHeight: 1.6 }}>
            Trang web tự động bóc tách thành phần trong 2.5 giây đầu, sau đó bấm chọn từng nguyên liệu để xem hiệu ứng nẩy lên sống động!
          </p>

          {/* Clean Dish Toggle Tabs */}
          <div style={{
            display: "inline-flex", gap: 8, background: "var(--color-white)",
            padding: 6, borderRadius: 999, border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-xs)", marginTop: 20
          }}>
            <button
              onClick={() => handleTabChange("burger")}
              className={`btn ${activeTab === "burger" ? "btn-primary" : "btn-ghost"}`}
              style={{
                borderRadius: 999, padding: "9px 24px", fontSize: 13.5, fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 8
              }}
            >
              <Utensils size={15} /> All-Star Burger
            </button>
            <button
              onClick={() => handleTabChange("comtam")}
              className={`btn ${activeTab === "comtam" ? "btn-primary" : "btn-ghost"}`}
              style={{
                borderRadius: 999, padding: "9px 24px", fontSize: 13.5, fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 8
              }}
            >
              <Flame size={15} /> Cơm Tấm Sài Gòn
            </button>
          </div>
        </div>

        {/* Interactive Showcase Card — Image Spotlight + Animated Exploded Slices */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center",
          background: "var(--color-white)", borderRadius: 24, padding: "40px",
          border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)",
          marginBottom: 56
        }}>
          {/* Left: High-res Food Image with Interactive Layer Slice Highlights */}
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{
              position: "relative", width: "100%", maxWidth: 440, height: 380, margin: "0 auto",
              borderRadius: 24, overflow: "hidden", boxShadow: "0 16px 36px rgba(78, 17, 25, 0.14)",
              border: "1px solid var(--color-border-light)", background: "var(--color-cream-mid)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {/* Main Dish Photo */}
              <img
                src={item.img}
                alt={item.title}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  transform: isIntroExploded
                    ? "scale(1.08)"
                    : selectedLayerId > 0
                    ? "scale(1.05) translateY(-6px)"
                    : "scale(1)",
                  transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  filter: isIntroExploded ? "brightness(0.92)" : "none"
                }}
              />

              {/* Badge Top Left */}
              <div style={{
                position: "absolute", top: 16, left: 16, background: "var(--color-gold)",
                color: "var(--color-primary-dark)", padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", gap: 6, zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}>
                <Award size={14} /> {item.badge}
              </div>

              {/* Price Tag Bottom Right */}
              <div style={{
                position: "absolute", bottom: 16, right: 16, background: "var(--color-primary-dark)",
                color: "#fff", padding: "6px 16px", borderRadius: 12, fontSize: 18, fontWeight: 800,
                zIndex: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
              }}>
                {item.price}
              </div>

              {/* Initial Intro Exploded Floating Slices Layer */}
              {isIntroExploded && (
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(36,21,18,0.55)",
                  backdropFilter: "blur(4px)", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 10, zIndex: 8,
                  padding: 20, transition: "opacity 0.5s ease"
                }}>
                  <div style={{
                    color: "var(--color-gold)", fontSize: 12, fontWeight: 800, letterSpacing: 1.5,
                    textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 6
                  }}>
                    <Layers size={15} /> TỰ ĐỘNG BÓC TÁCH NGUYÊN LIỆU...
                  </div>
                  {item.layers.map((layer) => (
                    <div
                      key={layer.id}
                      style={{
                        background: `linear-gradient(135deg, ${layer.color} 0%, rgba(36,21,18,0.9) 100%)`,
                        color: "#fff", padding: "8px 18px", borderRadius: 12, fontSize: 12.5, fontWeight: 700,
                        width: "80%", textAlign: "center", border: "1px solid rgba(255,255,255,0.3)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        animation: `bounceIntro 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${layer.id * 0.1}s both`
                      }}
                    >
                      {layer.id}. {layer.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Single Selected Ingredient Spotlight Badge */}
              {!isIntroExploded && selectedLayer && (
                <div style={{
                  position: "absolute", bottom: 16, left: 16,
                  background: "rgba(36,21,18,0.90)", backdropFilter: "blur(8px)",
                  color: "#fff", padding: "10px 16px", borderRadius: 14,
                  display: "flex", alignItems: "center", gap: 10, zIndex: 12,
                  border: "2px solid var(--color-gold)",
                  boxShadow: "0 8px 24px rgba(201,161,90,0.4)",
                  animation: "bounceIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", background: "var(--color-gold)",
                    color: "#1F080C", fontSize: 12, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {selectedLayer.id}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-gold)" }}>
                      NẨY NGUYÊN LIỆU: {selectedLayer.name}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{selectedLayer.desc}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ fontSize: 11.5, color: "var(--color-muted)", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <MousePointerClick size={14} color="var(--color-primary)" /> Bấm chọn nguyên liệu bên phải để xem nguyên liệu tương ứng nẩy lên
            </div>
          </div>

          {/* Right: Ingredient Layer List with Click & Hover Bounce Interactions */}
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
                      transform: isSelected ? "translateX(10px) scale(1.02)" : "none",
                      boxShadow: isSelected ? "0 6px 18px rgba(201,161,90,0.3)" : "none",
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

      <style>{`
        @keyframes bounceIntro {
          0% { transform: translateY(-20px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.85) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default FoodShowcaseSection;
