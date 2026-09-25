import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { resetPassword } from "../../services/auth.service";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg("Link đặt lại mật khẩu không hợp lệ (thiếu token).");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu phải từ 6 ký tự trở lên.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await resetPassword(token, newPassword);
      setSuccessMsg(res.message || "Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Đặt lại mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", padding: 20, background: "var(--color-bg)" }}>
      <div style={{ maxWidth: 420, width: "100%", background: "#fff", padding: 36, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid var(--color-border-light)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Đặt lại mật khẩu mới</h2>
          <p className="text-muted" style={{ fontSize: 13.5 }}>
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={18} />
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>{successMsg}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>Đang chuyển hướng về trang Đăng nhập...</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {!token && !errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: 20, fontSize: 13 }}>
            Link này không có mã token hợp lệ. Vui lòng kiểm tra lại liên kết từ email.
          </div>
        )}

        {!successMsg && token && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="field">
              <label>Mật khẩu mới</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <input
                  className="input"
                  type={showPass ? "text" : "password"}
                  placeholder="Nhập ít nhất 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)" }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label>Xác nhận mật khẩu mới</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <input
                  className="input"
                  type={showPass ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading || !newPassword || !confirmPassword}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? <><Loader2 size={16} className="spin" /> Đang cập nhật...</> : "Cập nhật mật khẩu"}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link to="/login" style={{ fontSize: 13, color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
