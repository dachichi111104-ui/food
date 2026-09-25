import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2, Utensils } from "lucide-react";
import { forgotPassword } from "../../services/auth.service";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res.message || "Đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", padding: 20, background: "var(--color-bg)" }}>
      <div style={{ maxWidth: 420, width: "100%", background: "#fff", padding: 36, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid var(--color-border-light)" }}>
        <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-muted)", textDecoration: "none", marginBottom: 24 }}>
          <ArrowLeft size={16} /> Quay lại Đăng nhập
        </Link>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-primary-pale)", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Utensils size={24} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Quên mật khẩu?</h2>
          <p className="text-muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
            Nhập email tài khoản của bạn. Chúng tôi sẽ gửi liên kết hướng dẫn tạo lại mật khẩu mới.
          </p>
        </div>

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: 20, fontSize: 13, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: 20, fontSize: 13 }}>
            {errorMsg}
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="field">
              <label>Địa chỉ Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <input
                  className="input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading || !email}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? <><Loader2 size={16} className="spin" /> Đang xử lý...</> : "Gửi liên kết đặt lại mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
