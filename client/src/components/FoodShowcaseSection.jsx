import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ShoppingBag, ChevronRight, Award } from "lucide-react";
import { listShops } from "../services/shop.service";
import BurgerLayers from "./BurgerLayers";

/* Import Full Burger PNG Image */
import fullBurgerImg from "../assets/burger.png";

const BURGER_META = {
  id: "burger",
  title: "ALL-STAR DOUBLE BURGER",
  tagline: "BUILT LIKE AN ALL-STAR",
  subtitle: "Vỏ bánh nướng bơ tỏi giòn rụm, 100% bò nướng nhập khẩu hòa quyện cùng thịt xông khói & phô mai đặc biệt.",
  price: "79.000đ",
  badge: "Món Bán Chạy #1",
};

const FoodShowcaseSection = () => {
  const [targetShopId, setTargetShopId] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  /* Scroll Reveal Observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* Fetch shop chứa món Hamburger */
  useEffect(() => {
    listShops()
      .then((data) => {
        const shopsList = data.shops || [];
        if (shopsList.length > 0) {
          const burgerShop = shopsList.find((s) =>
            (s.name || "").toLowerCase().includes("nhà gạo") ||
            (s.name || "").toLowerCase().includes("ăn vặt") ||
            (s.name || "").toLowerCase().includes("burger")
          ) || shopsList[0];
          setTargetShopId(burgerShop._id);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenShopMenu = () => {
    if (targetShopId) {
      navigate(`/shops/${targetShopId}`);
    } else {
      const el = document.getElementById("lineup-section");
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
        overflow: "hidden",
      }}
    >
      <div className="container">
        {/* Header Title */}
        <div
          style={{
            textAlign: "center",
            maxWidth: 680,
            margin: "0 auto 36px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 16px",
              borderRadius: 999,
              background: "var(--color-gold-soft)",
              border: "1px solid var(--color-gold)",
              color: "#7A5A1E",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            <Sparkles size={14} color="var(--color-primary)" /> ALL-STAR BURGER SHOWCASE
          </div>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              color: "var(--color-ink)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            Trải nghiệm từng lớp vị ngon{" "}
            <span style={{ color: "var(--color-primary)" }}>đậm đà tuyệt hảo</span>
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: 15, lineHeight: 1.6 }}>
            Nguyên liệu tươi sạch được chuẩn bị kỳ công mỗi ngày cho chiếc Burger All-Star hoàn hảo.
          </p>
        </div>

        {/* Main Card Container */}
        <div
          style={{
            background: "var(--color-white)",
            borderRadius: 24,
            padding: "40px",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
          }}
        >
          {/* Header Bar Inside Card */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 28,
              paddingBottom: 20,
              borderBottom: "1px solid var(--color-border-light)",
            }}
          >
            <div>
              <span style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 800, letterSpacing: 2 }}>
                {BURGER_META.tagline}
              </span>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-ink)", margin: "4px 0 0", fontFamily: "var(--font-display)" }}>
                {BURGER_META.title}
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  background: "var(--color-gold)",
                  color: "var(--color-primary-dark)",
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Award size={14} /> {BURGER_META.badge}
              </div>

              <div
                style={{
                  background: "var(--color-primary-dark)",
                  color: "#fff",
                  padding: "6px 16px",
                  borderRadius: 12,
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                {BURGER_META.price}
              </div>

              <button
                onClick={handleOpenShopMenu}
                className="btn btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 20px",
                }}
              >
                <ShoppingBag size={17} /> Đặt Món Ngay <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Standalone BurgerLayers Component */}
          <BurgerLayers src={fullBurgerImg} />
        </div>
      </div>
    </section>
  );
};

export default FoodShowcaseSection;
