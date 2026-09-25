import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";
import LiveChatWidget from "../components/LiveChatWidget";
import {
  ShoppingCart, ClipboardList, Menu, X, LogOut,
  ChevronRight, Store, Package, ShoppingBag, LayoutDashboard,
  CheckSquare, Tag, Flag, Truck, Home, BookOpen, Headphones, User, Heart
} from "lucide-react";

/* ── Logout Confirmation Modal ── */
const LogoutModal = ({ onConfirm, onCancel }) => (
  <div className="logout-modal-overlay" onClick={onCancel}>
    <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
      <div className="logout-modal-icon">
        <LogOut size={24} color="var(--color-danger)" />
      </div>
      <div className="logout-modal-title">Đăng xuất khỏi FoodGo?</div>
      <p className="logout-modal-desc">
        Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?
      </p>
      <div className="logout-modal-actions">
        <button className="btn btn-outline" onClick={onCancel} style={{ minWidth: 100 }}>
          Hủy
        </button>
        <button className="btn btn-danger" onClick={onConfirm} style={{ minWidth: 100 }}>
          <LogOut size={14} /> Đăng xuất
        </button>
      </div>
    </div>
  </div>
);

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Đóng modal & thực hiện logout */
  const confirmLogout = () => {
    setShowLogoutModal(false);
    setMobileOpen(false);
    logout();
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ── Logout Modal ── */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      {/* ── Header ── */}
      <header className={`app-header${scrolled ? " scrolled" : ""}`}>
        <div className="container">
          <div className="app-header-inner">

            {/* Logo */}
            <Link to="/" className="logo" onClick={closeMobile}>
              <span style={{ fontSize: 20 }}>✦</span>
              FoodGo<span className="logo-dot">.</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="nav-main">
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                Trang chủ
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                Câu chuyện
              </NavLink>
              <NavLink to="/support" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                Hỗ trợ
              </NavLink>

              {user?.role === "seller" && (
                <>
                  <NavLink to="/seller/dashboard" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Thống kê</NavLink>
                  <NavLink to="/seller/shop" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Shop của tôi</NavLink>
                  <NavLink to="/seller/products" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Sản phẩm</NavLink>
                  <NavLink to="/seller/orders" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Đơn hàng</NavLink>
                </>
              )}
              {user?.role === "admin" && (
                <>
                  <NavLink to="/admin/shops" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Duyệt shop</NavLink>
                  <NavLink to="/admin/categories" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Danh mục</NavLink>
                  <NavLink to="/admin/reports" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Khiếu nại</NavLink>
                  <NavLink to="/admin/orders" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Đơn hàng</NavLink>
                </>
              )}
              {user?.role === "shipper" && (
                <NavLink to="/shipper/orders" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Đơn giao hàng</NavLink>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="nav-actions">
              {!user && (
                <>
                  <Link to="/login" className="btn btn-outline-white btn-sm" style={{ fontSize: 13 }}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn btn-gold btn-sm" style={{ fontSize: 13 }}>
                    Đăng ký
                  </Link>
                </>
              )}

              {user?.role === "buyer" && (
                <>
                  <Link to="/favorites" className="nav-icon-btn" aria-label="Quán yêu thích" title="Quán yêu thích">
                    <Heart size={18} />
                  </Link>
                  <Link to="/orders" className="nav-icon-btn" aria-label="Đơn hàng" title="Đơn hàng của tôi">
                    <ClipboardList size={18} />
                  </Link>
                  <Link to="/cart" className="nav-icon-btn" aria-label="Giỏ hàng" title="Giỏ hàng" style={{ position: "relative" }}>
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
                    )}
                  </Link>
                </>
              )}

              {user && (
                <>
                  <div className="header-divider" />
                  <div className="nav-user-info">
                    <Link
                      to="/profile"
                      className="nav-avatar"
                      title="Tài khoản của tôi"
                      style={{ textDecoration: "none", cursor: "pointer" }}
                    >
                      {user.avatar_url
                        ? <img src={user.avatar_url} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        : getInitial(user.name)
                      }
                    </Link>
                    <span className="nav-username">{user.name}</span>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="btn btn-sm"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.20)",
                        fontSize: 12.5,
                        padding: "6px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <LogOut size={13} />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}

              {/* Hamburger */}
              <button
                className="hamburger-btn"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} color="white" /> : <Menu size={22} color="white" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
          {[
            { to: "/", icon: <Home size={16} />, label: "Trang chủ" },
            { to: "/about", icon: <BookOpen size={16} />, label: "Câu chuyện" },
            { to: "/support", icon: <Headphones size={16} />, label: "Hỗ trợ" },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="mobile-nav-link" onClick={closeMobile}
              style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {item.icon} {item.label}
            </Link>
          ))}

          {user?.role === "buyer" && (
            <>
              <div className="mobile-nav-divider" />
              <Link to="/profile" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <User size={16} /> Tài khoản của tôi
              </Link>
              <Link to="/cart" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShoppingCart size={16} /> Giỏ hàng
                {cartCount > 0 && (
                  <span className="badge badge-gold" style={{ marginLeft: "auto" }}>{cartCount}</span>
                )}
              </Link>
              <Link to="/orders" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ClipboardList size={16} /> Đơn hàng của tôi
              </Link>
            </>
          )}
          {user?.role === "seller" && (
            <>
              <div className="mobile-nav-divider" />
              <Link to="/seller/shop" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Store size={16} /> Shop của tôi
              </Link>
              <Link to="/seller/products" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Package size={16} /> Sản phẩm
              </Link>
              <Link to="/seller/orders" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShoppingBag size={16} /> Đơn hàng shop
              </Link>
            </>
          )}
          {user?.role === "admin" && (
            <>
              <div className="mobile-nav-divider" />
              <Link to="/admin/shops" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckSquare size={16} /> Duyệt shop
              </Link>
              <Link to="/admin/categories" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Tag size={16} /> Danh mục
              </Link>
              <Link to="/admin/reports" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Flag size={16} /> Khiếu nại
              </Link>
              <Link to="/admin/orders" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LayoutDashboard size={16} /> Đơn hàng
              </Link>
            </>
          )}
          {user?.role === "shipper" && (
            <>
              <div className="mobile-nav-divider" />
              <Link to="/shipper/orders" className="mobile-nav-link" onClick={closeMobile}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Truck size={16} /> Đơn giao hàng
              </Link>
            </>
          )}

          <div className="mobile-nav-divider" />
          {!user ? (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={closeMobile}>Đăng nhập</Link>
              <Link to="/register" className="mobile-nav-link" onClick={closeMobile}>Đăng ký</Link>
            </>
          ) : (
            <button className="mobile-logout-btn" onClick={() => { setMobileOpen(false); setShowLogoutModal(true); }}>
              <LogOut size={14} style={{ display: "inline", marginRight: 6 }} />
              Đăng xuất ({user.name})
            </button>
          )}
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <ChatbotWidget />
      <LiveChatWidget />
      <Footer />
    </div>
  );
};

export default MainLayout;