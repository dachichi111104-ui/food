import { createContext, useContext, useState, useEffect } from "react";
import { Clock, LogIn } from "lucide-react";
import api from "../services/api";

const AuthContext = createContext(null);

/* ── Session Expired Popup Modal ── */
const SessionExpiredModal = ({ onConfirm }) => (
  <div style={{
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0, 0, 0, 0.65)", zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20
  }}>
    <div style={{
      background: "#fff", borderRadius: 16, maxWidth: 400, width: "100%",
      padding: "28px 24px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: "50%", background: "#FFF5F5",
        color: "#C53030", display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16
      }}>
        <Clock size={28} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--color-ink)" }}>
        Phiên đăng nhập đã hết
      </h3>
      <p style={{ fontSize: 13.5, color: "var(--color-muted)", lineHeight: 1.5, marginBottom: 24 }}>
        Phiên đăng nhập đã hết hạn do không có tương tác trong 20 phút. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống FoodGo.
      </p>
      <button
        onClick={onConfirm}
        className="btn btn-primary btn-block btn-lg"
        style={{ fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <LogIn size={16} /> Đăng nhập lại
      </button>
    </div>
  </div>
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // Khôi phục trạng thái đăng nhập khi F5 trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Kiểm tra thời gian KHÔNG tương tác (Inactivity) quá 20 phút (20 * 60 * 1000 = 1.200.000 ms)
  useEffect(() => {
    if (!user) return;

    // Cập nhật thời gian hoạt động gần nhất
    const updateActivity = () => {
      const now = Date.now();
      const lastActivity = localStorage.getItem("lastActivityTime");
      // Cập nhật tối đa 1 lần mỗi 5 giây để tránh spam localStorage
      if (!lastActivity || now - Number(lastActivity) > 5000) {
        localStorage.setItem("lastActivityTime", now.toString());
      }
    };

    // Đánh dấu hoạt động ban đầu
    updateActivity();

    // Lắng nghe các thao tác của người dùng trên ứng dụng
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    const checkTimeout = () => {
      const lastActivity = localStorage.getItem("lastActivityTime") || localStorage.getItem("loginTime");
      if (lastActivity) {
        const inactiveTime = Date.now() - Number(lastActivity);
        if (inactiveTime >= 20 * 60 * 1000) {
          setShowSessionExpiredModal(true);
        }
      }
    };

    checkTimeout();
    const interval = setInterval(checkTimeout, 5000); // Kiểm tra mỗi 5 giây

    const handleExpiredEvent = () => setShowSessionExpiredModal(true);
    window.addEventListener("session-expired", handleExpiredEvent);

    return () => {
      clearInterval(interval);
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      window.removeEventListener("session-expired", handleExpiredEvent);
    };
  }, [user]);

  const saveAuthSession = (user, token) => {
    const now = Date.now().toString();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("loginTime", now);
    localStorage.setItem("lastActivityTime", now);
    setUser(user);
    setShowSessionExpiredModal(false);
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, token } = res.data;
    saveAuthSession(user, token);
    return user;
  };

  const loginGoogle = async (idToken) => {
    const res = await api.post("/auth/google", { id_token: idToken });
    const { user, token } = res.data;
    saveAuthSession(user, token);
    return user;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    const { user, token } = res.data;
    saveAuthSession(user, token);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("lastActivityTime");
    setUser(null);
    setShowSessionExpiredModal(false);
  };

  const handleConfirmSessionExpired = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, loginGoogle, register, logout }}>
      {showSessionExpiredModal && (
        <SessionExpiredModal onConfirm={handleConfirmSessionExpired} />
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);