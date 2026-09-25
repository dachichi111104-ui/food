import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Store, Truck, ShieldAlert, Loader2, Package, Lock } from "lucide-react";
import { getMessages, sendMessage } from "../services/message.service";
import { listMyShopOrders } from "../services/shopOrder.service";
import { listMyOrders } from "../services/order.service";
import { listMyShipments } from "../services/shipment.service";
import { listPublicShops } from "../services/shop.service";
import { useAuth } from "../context/AuthContext";

const LiveChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState("seller");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* Contextual active entities list (Active orders / Shipments / Shops) */
  const [activeItems, setActiveItems] = useState([]);
  const [selectedContextItem, setSelectedContextItem] = useState(null);

  const messagesEndRef = useRef(null);
  const role = user?.role || "buyer";

  useEffect(() => {
    if (role === "seller") setTargetRole("buyer");
    else if (role === "shipper") setTargetRole("buyer");
    else if (role === "admin") setTargetRole("seller");
    else setTargetRole("seller");
  }, [role]);

  /* Fetch active contextual items based on current role */
  const fetchActiveContextItems = async () => {
    if (!user) return;
    try {
      if (role === "seller") {
        const res = await listMyShopOrders({});
        const allOrders = res.shopOrders || [];
        setActiveItems(allOrders);
        if (allOrders.length > 0 && (!selectedContextItem || !allOrders.some((o) => o._id === selectedContextItem._id))) {
          setSelectedContextItem(allOrders[0]);
        }
      } else if (role === "shipper") {
        const res = await listMyShipments({});
        const allShipments = res.shipments || [];
        setActiveItems(allShipments);
        if (allShipments.length > 0 && (!selectedContextItem || !allShipments.some((s) => (s.shipment_id || s._id) === (selectedContextItem.shipment_id || selectedContextItem._id)))) {
          setSelectedContextItem(allShipments[0]);
        }
      } else if (role === "buyer") {
        const res = await listMyOrders({});
        const allOrders = res.orders || [];
        setActiveItems(allOrders);
        if (allOrders.length > 0 && (!selectedContextItem || !allOrders.some((o) => o._id === selectedContextItem._id))) {
          setSelectedContextItem(allOrders[0]);
        }
      } else if (role === "admin") {
        const res = await listPublicShops({});
        const allShops = res.shops || [];
        setActiveItems(allShops);
        if (allShops.length > 0 && (!selectedContextItem || !allShops.some((s) => s._id === selectedContextItem._id))) {
          setSelectedContextItem(allShops[0]);
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const orderId = selectedContextItem?._id || selectedContextItem?.shipment_id || selectedContextItem?.shop_order?.id;
      const params = { target_role: targetRole };
      if (orderId) params.order_id = orderId;

      const data = await getMessages(params);
      const rawMessages = data.messages || [];
      setMessages(rawMessages);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Không thể tải tin nhắn");
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchActiveContextItems();
      fetchMessages();
      const interval = setInterval(fetchMessages, 3500);
      return () => clearInterval(interval);
    }
  }, [open, targetRole, selectedContextItem, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  const orderStatus = selectedContextItem?.status || selectedContextItem?.shop_order?.status || "";
  const isClosedOrder = ["COMPLETED", "DELIVERED", "CANCELLED", "REFUNDED"].includes(orderStatus);

  const handleSendText = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading || isClosedOrder) return;

    setInput("");
    setLoading(true);
    setErrorMessage("");

    try {
      const targetId = selectedContextItem?._id || selectedContextItem?.shipment_id || selectedContextItem?.shop_order?.id;
      const targetCode = targetId ? `#${targetId.slice(-6).toUpperCase()}` : "";

      const payload = {
        target_role: targetRole,
        text,
      };

      if (targetId) {
        payload.order_id = targetId;
        payload.order_code = targetCode;
      }

      await sendMessage(payload);
      fetchMessages();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Lỗi gửi tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleSendForm = (e) => {
    e.preventDefault();
    handleSendText(input);
  };

  // Define channels according to role and order status rules
  const CHANNELS = [
    { key: "seller", label: "Chủ Quán", Icon: Store, show: role !== "seller" },
    { key: "shipper", label: "Tài xế Shipper", Icon: Truck, show: role !== "shipper" },
    { key: "admin", label: "Admin Hỗ trợ", Icon: ShieldAlert, show: role !== "admin" },
    { key: "buyer", label: "Khách hàng", Icon: User, show: role !== "buyer" },
  ].filter((c) => c.show);

  /* Helper to format context banner title */
  const getContextBannerText = () => {
    if (!selectedContextItem) {
      return targetRole === "admin" ? "Hỗ trợ Admin FoodGo" : `Kênh ${CHANNELS.find((c) => c.key === targetRole)?.label}`;
    }

    const orderCode = `#${(selectedContextItem._id || selectedContextItem.shipment_id || "").slice(-6).toUpperCase()}`;

    if (role === "buyer") {
      if (targetRole === "seller") return `📌 Đang chat với Chủ Quán (Đơn ${orderCode})`;
      if (targetRole === "shipper") return `📌 Đang chat với Shipper (Đơn ${orderCode})`;
      return `📌 Đang chat với Admin Hỗ trợ`;
    }

    if (role === "seller") {
      if (targetRole === "buyer") return `📌 Đang chat với Khách hàng (Đơn ${orderCode})`;
      if (targetRole === "shipper") return `📌 Đang chat với Shipper (Đơn ${orderCode})`;
      return `📌 Đang chat với Admin Hỗ trợ`;
    }

    if (role === "shipper") {
      if (targetRole === "buyer") return `📌 Đang chat với Khách hàng (Đơn ${orderCode})`;
      if (targetRole === "seller") return `📌 Đang chat với Chủ Quán (Đơn ${orderCode})`;
      return `📌 Đang chat với Admin Hỗ trợ`;
    }

    if (role === "admin") {
      return `📌 Admin Hỗ trợ Tranh chấp / Đơn hàng ${orderCode}`;
    }

    return "Kênh Chat Trực Tiếp";
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 92, zIndex: 1500 }}>
      {/* Floating Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)",
            color: "#fff",
            border: "none",
            boxShadow: "0 8px 24px rgba(26, 54, 93, 0.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          title="Trò chuyện trực tiếp FoodGo (Seller - Buyer - Shipper - Admin)"
        >
          <MessageCircle size={24} color="#fff" />
        </button>
      )}

      {/* Floating Chat Window */}
      {open && (
        <div
          style={{
            width: "clamp(340px, 92vw, 420px)",
            height: 560,
            background: "var(--color-white)",
            borderRadius: 20,
            boxShadow: "0 14px 45px rgba(0,0,0,0.25)",
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
              padding: "14px 18px",
              background: "linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <MessageCircle size={20} color="#fff" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>Kênh Chat Trực Tiếp FoodGo</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>Tích hợp thông tin Đơn hàng & Người dùng</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.85 }}>
              <X size={20} />
            </button>
          </div>

          {/* Role Channel Tabs */}
          <div style={{ display: "flex", background: "var(--color-cream-mid)", borderBottom: "1px solid var(--color-border)" }}>
            {CHANNELS.map(({ key, label, Icon }) => {
              const isActive = targetRole === key;
              return (
                <button
                  key={key}
                  onClick={() => setTargetRole(key)}
                  style={{
                    flex: 1,
                    padding: "9px 4px",
                    border: "none",
                    background: isActive ? "#fff" : "transparent",
                    color: isActive ? "var(--color-primary)" : "var(--color-muted)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 11.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    borderBottom: isActive ? "2px solid var(--color-primary)" : "none",
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              );
            })}
          </div>

          {/* Active Context Items Dropdown Selector */}
          {activeItems.length > 0 && targetRole !== "admin" && (
            <div style={{ padding: "8px 12px", background: "var(--color-cream-pale)", borderBottom: "1px solid var(--color-border)", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={14} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, flexShrink: 0 }}>Đơn hàng:</span>
              <select
                value={selectedContextItem?._id || selectedContextItem?.shipment_id || ""}
                onChange={(e) => {
                  const item = activeItems.find((i) => (i._id || i.shipment_id) === e.target.value);
                  setSelectedContextItem(item || null);
                }}
                style={{ flex: 1, padding: "4px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: 12, outline: "none" }}
              >
                {activeItems.map((item) => {
                  const itemId = item._id || item.shipment_id || item.shop_order?.id;
                  const itemCode = itemId ? `#${itemId.slice(-6).toUpperCase()}` : "";
                  let label = `Đơn ${itemCode} (${item.status || "Mới"})`;

                  if (role === "seller") {
                    label = `Khách: ${item.recipient_name || "Khách"} (${itemCode}) - ${item.status}`;
                  } else if (role === "shipper") {
                    const shopName = item.shop_order?.shop_name || "Quán";
                    label = `Đơn ${itemCode} - Quán: ${shopName}`;
                  }

                  return (
                    <option key={itemId} value={itemId}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Context Banner Line */}
          <div style={{ padding: "6px 14px", background: isClosedOrder ? "#FFF5F5" : "var(--color-primary-pale)", borderBottom: "1px solid var(--color-border-light)", fontSize: 11.5, color: isClosedOrder ? "#C53030" : "var(--color-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            {isClosedOrder && <Lock size={12} />}
            <span>{getContextBannerText()}</span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ padding: "6px 12px", background: "#FED7D7", color: "#9B2C2C", fontSize: 11.5, fontWeight: 600 }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Messages Body */}
          <div style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, background: "var(--color-bg)" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--color-muted)", fontSize: 13, marginTop: 40 }}>
                <p>Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
                {!isClosedOrder && <p style={{ fontSize: 12, marginTop: 4 }}>Nhập tin nhắn bên dưới để liên hệ trực tiếp!</p>}
              </div>
            ) : (
              messages.map((m) => {
                const currentUserId = String(user._id || user.id);
                const senderId = String(m.sender_id?._id || m.sender_id || "");
                const isMe = senderId === currentUserId;

                return (
                  <div key={m._id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "84%" }}>
                    {!isMe && (
                      <div style={{ fontSize: 10.5, color: "var(--color-muted)", marginBottom: 2, fontWeight: 700 }}>
                        {m.sender_name} ({m.sender_role}) {m.order_code && <span style={{ color: "var(--color-primary)" }}>{m.order_code}</span>}
                      </div>
                    )}
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        background: isMe ? "var(--color-primary)" : "#fff",
                        color: isMe ? "#fff" : "var(--color-ink)",
                        fontSize: 13,
                        lineHeight: 1.45,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        border: isMe ? "none" : "1px solid var(--color-border-light)",
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input / Closed Notice */}
          {isClosedOrder ? (
            <div style={{ padding: "12px", background: "#EDF2F7", textAlign: "center", fontSize: 12, color: "#4A5568", fontWeight: 600, borderTop: "1px solid var(--color-border-light)" }}>
              🔒 Đơn hàng đã kết thúc/hủy. Lịch sử trò chuyện được lưu trữ chỉ để xem lại.
            </div>
          ) : (
            <form onSubmit={handleSendForm} style={{ padding: "10px 12px", background: "#fff", borderTop: "1px solid var(--color-border-light)", display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder={`Nhắn cho ${CHANNELS.find((c) => c.key === targetRole)?.label || "bên nhận"}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, border: "1px solid var(--color-border)", borderRadius: 20, padding: "7px 12px", fontSize: 13, outline: "none" }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: 34, height: 34, borderRadius: "50%", background: "var(--color-primary)", color: "#fff",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: loading || !input.trim() ? 0.5 : 1,
                }}
              >
                {loading ? <Loader2 size={15} className="spin" /> : <Send size={14} />}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveChatWidget;
