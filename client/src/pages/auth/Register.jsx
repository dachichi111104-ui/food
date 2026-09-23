import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, User, Phone, Utensils, Loader2, ChevronRight, ShoppingBag, Store, Truck, CheckCircle2 } from "lucide-react";

const ROLES = [
  {
    value: "buyer",
    Icon: ShoppingBag,
    label: "Người mua",
    desc: "Đặt món từ các quán ăn yêu thích",
  },
  {
    value: "seller",
    Icon: Store,
    label: "Người bán",
    desc: "Đăng ký quán ăn, quản lý menu & đơn hàng",
  },
  {
    value: "shipper",
    Icon: Truck,
    label: "Tài xế",
    desc: "Nhận đơn & giao hàng, tự do lịch trình",
  },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "buyer" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const user = await register(form);
      if (user.role === "seller") navigate("/seller/shop");
      else if (user.role === "shipper") navigate("/shipper/orders");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
      {/* ── Left panel ── */}
      <div className="panel-hero" style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 56px", minHeight: "100vh",
      }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 380 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 48, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-xs)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Utensils size={18} color="var(--color-gold)" />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#fff" }}>
              FoodGo<span style={{ color: "var(--color-gold)" }}>.</span>
            </span>
          </Link>

          <p style={{ color: "var(--color-gold)", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 20, height: 1, background: "var(--color-gold)", display: "inline-block" }} />
            Tạo tài khoản
          </p>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", color: "#fff", lineHeight: 1.2, marginBottom: 20 }}>
            Gia nhập<br />cộng đồng FoodGo
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Khám phá hàng trăm quán ăn ngon quanh bạn",
              "Đặt món trong vài giây, giao tận cửa",
              "Theo dõi đơn hàng theo thời gian thực",
            ].map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <CheckCircle2 size={16} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 56px", background: "var(--color-white)", overflowY: "auto",
      }}>
        <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Tạo tài khoản mới</h2>
          <p className="text-muted" style={{ fontSize: 14, marginBottom: 28 }}>
            Đã có tài khoản?{" "}
            <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}>
              Đăng nhập ngay
            </Link>
          </p>

          {/* Role selector */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
            {ROLES.map(({ value, Icon, label, desc }) => {
              const active = form.role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 8, padding: "14px 10px", border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-md)", background: active ? "var(--color-primary-pale)" : "var(--color-white)",
                    cursor: "pointer", transition: "all 0.15s ease", textAlign: "center",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "var(--radius-xs)",
                    background: active ? "var(--color-primary)" : "var(--color-cream-mid)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s ease",
                  }}>
                    <Icon size={18} color={active ? "#fff" : "var(--color-muted)"} />
                  </div>
                  <span style={{
                    fontSize: 12.5, fontWeight: active ? 700 : 600,
                    color: active ? "var(--color-primary)" : "var(--color-ink)",
                    lineHeight: 1.3,
                  }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {/* Name */}
            <div className="field">
              <label>Họ tên *</label>
              <div className="input-icon-wrap">
                <User size={15} className="input-icon" />
                <input
                  className="input input-has-icon"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="field">
              <label>Email *</label>
              <div className="input-icon-wrap">
                <Mail size={15} className="input-icon" />
                <input
                  className="input input-has-icon"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="field">
              <label>Số điện thoại</label>
              <div className="input-icon-wrap">
                <Phone size={15} className="input-icon" />
                <input
                  className="input input-has-icon"
                  type="tel"
                  placeholder="0901 234 567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label>Mật khẩu * <span className="text-muted" style={{ fontSize: 12, fontWeight: 400 }}>(tối thiểu 6 ký tự)</span></label>
              <div className="input-icon-wrap">
                <Lock size={15} className="input-icon" />
                <input
                  className="input input-has-icon"
                  type={showPass ? "text" : "password"}
                  placeholder="Ít nhất 6 ký tự"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--color-muted)", display: "flex", alignItems: "center",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}
            >
              {loading
                ? <><Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} />Đang tạo tài khoản...</>
                : <>Tạo tài khoản <ChevronRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-muted" style={{ marginTop: 20, fontSize: 12.5, textAlign: "center", lineHeight: 1.6 }}>
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <Link to="/terms" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>Điều khoản sử dụng</Link>
            {" "}và{" "}
            <Link to="/terms" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>Chính sách bảo mật</Link>
            {" "}của FoodGo.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .input-icon-wrap { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: var(--color-muted); pointer-events: none; z-index: 1; flex-shrink: 0; }
        .input-has-icon { padding-left: 42px; }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          .panel-hero { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Register;