import { Mail } from "lucide-react";

const SECTIONS = [
  { title: "1. Điều khoản sử dụng dịch vụ", content: "Bằng cách truy cập và sử dụng FoodGo, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây. FoodGo cung cấp nền tảng kết nối người dùng với các quán ăn và dịch vụ giao hàng. Chúng tôi có quyền cập nhật điều khoản bất kỳ lúc nào và sẽ thông báo đến người dùng." },
  { title: "2. Tài khoản người dùng", content: "Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Mọi hoạt động thực hiện qua tài khoản đều được coi là do bạn thực hiện. Hãy thông báo ngay cho FoodGo nếu phát hiện truy cập trái phép vào tài khoản." },
  { title: "3. Đặt hàng và thanh toán", content: "Khi đặt hàng thành công, bạn đồng ý thanh toán toàn bộ giá trị đơn hàng bao gồm phí sản phẩm và phí giao hàng. FoodGo xử lý thanh toán qua VNPay và không lưu trữ thông tin thẻ ngân hàng của bạn. Trong trường hợp đơn hàng bị hủy, hoàn tiền sẽ được thực hiện theo chính sách hoàn tiền của FoodGo." },
  { title: "4. Chính sách hủy và hoàn tiền", content: "Bạn có thể hủy đơn hàng khi đơn còn ở trạng thái \"Chờ thanh toán\". Sau khi quán đã xác nhận chuẩn bị, đơn hàng không thể hủy trực tiếp mà cần liên hệ hỗ trợ. Hoàn tiền sẽ được xử lý trong 3–7 ngày làm việc tùy ngân hàng." },
  { title: "5. Bảo mật thông tin cá nhân", content: "FoodGo cam kết bảo vệ thông tin cá nhân của bạn theo các quy định pháp luật hiện hành. Thông tin của bạn chỉ được sử dụng để cung cấp dịch vụ và cải thiện trải nghiệm người dùng. Chúng tôi không chia sẻ thông tin với bên thứ ba khi chưa có sự đồng ý của bạn." },
  { title: "6. Trách nhiệm của người dùng", content: "Người dùng cam kết không sử dụng FoodGo vào các mục đích vi phạm pháp luật, không cung cấp thông tin sai lệch, không thực hiện các hành vi gian lận. FoodGo có quyền tạm ngưng hoặc chấm dứt tài khoản vi phạm điều khoản." },
  { title: "7. Liên hệ", content: "Mọi thắc mắc về Điều khoản sử dụng, vui lòng liên hệ: Email: support@foodgo.vn | Hotline: 1900 1234 | Địa chỉ: Thành phố Hồ Chí Minh, Việt Nam." },
];

const Terms = () => (
  <div style={{ background: "var(--color-bg)", padding: "48px 0 80px" }}>
    <div className="container" style={{ maxWidth: 820 }}>

      {/* Header */}
      <div style={{
        background: "var(--color-white)", border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)", padding: "40px 48px", marginBottom: 24, textAlign: "center",
      }}>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", marginBottom: 10 }}>Điều khoản sử dụng</h1>
        <p className="text-muted" style={{ fontSize: 14 }}>
          Cập nhật lần cuối: tháng 01 năm 2026 · Có hiệu lực ngay khi bạn sử dụng FoodGo
        </p>
      </div>

      {/* Intro */}
      <div className="card card-body" style={{ marginBottom: 20, background: "var(--color-cream)", borderColor: "var(--color-cream-deep)" }}>
        <p style={{ fontSize: 14.5, lineHeight: 1.75, color: "var(--color-ink)" }}>
          Chào mừng bạn đến với FoodGo. Vui lòng đọc kỹ Điều khoản sử dụng dưới đây trước khi sử dụng
          dịch vụ. Bằng cách truy cập hoặc sử dụng FoodGo, bạn xác nhận đã đọc, hiểu và đồng ý ràng
          buộc bởi các điều khoản này.
        </p>
      </div>

      {/* Sections */}
      <div className="card" style={{ overflow: "hidden" }}>
        {SECTIONS.map((section, i) => (
          <div key={section.title} style={{
            padding: "28px 32px",
            borderBottom: i < SECTIONS.length - 1 ? "1px solid var(--color-border-light)" : "none",
          }}>
            <h2 style={{ fontSize: 16, fontFamily: "var(--font-body)", marginBottom: 12, color: "var(--color-ink)" }}>
              {section.title}
            </h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.8, color: "var(--color-muted)" }}>{section.content}</p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 24, padding: "16px 24px",
        background: "var(--color-white)", border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-muted)",
        lineHeight: 1.6, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <Mail size={13} style={{ flexShrink: 0, color: "var(--color-primary)" }} />
        Nếu không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ FoodGo. Mọi thắc mắc, liên hệ{" "}
        <a href="mailto:support@foodgo.vn" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          support@foodgo.vn
        </a>
      </div>
    </div>
  </div>
);

export default Terms;