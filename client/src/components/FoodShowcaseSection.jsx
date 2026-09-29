import { useState } from "react";
import { Sparkles, ShoppingBag, Layers, CheckCircle2, ChevronRight, Star, Flame } from "lucide-react";

const SHOWCASE_ITEMS = {
  burger: {
    id: "burger",
    title: "ALL-STAR DOUBLE BURGER",
    tagline: "BUILT LIKE AN ALL-STAR",
    subtitle: "Vỏ bánh nướng bơ tỏi, Bò nhập khẩu 100% hòa quyện cùng sốt Phô mai đặc biệt.",
    price: "79.000đ",
    badge: "Món Bán Chạy #1",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    layers: [
      { name: "Vỏ Bánh Mì Nướng Bơ", desc: "Giòn thơm béo ngậy" },
      { name: "Sốt Phô Mai Cheddar", desc: "Tan chảy đậm đà" },
      { name: "Thịt Bò Nướng Than", desc: "Bò Úc nhập khẩu 100%" },
      { name: "Xà Lách & Cà Chua Tươi", desc: "Nông sản Đà Lạt tươi sạch" },
      { name: "Đế Bánh Mì Nướng Giòn", desc: "Giữ độ ấm lâu" },
    ]
  },
  comtam: {
    id: "comtam",
    title: "CƠM TẤM SƯỜN BÌ CHẢ ĐẶC BIỆT",
    tagline: "HƯƠNG VỊ SÀI GÒN CHUẨN VỊ",
    subtitle: "Sườn nướng mật ong thơm lừng, chả trứng hấp mềm béo & nước mắm kẹo ớt tỏi.",
    price: "65.000đ",
    badge: "Signature FoodGo",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    layers: [
      { name: "Mỡ Hành Phi Thơm", desc: "Hành lá tươi phi mỡ lợn giòn" },
      { name: "Sườn Nướng Mật Ong", desc: "Ướp 12 tiếng nướng than hồng" },
      { name: "Chả Trứng Hấp & Bì Giòn", desc: "Trứng vịt muối thơm béo" },
      { name: "Nước Mắm Kẹo Tỏi Ớt", desc: "Pha chế theo công thức gia truyền" },
      { name: "Cơm Tấm Hạt Dẻo Nóng", desc: "Gạo tấm thơm dẻo nguyên hạt" },
    ]
  }
};

const FoodShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState("burger");
  const item = SHOWCASE_ITEMS[activeTab];

  return (
    <section style={{
      background: "linear-gradient(160deg, #1C0A0D 0%, #3B1218 50%, #17080A 100%)",
      color: "#fff",
      padding: "60px 0",
      position: "relative",
      overflow: "hidden",
      borderTop: "1px solid rgba(201,161,90,0.2)",
      borderBottom: "1px solid rgba(201,161,90,0.2)",
    }}>
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        {/* Header Title */}
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 36px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "4px 14px", borderRadius: 999, background: "rgba(201,161,90,0.15)",
            border: "1px solid rgba(201,161,90,0.3)", color: "var(--color-gold)",
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12
          }}>
            <Sparkles size={14} /> TRẢI NGHIỆM MÓN ĂN ĐỈNH CAO
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", color: "#fff", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
            Khám phá hương vị <span style={{ color: "var(--color-gold)" }}>từng lớp thành phần</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14.5 }}>
            Bấm chọn món ăn bên dưới để trải nghiệm cấu trúc thành phần nguyên liệu độc quyền được chuẩn bị kỳ công.
          </p>

          {/* Toggle Buttons */}
          <div style={{
            display: "inline-flex", gap: 8, background: "rgba(0,0,0,0.4)",
            padding: 6, borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)",
            marginTop: 20
          }}>
            <button
              onClick={() => setActiveTab("burger")}
              className={`btn ${activeTab === "burger" ? "btn-gold" : "btn-ghost"}`}
              style={{
                borderRadius: 999, padding: "8px 20px", fontSize: 13.5, fontWeight: 700,
                color: activeTab === "burger" ? "#1F080C" : "rgba(255,255,255,0.8)"
              }}
            >
              🍔 All-Star Burger
            </button>
            <button
              onClick={() => setActiveTab("comtam")}
              className={`btn ${activeTab === "comtam" ? "btn-gold" : "btn-ghost"}`}
              style={{
                borderRadius: 999, padding: "8px 20px", fontSize: 13.5, fontWeight: 700,
                color: activeTab === "comtam" ? "#1F080C" : "rgba(255,255,255,0.8)"
              }}
            >
              🍛 Cơm Tấm Sài Gòn
            </button>
          </div>
        </div>

        {/* Interactive Showcase Box */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center",
          background: "rgba(255,255,255,0.04)", borderRadius: 24, padding: "40px",
          border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)"
        }}>
          {/* Left: Food Image & Floating Badges */}
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{
              position: "relative", width: "100%", maxWidth: 420, height: 340, margin: "0 auto",
              borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
            }}>
              <img
                src={item.img}
                alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
              />
              <div style={{
                position: "absolute", top: 16, left: 16, background: "var(--color-gold)",
                color: "#1A080B", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", gap: 5
              }}>
                <Flame size={14} /> {item.badge}
              </div>
              <div style={{
                position: "absolute", bottom: 16, right: 16, background: "rgba(0,0,0,0.75)",
                color: "#fff", padding: "6px 14px", borderRadius: 12, fontSize: 18, fontWeight: 800,
                border: "1px solid rgba(255,255,255,0.2)"
              }}>
                {item.price}
              </div>
            </div>
          </div>

          {/* Right: Exploded Layer Ingredients Detail */}
          <div>
            <span style={{ fontSize: 12, color: "var(--color-gold)", fontWeight: 800, letterSpacing: 2 }}>
              {item.tagline}
            </span>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "6px 0 10px" }}>
              {item.title}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              {item.subtitle}
            </p>

            {/* Layer List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {item.layers.map((layer, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", background: "var(--color-gold)",
                    color: "#1F080C", fontWeight: 800, fontSize: 12, display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{layer.name}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)" }}>{layer.desc}</div>
                  </div>
                  <CheckCircle2 size={16} color="var(--color-gold)" />
                </div>
              ))}
            </div>

            <a
              href="#shops-section"
              className="btn btn-gold btn-lg"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5 }}
            >
              <ShoppingBag size={18} /> Đặt Món Ngay <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodShowcaseSection;
