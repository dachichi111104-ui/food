import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShoppingBag, ChevronRight, Sparkles, CheckCircle2,
  ArrowDown, Info, ShieldCheck, ChevronUp
} from "lucide-react";

/* ── Import Burger Layer PNGs ── */
import topBunImg from "../assets/burger/layer1_top_bun.png";
import baconImg from "../assets/burger/layer2_bacon.png";
import tomatoesImg from "../assets/burger/layer3_tomatoes.png";
import pattyImg from "../assets/burger/layer4_patty.png";
import bottomBunImg from "../assets/burger/layer5_bottom.png";

gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════════════════════════════════════
   CÁC LỚP BURGER TỪ DƯỚI LÊN TRÊN (BOTTOM TO TOP)
   ════════════════════════════════════════════════════════════════════════════ */
export const BURGER_LAYERS = [
  {
    index: 0,
    key: "bun-duoi",
    name: "Đế Bánh Mì Nướng Bơ",
    desc: "Đế bánh nướng giòn rụm giữ nhiệt độ và vị bơ thơm lừng.",
    img: bottomBunImg,
    yPercent: 180, // Offset di chuyển xuống khi tách
  },
  {
    index: 1,
    key: "thit-bo",
    name: "Thịt Bò Úc Nướng Than Hồng",
    desc: "100% bò Úc nhập khẩu ướp sốt tiêu đen, nướng mọng nước.",
    img: pattyImg,
    yPercent: 90,
  },
  {
    index: 2,
    key: "ca-chua-rau",
    name: "Cà Chua & Rau Xà Lách Tươi",
    desc: "Nông sản Đà Lạt tươi sạch thu hoạch trong ngày.",
    img: tomatoesImg,
    yPercent: 0,
  },
  {
    index: 3,
    key: "pho-mai-bacon",
    name: "Thịt Xông Khói & Phô Mai Cheddar",
    desc: "Bacon nướng giòn quyện phô mai Cheddar tan chảy.",
    img: baconImg,
    yPercent: -90,
  },
  {
    index: 4,
    key: "bun-tren",
    name: "Vỏ Bánh Mì Mè Bơ Tỏi",
    desc: "Vỏ bánh mè nướng bơ tỏi thơm giòn đậm đà.",
    img: topBunImg,
    yPercent: -180,
  },
];

