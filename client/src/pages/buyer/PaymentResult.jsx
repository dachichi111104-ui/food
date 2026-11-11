import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { createPayment } from "../../services/payment.service";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ClipboardList,
  Banknote,
  CreditCard,
  Loader2,
  Clock,
} from "lucide-react";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("vnp_ResponseCode");
  const isCod = searchParams.get("cod") === "true";
  const orderId = searchParams.get("order_id");
  const success = isCod || code === "00" || searchParams.get("success") === "true";

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  useEffect(() => {
    // Chỉ tự động điều hướng khi thanh toán thành công
    if (success) {
      const timer = setTimeout(() => navigate("/orders"), 6000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setRetrying(true);
    setRetryError("");
    try {
      const res = await createPayment(orderId);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err) {
      setRetryError(
        err.response?.data?.message || "Không thể khởi tạo cổng thanh toán VNPay. Vui lòng thử lại!"
      );
      setRetrying(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--color-bg)",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        padding: "64px 0",
      }}
    >
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card card-body" style={{ textAlign: "center", padding: "56px 40px" }}>
          {success ? (
            isCod ? (
              <Banknote size={64} color="var(--color-success)" style={{ margin: "0 auto 20px" }} />
            ) : (
              <CheckCircle2 size={64} color="var(--color-success)" style={{ margin: "0 auto 20px" }} />
            )
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Clock size={40} color="#D97706" />
            </div>
          )}

          <h1 style={{ fontSize: 22, marginBottom: 10 }}>
            {success
              ? isCod
                ? "Đặt hàng COD thành công!"
                : "Thanh toán thành công!"
              : "Thanh toán chưa hoàn tất"}
          </h1>

          <p className="text-muted" style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 28 }}>
            {success
              ? isCod
                ? "Đơn hàng của bạn đã được ghi nhận. Quán sẽ chuẩn bị món ăn ngay và shipper sẽ thu tiền mặt khi giao tới."
                : "Đơn hàng của bạn đã được thanh toán thành công qua VNPay. Chúng tôi sẽ chuẩn bị món ăn ngay cho bạn."
              : "Bạn chưa hoàn tất thanh toán VNPay hoặc giao dịch đã bị tạm dừng. Đơn hàng của bạn vẫn đang được lưu ở trạng thái 'Chờ thanh toán'."}
          </p>

          {retryError && (
            <div className="alert alert-error" style={{ marginBottom: 18, fontSize: 13 }}>
              {retryError}
            </div>
          )}

          {!success && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 14px",
                background: "#EFF6FF",
                border: "1px dashed #3B82F6",
                borderRadius: "var(--radius-sm)",
                textAlign: "left",
                fontSize: 12.5,
                color: "#1E40AF",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                💡 Hướng dẫn thử nghiệm VNPay Sandbox:
              </div>
              <div style={{ lineHeight: 1.5, color: "#1E3A8A" }}>
                • Không quét mã QR bằng App ngân hàng thật (sẽ bị lỗi tra cứu).<br />
                • Bấm nút <strong>"Thanh toán lại ngay"</strong> ➔ Chọn tab <strong>Thẻ ATM / Tài khoản nội địa</strong> ➔ Ngân hàng <strong>NCB</strong>.<br />
                • Số thẻ: <strong>9704198526191432198</strong><br />
                • Tên chủ thẻ: <strong>NGUYEN VAN A</strong> | Ngày: <strong>07/15</strong> | OTP: <strong>123456</strong>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {success ? (
              <>
                <Link
                  to="/orders"
                  className="btn btn-primary btn-block"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <ClipboardList size={16} /> Xem đơn hàng của tôi
                </Link>
                <Link
                  to="/"
                  className="btn btn-outline btn-block"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <ArrowLeft size={15} /> Tiếp tục mua sắm
                </Link>
              </>
            ) : (
              <>
                {orderId && (
                  <button
                    onClick={handleRetryPayment}
                    disabled={retrying}
                    className="btn btn-primary btn-block"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontWeight: 700,
                      padding: "12px 20px",
                    }}
                  >
                    {retrying ? (
                      <Loader2 size={16} className="spin" />
                    ) : (
                      <CreditCard size={16} />
                    )}
                    {retrying ? "Đang kết nối cổng VNPay..." : "Thanh toán lại ngay"}
                  </button>
                )}

                <Link
                  to={orderId ? `/orders/${orderId}` : "/orders"}
                  className="btn btn-outline btn-block"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <ClipboardList size={16} /> Xem chi tiết đơn hàng
                </Link>

                <Link
                  to="/orders"
                  className="btn btn-ghost btn-block"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <ArrowLeft size={15} /> Về danh sách đơn hàng
                </Link>
              </>
            )}
          </div>

          {success && (
            <p className="text-muted" style={{ marginTop: 20, fontSize: 12.5 }}>
              Tự động chuyển hướng sau 6 giây...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;