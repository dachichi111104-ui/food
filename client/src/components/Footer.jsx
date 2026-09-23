import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

const Footer = () => (
  <footer className="app-footer">
    <div className="container">
      <div className="footer-grid">
        {/* Brand */}
        <div>
          <div className="footer-brand-name">
            <span style={{ fontSize: 16, color: "var(--color-gold)" }}>✦</span>
            FoodGo<span style={{ color: "var(--color-gold)" }}>.</span>
          </div>

          <p className="footer-brand-desc">
            Nền tảng đặt món ăn & thức uống trực tuyến. Kết nối thực khách với
            những quán ăn yêu thích — đặt nhanh, giao tận nơi.
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <a
              href="mailto:support@foodgo.vn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.80)",
                padding: "7px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              <Mail size={13} />
              Email
            </a>

            <a
              href="tel:19001234"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.80)",
                padding: "7px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              <Phone size={13} />
              1900 1234
            </a>
          </div>

          {/* Social */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <a href="#" aria-label="Facebook" className="footer-social">
              <FaFacebookF />
            </a>

            <a href="#" aria-label="Instagram" className="footer-social">
              <FaInstagram />
            </a>

            <a href="#" aria-label="TikTok" className="footer-social">
              <FaTiktok />
            </a>

            <a href="#" aria-label="YouTube" className="footer-social">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Về FoodGo */}
        <div>
          <p className="footer-heading">Về FoodGo</p>
          <div className="footer-links">
            <Link to="/about">Câu chuyện của chúng tôi</Link>
            <Link to="/">Khám phá quán ăn</Link>
            <Link to="/support">Trung tâm hỗ trợ</Link>
          </div>
        </div>

        {/* Khách hàng */}
        <div>
          <p className="footer-heading">Khách hàng</p>
          <div className="footer-links">
            <Link to="/support">Cách đặt món</Link>
            <Link to="/orders">Theo dõi đơn hàng</Link>
            <Link to="/support">Thanh toán</Link>
            <Link to="/terms">Chính sách đặt hàng</Link>
          </div>
        </div>

        {/* Đối tác & Pháp lý */}
        <div>
          <p className="footer-heading">Đối tác & Pháp lý</p>
          <div className="footer-links">
            <Link to="/register">Đăng ký bán hàng</Link>
            <Link to="/register">Đăng ký làm tài xế</Link>
            <Link to="/terms">Điều khoản sử dụng</Link>
            <Link to="/terms">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © 2026 FoodGo. Đồ án học phần Ứng dụng Thương mại điện tử.
        </span>

        <div style={{ display: "flex", gap: 16 }}>
          <Link
            to="/terms"
            style={{
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Điều khoản
          </Link>

          <Link
            to="/terms"
            style={{
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Bảo mật
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;