import { useState } from "react";
import { Search, ShoppingBag, CreditCard, Package, UserCircle, ChevronDown, Mail, Phone } from "lucide-react";

const FAQ_SECTIONS = [
  {
    category: "Đặt món",
    Icon: ShoppingBag,
    items: [
      { q: "Làm sao để đặt món trên FoodGo?", a: "Chọn quán ăn bạn muốn, thêm món vào giỏ hàng, sau đó vào giỏ hàng để tiến hành thanh toán. Bạn có thể đặt món từ nhiều quán khác nhau trong cùng một lần." },
      { q: "Tôi có thể đặt từ nhiều quán cùng lúc không?", a: "Có! FoodGo hỗ trợ đặt món từ nhiều quán trong một đơn hàng. Hệ thống sẽ tách thành các đơn nhỏ cho từng quán và giao riêng." },
      { q: "Tôi có thể hủy đơn hàng không?", a: "Bạn có thể hủy đơn khi đơn còn ở trạng thái \"Chờ thanh toán\". Sau khi quán đã bắt đầu chuẩn bị món, việc hủy đơn cần liên hệ hỗ trợ." },
    ],
  },
  {
    category: "Thanh toán",
    Icon: CreditCard,
    items: [
      { q: "FoodGo hỗ trợ phương thức thanh toán nào?", a: "Hiện tại FoodGo hỗ trợ thanh toán qua VNPay — bao gồm thẻ ATM nội địa, thẻ quốc tế Visa/Mastercard và các ví điện tử liên kết." },
      { q: "Thanh toán trên FoodGo có an toàn không?", a: "Hoàn toàn an toàn. Mọi giao dịch đều được xử lý qua VNPay với chuẩn bảo mật PCI DSS. FoodGo không lưu trữ thông tin thẻ của bạn." },
      { q: "Tôi có được hoàn tiền khi đơn bị hủy không?", a: "Nếu đơn hàng bị hủy sau khi đã thanh toán, tiền sẽ được hoàn trả về nguồn thanh toán ban đầu trong 3–7 ngày làm việc." },
    ],
  },
  {
    category: "Đơn hàng & Giao hàng",
    Icon: Package,
    items: [
      { q: "Thời gian giao hàng thường là bao lâu?", a: "Tùy thuộc vào khoảng cách và tình trạng của quán, thông thường từ 20–45 phút. Bạn có thể theo dõi trạng thái đơn hàng trong mục \"Đơn hàng của tôi\"." },
      { q: "Tôi nhận được món không đúng như đã đặt, phải làm sao?", a: "Vào mục \"Đơn hàng\" của bạn, chọn đơn liên quan và gửi khiếu nại. Đội ngũ hỗ trợ sẽ xem xét và phản hồi trong vòng 24 giờ." },
      { q: "Làm sao để theo dõi đơn hàng?", a: "Sau khi đặt hàng thành công, vào mục \"Đơn hàng\" để xem trạng thái thời gian thực: Xác nhận → Chuẩn bị → Đang giao → Đã giao." },
    ],
  },
  {
    category: "Tài khoản & Đối tác",
    Icon: UserCircle,
    items: [
      { q: "Làm sao để đăng ký bán hàng trên FoodGo?", a: "Đăng ký tài khoản với vai trò \"Người bán\", sau đó tạo hồ sơ quán ăn. Đội ngũ FoodGo sẽ xét duyệt trong vòng 1–2 ngày làm việc." },
      { q: "Tôi quên mật khẩu, làm sao để lấy lại?", a: "Hiện tại bạn có thể liên hệ hỗ trợ qua email support@foodgo.vn để được hỗ trợ đặt lại mật khẩu." },
    ],
  },
];

