import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowLeft, ClipboardList } from "lucide-react";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get("success") !== "false";

  useEffect(() => {
    const timer = setTimeout(() => navigate(success ? "/orders" : "/cart"), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "60vh", display: "flex", alignItems: "center", padding: "64px 0" }}>
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card card-body" style={{ textAlign: "center", padding: "56px 40px" }}>
          {success ? (
            <CheckCircle2 size={64} color="var(--color-success)" style={{ margin: "0 auto 20px" }} />
          ) : (
            <XCircle size={64} color="var(--color-danger)" style={{ margin: "0 auto 20px" }} />
          )}

          <h1 style={{ fontSize: 22, marginBottom: 10 }}>
            {success ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </h1>
          <p className="text-muted" style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 32 }}>
            {success
              ? "Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ bắt đầu chuẩn bị món ăn ngay cho bạn."
              : "Có lỗi xảy ra trong quá trình thanh toán. Bạn có thể thử lại hoặc chọn phương thức khác."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {success ? (
              <>
                <Link to="/orders" className="btn btn-primary btn-block" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <ClipboardList size={16} /> Xem đơn hàng của tôi
                </Link>
                <Link to="/" className="btn btn-outline btn-block" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <ArrowLeft size={15} /> Tiếp tục mua sắm
                </Link>
              </>
            ) : (
              <>
                <Link to="/cart" className="btn btn-primary btn-block" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <ArrowLeft size={15} /> Quay lại giỏ hàng
                </Link>
                <Link to="/" className="btn btn-outline btn-block">
                  Về trang chủ
                </Link>
              </>
            )}
          </div>

          <p className="text-muted" style={{ marginTop: 20, fontSize: 12.5 }}>
            Tự động chuyển hướng sau 5 giây...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;