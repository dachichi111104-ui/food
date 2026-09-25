import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, Eye, EyeOff, Loader2, ChevronRight, Utensils } from "lucide-react";

const Login = () => {
  const { login, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const user = await login(form.email, form.password);
      if (user.role === "seller") navigate("/seller/shop");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "shipper") navigate("/shipper/orders");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;
    setLoading(true); setError("");
    try {
      const user = await loginGoogle(credentialResponse.credential);
      if (user.role === "seller") navigate("/seller/shop");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "shipper") navigate("/shipper/orders");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập Google thất bại");
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
            Chào mừng trở lại
          </p>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>
            Đăng nhập vào<br />tài khoản của bạn
          </h1>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 15, lineHeight: 1.7 }}>
            Hàng trăm quán ăn ngon đang chờ bạn khám phá mỗi ngày.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 56px", background: "var(--color-white)",
      }}>
        <div style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Đăng nhập</h2>
          <p className="text-muted" style={{ fontSize: 14, marginBottom: 32 }}>
            Chưa có tài khoản?{" "}
            <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}>
              Đăng ký miễn phí
            </Link>
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div className="field">
              <label>Email</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  className="input input-has-icon"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ margin: 0 }}>Mật khẩu</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  className="input input-has-icon"
                  type={showPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--color-muted)", display: "flex", alignItems: "center",
                  }}
                  tabIndex={-1}
                  aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading
                ? <><Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} />Đang đăng nhập...</>
                : <>Đăng nhập <ChevronRight size={16} /></>
              }
            </button>
          </form>

          {/* Google OAuth Section */}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--color-border-light)" }} />
              <span style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 600 }}>HOẶC</span>
              <div style={{ flex: 1, height: 1, background: "var(--color-border-light)" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Đăng nhập Google không thành công")}
                locale="vi"
                theme="outline"
                shape="rectangular"
                width="380"
              />
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--color-border-light)", textAlign: "center" }}>
            <p className="text-muted" style={{ fontSize: 13 }}>
              Bằng cách đăng nhập, bạn đồng ý với{" "}
              <Link to="/terms" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>Điều khoản sử dụng</Link>
              {" "}của FoodGo
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .input-icon-wrap { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: var(--color-muted); pointer-events: none; z-index: 1; flex-shrink: 0; }
        .input-has-icon { padding-left: 42px; }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          .panel-hero { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;