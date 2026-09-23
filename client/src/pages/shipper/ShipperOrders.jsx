import { useState, useEffect } from "react";
import { listAvailableShipments, listMyShipments, claimShipment, confirmPickup, markDelivered } from "../../services/shipment.service";
import DashboardLayout from "../../components/DashboardLayout";
import { Truck, Package, CheckCircle2, MapPin, Store, Clock, Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  UNASSIGNED:        { label: "Chờ nhận",   badge: "badge-warning", Icon: Clock },
  ASSIGNED:          { label: "Đã nhận",    badge: "badge-primary", Icon: Package },
  HANDED_TO_SHIPPER: { label: "Đang giao",  badge: "badge-warning", Icon: Truck },
  DELIVERED:         { label: "Đã giao",    badge: "badge-success", Icon: CheckCircle2 },
};

const ShipperOrders = () => {
  const [tab, setTab] = useState("available");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      setShipments((tab === "available" ? await listAvailableShipments() : await listMyShipments()).shipments);
    } catch { setError("Không tải được danh sách đơn"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const handleClaim = async (id) => {
    setActionLoading(id); setError("");
    try { await claimShipment(id); setTab("mine"); }
    catch (err) { setError(err.response?.data?.message || "Đơn này đã có người nhận"); fetchData(); }
    finally { setActionLoading(null); }
  };

  const handleAction = async (fn, id) => {
    setActionLoading(id); setError("");
    try { await fn(id); fetchData(); }
    catch (err) { setError(err.response?.data?.message || "Thao tác thất bại"); }
    finally { setActionLoading(null); }
  };

  return (
    <DashboardLayout title="Đơn giao hàng" subtitle={!loading ? `${shipments.length} đơn trong danh sách` : ""}>
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button onClick={() => setTab("available")} className={`tab-btn ${tab === "available" ? "active" : ""}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <Package size={14} /> Đơn khả dụng
        </button>
        <button onClick={() => setTab("mine")} className={`tab-btn ${tab === "mine" ? "active" : ""}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <Truck size={14} /> Đơn của tôi
        </button>
      </div>

      {loading && <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && shipments.length === 0 && (
        <div className="empty-state card card-body" style={{ padding: 48 }}>
          <div style={{ marginBottom: 16 }}>
            {tab === "available"
              ? <Package size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
              : <Truck size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
            }
          </div>
          <div className="empty-state-title">
            {tab === "available" ? "Không có đơn khả dụng" : "Bạn chưa nhận đơn nào"}
          </div>
          <p className="empty-state-desc">
            {tab === "available"
              ? "Đơn hàng sẵn sàng giao sẽ xuất hiện ở đây."
              : "Nhận đơn từ tab \"Đơn khả dụng\" để bắt đầu giao hàng."}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shipments.map((s) => {
          const cfg = STATUS_CONFIG[s.status] || { label: s.status, badge: "", Icon: Package };
          const StatusIcon = cfg.Icon;
          return (
            <div key={s.shipment_id} className="card card-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`badge ${cfg.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <StatusIcon size={11} /> {cfg.label}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--color-muted)", fontFamily: "monospace" }}>
                    #{s.shipment_id?.slice(-8).toUpperCase()}
                  </span>
                </div>
                {s.shop_order && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Truck size={14} color="var(--color-primary)" />
                    <span className="text-price" style={{ fontSize: 15 }}>
                      {s.shop_order.shipping_fee?.toLocaleString()}đ
                    </span>
                  </div>
                )}
              </div>

              {s.shop_order && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <Store size={14} color="var(--color-muted)" /> {s.shop_order.shop_name}
                  </div>
                  <div className="text-muted" style={{ fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={12} /> {s.shop_order.shop_address}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {s.shop_order.items.map((item) => (
                      <p key={item._id} style={{ margin: 0, fontSize: 13, color: "var(--color-muted)" }}>
                        {item.product_name_snapshot} ×{item.quantity}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                {tab === "available" && (
                  <button onClick={() => handleClaim(s.shipment_id)}
                    disabled={actionLoading === s.shipment_id} className="btn btn-primary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {actionLoading === s.shipment_id
                      ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />Đang nhận...</>
                      : <><Package size={13} />Nhận đơn này</>
                    }
                  </button>
                )}
                {tab === "mine" && s.status === "ASSIGNED" && (
                  <button onClick={() => handleAction(confirmPickup, s.shipment_id)}
                    disabled={actionLoading === s.shipment_id} className="btn btn-primary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {actionLoading === s.shipment_id
                      ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />Xử lý...</>
                      : <><Truck size={13} />Đã lấy hàng</>
                    }
                  </button>
                )}
                {tab === "mine" && s.status === "HANDED_TO_SHIPPER" && (
                  <button onClick={() => handleAction(markDelivered, s.shipment_id)}
                    disabled={actionLoading === s.shipment_id} className="btn btn-primary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {actionLoading === s.shipment_id
                      ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />Xử lý...</>
                      : <><CheckCircle2 size={13} />Đã giao xong</>
                    }
                  </button>
                )}
                {tab === "mine" && s.status === "DELIVERED" && (
                  <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <CheckCircle2 size={12} /> Hoàn tất
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
};

export default ShipperOrders;