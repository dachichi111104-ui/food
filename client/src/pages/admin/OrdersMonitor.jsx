import { useState, useEffect } from "react";
import { listAllOrders } from "../../services/admin.service";
import DashboardLayout from "../../components/DashboardLayout";
import { LayoutDashboard, Clock, CheckCircle2, XCircle, Package } from "lucide-react";

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", badge: "badge-warning", Icon: Clock },
  PAID:            { label: "Đã thanh toán",  badge: "badge-success", Icon: CheckCircle2 },
  CANCELLED:       { label: "Đã hủy",          badge: "badge-danger",  Icon: XCircle },
  COMPLETED:       { label: "Hoàn tất",         badge: "badge-success", Icon: CheckCircle2 },
};

const FILTER_TABS = [
  { value: "",                label: "Tất cả" },
  { value: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { value: "PAID",            label: "Đã thanh toán" },
  { value: "CANCELLED",       label: "Đã hủy" },
];

const OrdersMonitor = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listAllOrders(filterStatus ? { status: filterStatus } : {}).then((data) => setOrders(data.orders)).finally(() => setLoading(false));
  }, [filterStatus]);

  return (
    <DashboardLayout title="Giám sát đơn hàng" subtitle={!loading ? `${orders.length} đơn hàng` : ""}>
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {FILTER_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setFilterStatus(tab.value)}
            className={`tab-btn ${filterStatus === tab.value ? "active" : ""}`}>{tab.label}</button>
        ))}
      </div>

      {loading && <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>}

      {!loading && orders.length === 0 && (
        <div className="empty-state card card-body" style={{ padding: 48 }}>
          <div style={{ marginBottom: 16 }}><LayoutDashboard size={40} style={{ opacity: 0.2, margin: "0 auto" }} /></div>
          <div className="empty-state-title">Không có đơn hàng</div>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="simple-table">
            <thead>
              <tr><th>Mã đơn</th><th>Trạng thái</th><th>Tổng tiền</th><th>Ngày tạo</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const cfg = STATUS_CONFIG[o.status] || { label: o.status, badge: "", Icon: Package };
                const StatusIcon = cfg.Icon;
                return (
                  <tr key={o._id}>
                    <td><span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>#{o._id.slice(-8).toUpperCase()}</span></td>
                    <td>
                      <span className={`badge ${cfg.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                    </td>
                    <td><span className="text-price" style={{ fontSize: 14 }}>{o.total_amount.toLocaleString()}đ</span></td>
                    <td className="text-muted" style={{ fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrdersMonitor;