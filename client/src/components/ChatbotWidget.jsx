import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, User, Bot, ChevronRight } from "lucide-react";
import { sendChatMessage } from "../services/chatbot.service";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const BUYER_ACTIONS = ["Quán ngon gần tôi", "Đơn hàng của tôi", "Khuyến mãi hôm nay", "Đặt món như thế nào?"];
const SELLER_ACTIONS = ["Doanh thu Shop", "Đơn hàng cần xử lý", "Thực đơn hiện tại"];
const SHIPPER_ACTIONS = ["Đơn khả dụng", "Đơn của tôi", "Tính phí ship"];
const ADMIN_ACTIONS = ["Quán chờ duyệt", "Tổng đơn hệ thống"];

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const role = user?.role || "buyer";

  const quickActions = role === "seller" ? SELLER_ACTIONS : role === "shipper" ? SHIPPER_ACTIONS : role === "admin" ? ADMIN_ACTIONS : BUYER_ACTIONS;

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: role === "seller"
        ? "Xin chào Chủ quán! Tôi là trợ lý AI dành cho Chủ quán FoodGo ✦. Tôi có thể hỗ trợ bạn kiểm tra báo cáo doanh thu, đơn hàng cần làm và thực đơn!"
        : role === "shipper"
        ? "Xin chào Tài xế! Tôi là trợ lý AI dành cho Shipper ✦. Tôi giúp bạn xem đơn khả dụng gần đây, tính phí ship và chỉ đường!"
        : role === "admin"
        ? "Xin chào Quản trị viên! Tôi là trợ lý AI Antigravity Admin ✦. Tôi có thể báo cáo số liệu shop chờ duyệt và tổng đơn hệ thống!"
        : "Xin chào! Tôi là trợ lý FoodGo ✦. Tôi có thể giúp bạn gợi ý món ăn, tìm quán ngon, kiểm tra đơn hàng hoặc áp mã giảm giá!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(query);
      const botMsg = { sender: "bot", text: res.reply, action: res.action };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action === "login") navigate("/login");
    else if (action === "view_orders") navigate("/orders");
    else if (action === "browse_shops") navigate("/");
    else if (action === "use_voucher") navigate("/checkout");
    else if (action === "create_shop") navigate("/seller/shop");
    else if (action === "view_dashboard") navigate("/seller/dashboard");
    else if (action === "view_shop_orders") navigate("/seller/orders");
    else if (action === "view_products") navigate("/seller/products");
    else if (action === "available_shipments" || action === "my_shipments") navigate("/shipper/orders");
    else if (action === "admin_shops") navigate("/admin/shops");
    else if (action === "admin_orders") navigate("/admin/orders");
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1500 }}>
      {/* Floating Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
            color: "#fff",
            border: "none",
            boxShadow: "0 8px 24px rgba(122, 31, 43, 0.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          title="Trợ lý tư vấn FoodGo"
        >
          <Sparkles size={24} color="var(--color-gold)" />
        </button>
      )}

      {/* Floating Chat Panel */}
      {open && (
        <div
          style={{
            width: "clamp(320px, 90vw, 380px)",
            height: 520,
            background: "var(--color-white)",
            borderRadius: 20,
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            border: "1px solid var(--color-border-light)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideUp 0.25s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={20} color="var(--color-gold)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Trợ lý FoodGo AI ✦</div>
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Tư vấn món & đơn hàng 24/7</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: 4,
                opacity: 0.8,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Action Chips */}
          <div
            style={{
              padding: "10px 14px",
              background: "var(--color-cream-pale)",
              borderBottom: "1px solid var(--color-border-light)",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action)}
                style={{
                  whiteSpace: "nowrap",
                  fontSize: 11.5,
                  padding: "5px 11px",
                  borderRadius: 20,
                  background: "var(--color-white)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-ink)",
                  cursor: "pointer",
                  fontWeight: 500,
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                {action}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "var(--color-bg)",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
                  gap: 8,
                }}
              >
                {m.sender === "bot" && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--color-primary-pale)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Bot size={15} color="var(--color-primary)" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: m.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                    background: m.sender === "user" ? "var(--color-primary)" : "var(--color-white)",
                    color: m.sender === "user" ? "#fff" : "var(--color-ink)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    border: m.sender === "bot" ? "1px solid var(--color-border-light)" : "none",
                  }}
                >
                  {m.text}

                  {m.action && (
                    <button
                      onClick={() => handleActionClick(m.action)}
                      style={{
                        marginTop: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--color-primary)",
                        background: "var(--color-gold-pale)",
                        border: "1px solid var(--color-gold-soft)",
                        padding: "4px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Xem ngay <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ padding: "8px 14px", background: "var(--color-white)", borderRadius: 12 }}>
                  <Loader2 size={16} className="spin" color="var(--color-muted)" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "12px 16px",
              background: "var(--color-white)",
              borderTop: "1px solid var(--color-border-light)",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder="Hỏi trợ lý FoodGo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                border: "1px solid var(--color-border)",
                borderRadius: 20,
                padding: "8px 14px",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--color-primary)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