const HeroScrollSection = () => {
  const containerRef = useRef(null);
  const pinRef = useRef(null);
  const heroBgRef = useRef(null);

  /* Titles */
  const titleStage1Ref = useRef(null);
  const titleStage2Ref = useRef(null);

  /* Layer Images & Labels */
  const burgerWrapperRef = useRef(null);
  const layerRefs = useRef([]);
  const labelRefs = useRef([]);
  const lineRefs = useRef([]);

  /* State */
  const [activeLayer, setActiveLayer] = useState(2); // Mặc định lớp giữa (Cà chua/Rau)
  const [canInteract, setCanInteract] = useState(false); // Bật khi scroll progress >= 0.6
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ── Hàm setActive duy nhất cho Click / Keyboard ── */
  const handleSetActive = useCallback((index) => {
    if (index < 0 || index >= BURGER_LAYERS.length) return;
    setActiveLayer(index);
  }, []);

  /* Keyboard Navigation (Up / Down Arrow) khi đã mở tương tác */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!canInteract) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveLayer((prev) => Math.min(prev + 1, BURGER_LAYERS.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveLayer((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canInteract]);

  /* ════════════════════════════════════════════════════════════════════════════
     TRẠNG THÁI 1: GSAP SCROLLTRIGGER TIMELINE (0 -> 100%)
     ════════════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setCanInteract(true);
      return;
    }

    const ctx = gsap.context(() => {
      const endDistance = isMobile ? "+=300%" : "+=400%";

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: pinRef.current,
          start: "top top",
          end: endDistance,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Chỉ bật tương tác chọn lớp khi progress >= 0.6
            if (self.progress >= 0.58) {
              setCanInteract(true);
            } else {
              setCanInteract(false);
            }
          },
        },
      });

      /* ── 0% – 20%: Burger nguyên khối, scale 1 -> 1.06 ── */
      tl.to(burgerWrapperRef.current, {
        scale: 1.06,
        y: -10,
        duration: 0.20,
        ease: "power2.inOut",
      }, 0);

      /* ── 20% – 50%: Tách các lớp theo yPercent, Nền tối -> sáng, Tiêu đề THE STACK ── */
      tl.to(heroBgRef.current, {
        backgroundColor: "#FAF7F2",
        duration: 0.30,
        ease: "power2.inOut",
      }, 0.20);

      // Chuyển đổi tiêu đề
      tl.to(titleStage1Ref.current, {
        opacity: 0,
        y: -25,
        duration: 0.15,
        ease: "power2.inOut",
      }, 0.20);

      tl.to(titleStage2Ref.current, {
        opacity: 1,
        y: 0,
        duration: 0.20,
        ease: "power2.out",
      }, 0.25);

      // Tách lớp theo yPercent với stagger 0.03 từ trên xuống (index 4 -> 0)
      BURGER_LAYERS.slice().reverse().forEach((layer, reverseIdx) => {
        const actualIdx = layer.index;
        const layerEl = layerRefs.current[actualIdx];
        if (!layerEl) return;

        tl.to(layerEl, {
          yPercent: layer.yPercent,
          duration: 0.30,
          ease: "power2.out",
        }, 0.20 + reverseIdx * 0.03);
      });

      /* ── 50% – 60%: Nhãn bên phải hiện lần lượt + Đường kẻ nối ── */
      labelRefs.current.forEach((labelEl, idx) => {
        if (!labelEl) return;
        tl.to(labelEl, {
          opacity: 1,
          x: 0,
          duration: 0.15,
          ease: "power2.out",
        }, 0.50 + idx * 0.02);
      });

      lineRefs.current.forEach((lineEl, idx) => {
        if (!lineEl) return;
        tl.to(lineEl, {
          scaleX: 1,
          opacity: 1,
          duration: 0.15,
          ease: "power2.out",
        }, 0.52 + idx * 0.02);
      });

      /* ── 60% – 100%: Giữ trạng thái tách lớp để tương tác ── */
      tl.to({}, { duration: 0.40 }, 0.60);

    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: isMobile ? "300vh" : "400vh",
      }}
    >
      {/* ── PINNED WRAPPER ── */}
      <div
        ref={pinRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Dynamic Background Layer */}
        <div
          ref={heroBgRef}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#0D0E12",
            transition: "background-color 0.1s linear",
            willChange: "background-color",
            zIndex: 1,
          }}
        />

        {/* Decorative Ambient Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(201, 161, 90, 0.12) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            opacity: 0.6,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 10,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* ════════════════════════════════════════════════════════════════
             CỘT TRÁI: TIÊU ĐỀ & MÔ TẢ DYNAMIC
             ════════════════════════════════════════════════════════════════ */}
          <div style={{ flex: 1, maxWidth: 460, position: "relative", zIndex: 15 }}>
            {/* Title Stage 1: Ban đầu */}
            <div
              ref={titleStage1Ref}
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                transform: "translateY(-50%)",
                width: "100%",
                opacity: 1,
                willChange: "transform, opacity",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "rgba(201,161,90,0.18)",
                  border: "1px solid var(--color-gold)",
                  color: "var(--color-gold)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                <Sparkles size={14} /> ALL-STAR BURGER 100% NGUYÊN BẢN
              </div>

              <h1
                style={{
                  fontSize: "clamp(34px, 4.5vw, 52px)",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  lineHeight: 1.12,
                  marginBottom: 16,
                  fontFamily: "var(--font-display)",
                }}
              >
                Thèm món gì?<br />
                <span style={{ color: "var(--color-gold)", fontStyle: "italic" }}>
                  FoodGo lo.
                </span>
              </h1>

              <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 15.5, lineHeight: 1.6, marginBottom: 28 }}>
                Khám phá chiếc Burger chuẩn vị — Cuộn xuống để xem hiệu ứng tách từng lớp nguyên liệu!
              </p>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <a
                  href="#lineup-section"
                  className="btn btn-primary btn-lg"
                  style={{
                    borderRadius: "var(--radius-pill)",
                    padding: "12px 26px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14.5,
                  }}
                >
                  <ShoppingBag size={18} /> Đặt Món Ngay <ChevronRight size={16} />
                </a>

                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <ArrowDown size={14} className="animate-bounce" color="var(--color-gold)" /> Cuộn chuột
                </div>
              </div>
            </div>

            {/* Title Stage 2: THE STACK */}
            <div
              ref={titleStage2Ref}
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                transform: "translateY(-50%)",
                width: "100%",
                opacity: 0,
                willChange: "transform, opacity",
              }}
            >
              <div
                style={{
                  color: "var(--color-primary)",
                  fontSize: 12.5,
                  fontWeight: 800,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ShieldCheck size={16} color="var(--color-primary)" /> BẤM CHỌN NGUYÊN LIỆU ĐỂ XEM CHI TIẾT
              </div>

              <h2
                style={{
                  fontSize: "clamp(36px, 4.8vw, 56px)",
                  fontWeight: 900,
                  color: "#1E1E1E",
                  lineHeight: 1.08,
                  marginBottom: 14,
                  fontFamily: "var(--font-display)",
                }}
              >
                THE STACK
              </h2>

              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
                Các thành phần được tách lớp riêng biệt. Nhấp vào bất kỳ nhãn hoặc lớp ảnh nào để làm nổi bật vị ngon trọn vẹn!
              </p>

              {/* Status Banner when interaction is unlocked */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: canInteract ? "rgba(201,161,90,0.18)" : "rgba(0,0,0,0.05)",
                  border: canInteract ? "1px solid var(--color-gold)" : "1px dashed #CCC",
                  color: canInteract ? "var(--color-primary-dark)" : "#888",
                  fontSize: 13,
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                }}
              >
                <Info size={16} />
                {canInteract
                  ? "Tương tác đã mở: Nhấn nhãn / ảnh hoặc dùng phím ↑ ↓"
                  : "Cuộn thêm một chút để mở khóa tương tác chọn lớp..."}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
             CỘT GIỮA: CONTAINER CHỨA CÁC LỚP BURGER (TRẠNG THÁI 2 INTERACTIVE)
             ════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              flex: 1.2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              height: 520,
            }}
          >
            <div
              ref={burgerWrapperRef}
              style={{
                position: "relative",
                width: 340,
                height: 340,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                willChange: "transform",
                zIndex: 20,
              }}
            >
              {BURGER_LAYERS.map((layer) => {
                const isSelected = activeLayer === layer.index;
                const isDimmed = canInteract && activeLayer !== null && !isSelected;

                return (
                  <img
                    key={layer.key}
                    ref={(el) => (layerRefs.current[layer.index] = el)}
                    src={layer.img}
                    alt={layer.name}
                    loading="eager"
                    onClick={() => canInteract && handleSetActive(layer.index)}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "auto",
                      maxHeight: 250,
                      objectFit: "contain",
                      cursor: canInteract ? "pointer" : "default",
                      willChange: "transform, opacity, filter",
                      /* TRẠNG THÁI 2: TRUYỀN PHONG CÁCH SÁNG / TỐI THEO YÊU CẦU */
                      opacity: isDimmed ? 0.35 : 1,
                      filter: isSelected && canInteract
                        ? "brightness(1.15) contrast(1.05) drop-shadow(0 0 24px rgba(201,161,90,0.85))"
                        : isDimmed
                        ? "brightness(0.6) grayscale(0.35)"
                        : "drop-shadow(0 8px 18px rgba(0,0,0,0.25))",
                      transform: isSelected && canInteract
                        ? "scale(1.04) translateX(12px)"
                        : "scale(1) translateX(0)",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      zIndex: isSelected ? 30 : 10 + layer.index,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
             CỘT PHẢI: DANH SÁCH NHÃN CHỮ, ĐƯỜNG KẺ NỐI & TOOLTIP MÔ TẢ
             ════════════════════════════════════════════════════════════════ */}
          {!isMobile && (
            <div
              style={{
                flex: 1,
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
                zIndex: 25,
              }}
            >
              {/* Hiển thị danh sách nhãn theo thứ tự từ trên xuống (index 4 -> 0) */}
              {BURGER_LAYERS.slice().reverse().map((layer) => {
                const isSelected = activeLayer === layer.index;
                const isDimmed = canInteract && activeLayer !== null && !isSelected;

                return (
                  <div
                    key={layer.key}
                    ref={(el) => (labelRefs.current[layer.index] = el)}
                    onClick={() => canInteract && handleSetActive(layer.index)}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 18px",
                      borderRadius: 16,
                      background: isSelected && canInteract
                        ? "var(--color-white)"
                        : "rgba(255,255,255,0.75)",
                      border: isSelected && canInteract
                        ? "2px solid var(--color-gold)"
                        : "1px solid var(--color-border-light)",
                      boxShadow: isSelected && canInteract
                        ? "0 8px 24px rgba(201,161,90,0.35)"
                        : "0 2px 10px rgba(0,0,0,0.04)",
                      cursor: canInteract ? "pointer" : "default",
                      pointerEvents: canInteract ? "auto" : "none",
                      opacity: 0, // GSAP sẽ fade in ở stage 50-60%
                      transform: "translateX(30px)",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      filter: isDimmed ? "brightness(0.8) opacity(0.5)" : "none",
                    }}
                  >
                    {/* Đường kẻ ngắn nối tới lớp burger */}
                    <div
                      ref={(el) => (lineRefs.current[layer.index] = el)}
                      style={{
                        position: "absolute",
                        left: isSelected && canInteract ? -50 : -35,
                        top: "50%",
                        width: isSelected && canInteract ? 45 : 30,
                        height: 2,
                        backgroundColor: isSelected && canInteract ? "var(--color-gold)" : "#BBB",
                        transformOrigin: "right center",
                        transform: "scaleX(0)",
                        opacity: 0,
                        transition: "all 0.35s ease",
                      }}
                    />

                    {/* Badge số thứ tự */}
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: isSelected && canInteract
                          ? "var(--color-primary)"
                          : "var(--color-primary-pale)",
                        color: isSelected && canInteract ? "#FFF" : "var(--color-primary)",
                        fontSize: 12,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {layer.index + 1}
                    </div>

                    {/* Tiêu đề nhãn */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected && canInteract
                            ? "var(--color-primary-dark)"
                            : "var(--color-ink)",
                        }}
                      >
                        {layer.name}
                      </div>

                      {/* Tooltip mô tả nhỏ xuất hiện ngay bên dưới khi được chọn */}
                      {isSelected && canInteract && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--color-muted)",
                            marginTop: 4,
                            lineHeight: 1.45,
                            animation: "fadeIn 0.3s ease forwards",
                          }}
                        >
                          {layer.desc}
                        </div>
                      )}
                    </div>

                    <CheckCircle2
                      size={18}
                      color={isSelected && canInteract ? "var(--color-primary)" : "#DDD"}
                    />
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

export default HeroScrollSection;
