import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Utensils } from "lucide-react";
import { verifyEmail } from "../../services/auth.service";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending"); // 'pending' | 'success' | 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setStatus("error");
      setMessage("Link xác thực không có mã token hợp lệ.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Xác nhận email thành công!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Xác thực email thất bại hoặc liên kết đã hết hạn.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", padding: 20, background: "var(--color-bg)" }}>
      <div style={{ maxWidth: 420, width: "100%", background: "#fff", padding: 40, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid var(--color-border-light)", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--color-primary-pale)", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Utensils size={26} />
        </div>

        {loading && (
          <div>
            <Loader2 size={36} className="spin" style={{ color: "var(--color-primary)", margin: "16px auto" }} />
            <h3 style={{ fontSize: 18 }}>Đang xác thực email...</h3>
            <p className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {!loading && status === "success" && (
          <div>
            <CheckCircle2 size={54} color="var(--color-success)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)", marginBottom: 10 }}>Xác thực thành công!</h2>
            <p className="text-muted" style={{ fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>{message}</p>
            <Link to="/login" className="btn btn-primary btn-block btn-lg" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {!loading && status === "error" && (
          <div>
            <XCircle size={54} color="var(--color-danger)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)", marginBottom: 10 }}>Xác thực không thành công</h2>
            <p className="text-muted" style={{ fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>{message}</p>
            <Link to="/login" className="btn btn-outline btn-block">
              Quay lại Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
