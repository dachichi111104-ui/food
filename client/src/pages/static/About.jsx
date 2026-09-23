import { Link } from "react-router-dom";
import { Leaf, Zap, Shield, Heart, TrendingUp, Users, ArrowRight } from "lucide-react";

const STATS = [
  { number: "500+", label: "Quán ăn đối tác" },
  { number: "50K+", label: "Đơn hàng mỗi tháng" },
  { number: "15+",  label: "Quận/huyện phục vụ" },
];

const STORY_CARDS = [
  {
    Icon: Leaf,
    year: "2023",
    title: "Khởi đầu",
    desc: "FoodGo ra đời từ một câu hỏi đơn giản: làm sao để những quán ăn nhỏ, những gánh hàng quen thuộc trong khu phố có thể đến gần hơn với thực khách?",
  },
  {
    Icon: Users,
    year: "2024",
    title: "Kết nối",
    desc: "Chúng tôi xây dựng nền tảng để mọi chủ quán — dù lớn hay nhỏ — đều có cơ hội được nhiều người biết đến mà không cần khoản đầu tư khổng lồ vào công nghệ.",
  },
  {
    Icon: TrendingUp,
    year: "2025",
    title: "Phát triển",
    desc: "Từ vài chục quán ban đầu, FoodGo đã phục vụ hàng chục nghìn đơn hàng mỗi tháng, kết nối thực khách với những bữa ăn ngon mỗi ngày.",
  },
];

const VALUES = [
  { Icon: Heart,  title: "Tận tâm",    desc: "Mỗi bữa ăn đến tay bạn đều được chuẩn bị với sự tận tâm từ người đầu bếp đến shipper." },
  { Icon: Leaf,   title: "Bền vững",   desc: "Hỗ trợ các quán ăn địa phương phát triển bền vững, tạo thêm việc làm cho cộng đồng." },
  { Icon: Zap,    title: "Nhanh chóng",desc: "Công nghệ giúp việc đặt món trở nên đơn giản — từ chọn món đến xác nhận trong 60 giây." },
  { Icon: Shield, title: "An toàn",    desc: "Thanh toán bảo mật, thông tin cá nhân được bảo vệ tuyệt đối với chuẩn mã hoá cao nhất." },
];

const About = () => (
  <div>
    {/* Hero */}
    <section className="panel-hero" style={{ padding: "72px 0 80px" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <p style={{ color: "var(--color-gold)", fontWeight: 700, fontSize: 12, letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 20, height: 1, background: "var(--color-gold)", display: "inline-block" }} />
          Về chúng tôi
        </p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", color: "#fff", lineHeight: 1.2, marginBottom: 20, maxWidth: 560 }}>
          Câu chuyện FoodGo
        </h1>
        <p style={{ color: "rgba(255,255,255,0.76)", fontSize: 17, lineHeight: 1.7, maxWidth: 480 }}>
          Kết nối những bữa ăn ngon với mọi nhà — từ gánh hàng rong quen thuộc đến nhà hàng sang trọng.
        </p>
      </div>
    </section>

    {/* Stats */}
    <section style={{ background: "var(--color-white)", padding: "40px 0", borderBottom: "1px solid var(--color-border)" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              textAlign: "center", padding: "24px 20px",
              borderRight: i < STATS.length - 1 ? "1px solid var(--color-border)" : "none",
            }}>
              <div className="text-price" style={{ fontSize: 36 }}>{s.number}</div>
              <div className="text-muted" style={{ fontSize: 14, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Story timeline */}
    <section style={{ background: "var(--color-bg)", padding: "64px 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 48px" }}>
          <h2 style={{ fontSize: 30, marginBottom: 12 }}>Hành trình của chúng tôi</h2>
          <p className="text-muted" style={{ fontSize: 15, lineHeight: 1.7 }}>
            Từ ý tưởng đơn giản đến nền tảng phục vụ hàng chục nghìn người mỗi ngày.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 700, margin: "0 auto" }}>
          {STORY_CARDS.map((card, i) => (
            <div key={card.year} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              {/* Icon + line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "var(--color-primary-dark)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <card.Icon size={22} color="var(--color-gold)" />
                </div>
                {i < STORY_CARDS.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: "var(--color-border)", marginTop: 8, minHeight: 32 }} />
                )}
              </div>
              {/* Card */}
              <div className="card card-body" style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span className="badge badge-gold">{card.year}</span>
                  <h3 style={{ fontSize: 17 }}>{card.title}</h3>
                </div>
                <p className="text-muted" style={{ fontSize: 14.5, lineHeight: 1.75 }}>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section style={{ background: "var(--color-white)", padding: "64px 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto 48px" }}>
          <h2 style={{ fontSize: 30, marginBottom: 12 }}>Điều chúng tôi tin tưởng</h2>
          <p className="text-muted" style={{ fontSize: 15, lineHeight: 1.7 }}>
            Những giá trị định hướng mọi quyết định của FoodGo.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, maxWidth: 820, margin: "0 auto" }}>
          {VALUES.map(({ Icon, title, desc }) => (
            <div key={title} className="card card-body" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "var(--radius-sm)",
                background: "var(--color-cream-mid)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={22} color="var(--color-primary)" />
              </div>
              <div>
                <h4 style={{ fontSize: 15, marginBottom: 6 }}>{title}</h4>
                <p className="text-muted" style={{ fontSize: 13.5, lineHeight: 1.7 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section style={{ background: "var(--color-primary-dark)", padding: "56px 0" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: 26, marginBottom: 12 }}>
          Cùng FoodGo tạo nên những bữa ăn đáng nhớ
        </h2>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, marginBottom: 32 }}>
          Đặt món ngay hôm nay hoặc đăng ký làm đối tác của FoodGo.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="btn btn-gold btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Khám phá quán ăn <ArrowRight size={16} />
          </Link>
          <Link to="/register" className="btn btn-outline-white btn-lg">
            Đăng ký đối tác
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default About;