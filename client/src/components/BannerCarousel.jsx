import { useState, useEffect } from "react";
import { listPublicBanners } from "../services/banner.service";
import { ChevronLeft, ChevronRight, Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const DEFAULT_BANNERS = [
  {
    _id: "def1",
    title: "Miễn Phí Giao Hàng Đơn Đầu Tiên ✦",
    description: "Nhập mã FOODGO30 giảm ngay 30k phí giao hàng cho tất cả các quán ăn trong thành phố.",
    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop",
    target_url: "/",
  },
  {
    _id: "def2",
    title: "Đại Tiệc Cơm Tấm & Phở Việt",
    description: "Thưởng thức hương vị ẩm thực Việt truyền thống với hàng trăm ưu đãi hấp dẫn hôm nay.",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80&auto=format&fit=crop",
    target_url: "/",
  },
];

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    listPublicBanners()
      .then((data) => {
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        } else {
          setBanners(DEFAULT_BANNERS);
        }
      })
      .catch(() => setBanners(DEFAULT_BANNERS));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners.length) return null;
  const activeBanner = banners[current];

  return (
    <div style={{ padding: "24px 0 12px" }}>
      <div className="container">
        <div
          style={{
            position: "relative",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            height: "clamp(200px, 30vw, 280px)",
            boxShadow: "var(--shadow-md)",
            background: "#111",
          }}
        >
          {/* Background Image */}
          <img
            src={activeBanner.image_url}
            alt={activeBanner.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.65)",
              transition: "opacity 0.4s ease-in-out",
            }}
          />

          {/* Overlay Content */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 70%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 clamp(24px, 5vw, 56px)",
              color: "#fff",
              maxWidth: 620,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--color-gold)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 4,
                marginBottom: 12,
                width: "fit-content",
              }}
            >
              <Tag size={13} /> ƯU ĐÃI NỔI BẬT
            </div>
            <h2 style={{ fontSize: "clamp(20px, 3.5vw, 30px)", fontWeight: 800, marginBottom: 8, color: "#fff", lineHeight: 1.25 }}>
              {activeBanner.title}
            </h2>
            {activeBanner.description && (
              <p style={{ fontSize: "clamp(13px, 2vw, 15px)", opacity: 0.9, marginBottom: 16, lineHeight: 1.5 }}>
                {activeBanner.description}
              </p>
            )}
            <Link
              to={activeBanner.target_url || "/"}
              className="btn btn-gold btn-sm"
              style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
            >
              Khám phá ngay <ArrowRight size={14} />
            </Link>
          </div>

          {/* Nav Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(4px)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrent((c) => (c + 1) % banners.length)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(4px)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots */}
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 24,
                  display: "flex",
                  gap: 6,
                }}
              >
                {banners.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrent(i)}
                    style={{
                      width: i === current ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: i === current ? "var(--color-gold)" : "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;