const AccordionItem = ({ item, isOpen, onToggle }) => (
  <div style={{ borderBottom: "1px solid var(--color-border-light)" }}>
    <button onClick={onToggle} style={{
      width: "100%", textAlign: "left",
      background: isOpen ? "var(--color-primary-pale)" : "transparent",
      border: "none", padding: "18px 24px", fontSize: 15, fontWeight: 600,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      cursor: "pointer", color: isOpen ? "var(--color-primary)" : "var(--color-ink)",
      transition: "background 0.2s ease, color 0.2s ease", gap: 12,
    }}>
      <span>{item.q}</span>
      <ChevronDown size={18} color="var(--color-primary)" style={{
        transform: isOpen ? "rotate(180deg)" : "none",
        transition: "transform 0.25s ease", flexShrink: 0,
      }} />
    </button>
    <div style={{ maxHeight: isOpen ? 300 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
      <div style={{ padding: "4px 24px 20px", fontSize: 14.5, lineHeight: 1.75, color: "var(--color-muted)" }}>
        {item.a}
      </div>
    </div>
  </div>
);

const Support = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQ, setSearchQ] = useState("");

  const currentSection = FAQ_SECTIONS[activeSection];
  const filteredItems = searchQ
    ? FAQ_SECTIONS.flatMap((s) => s.items).filter(
        (item) => item.q.toLowerCase().includes(searchQ.toLowerCase()) || item.a.toLowerCase().includes(searchQ.toLowerCase())
      )
    : currentSection.items;

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, var(--color-cream-mid) 0%, var(--color-cream) 100%)",
        padding: "56px 0", borderBottom: "1px solid var(--color-border)",
      }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", marginBottom: 12 }}>Trung tâm hỗ trợ</h1>
          <p className="text-muted" style={{ fontSize: 16, marginBottom: 32 }}>
            Tìm câu trả lời nhanh cho mọi thắc mắc của bạn
          </p>

          {/* Search */}
          <div style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
            <Search size={18} style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              color: "var(--color-muted)", pointerEvents: "none",
            }} />
            <input
              className="input input-pill"
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); setOpenIndex(-1); }}
              style={{ paddingLeft: 48, background: "var(--color-white)" }}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ background: "var(--color-bg)", padding: "48px 0 80px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: searchQ ? "1fr" : "220px 1fr", gap: 32, alignItems: "start" }}>

            {/* Category sidebar */}
            {!searchQ && (
              <div style={{ position: "sticky", top: 80 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {FAQ_SECTIONS.map((section, i) => (
                    <button
                      key={section.category}
                      onClick={() => { setActiveSection(i); setOpenIndex(0); }}
                      style={{
                        textAlign: "left", padding: "11px 16px", border: "none",
                        borderRadius: "var(--radius-sm)",
                        background: activeSection === i ? "var(--color-primary-pale)" : "transparent",
                        color: activeSection === i ? "var(--color-primary)" : "var(--color-muted)",
                        fontWeight: activeSection === i ? 700 : 500, fontSize: 14,
                        cursor: "pointer", transition: "all 0.15s ease",
                        borderLeft: activeSection === i ? "3px solid var(--color-primary)" : "3px solid transparent",
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                    >
                      <section.Icon size={15} />
                      {section.category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion */}
            <div>
              {searchQ && (
                <p className="text-muted" style={{ marginBottom: 16, fontSize: 14 }}>
                  Tìm thấy {filteredItems.length} kết quả cho &ldquo;{searchQ}&rdquo;
                </p>
              )}

              {filteredItems.length > 0 ? (
                <div className="card" style={{ overflow: "hidden" }}>
                  {filteredItems.map((item, idx) => (
                    <AccordionItem key={idx} item={item} isOpen={openIndex === idx}
                      onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)} />
                  ))}
                </div>
              ) : (
                <div className="empty-state card card-body" style={{ padding: 48 }}>
                  <div style={{ marginBottom: 16 }}><Search size={40} style={{ opacity: 0.3, margin: "0 auto" }} /></div>
                  <div className="empty-state-title">Không tìm thấy câu trả lời</div>
                  <p className="empty-state-desc">Thử tìm với từ khoá khác hoặc liên hệ hỗ trợ bên dưới.</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact card */}
          <div className="card card-body" style={{ marginTop: 40, textAlign: "center", padding: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-cream-mid)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Mail size={24} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Vẫn cần trợ giúp?</h3>
            <p className="text-muted" style={{ marginBottom: 28, fontSize: 14.5 }}>
              Đội ngũ FoodGo luôn sẵn sàng hỗ trợ bạn 24/7 — chúng tôi sẽ phản hồi trong vòng 1 giờ.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="mailto:support@foodgo.vn" className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Mail size={15} /> support@foodgo.vn
              </a>
              <a href="tel:19001234" className="btn btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Phone size={15} /> 1900 1234
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;