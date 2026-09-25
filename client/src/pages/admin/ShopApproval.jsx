import { useState, useEffect } from "react";
import { listShopsForReview, approveShop } from "../../services/admin.service";
import DashboardLayout from "../../components/DashboardLayout";
import { CheckCircle2, XCircle, Clock, Store, Lock, EyeOff, ShieldCheck } from "lucide-react";

const STATUS_CONFIG = {
  pending:   { label: "Chờ duyệt",  badge: "badge-warning", Icon: Clock },
  approved:  { label: "Hoạt động",  badge: "badge-success", Icon: CheckCircle2 },
  rejected:  { label: "Từ chối",    badge: "badge-danger",  Icon: XCircle },
  suspended: { label: "Tạm khóa",   badge: "badge-danger",  Icon: Lock },
  hidden:    { label: "Đã ẩn",      badge: "",              Icon: EyeOff },
};

const FILTER_TABS = [
  { value: "pending",   label: "Chờ duyệt" },
  { value: "approved",  label: "Hoạt động" },
  { value: "suspended", label: "Tạm khóa" },
  { value: "hidden",    label: "Đã ẩn" },
  { value: "rejected",  label: "Từ chối" },
  { value: "",          label: "Tất cả" },
];

const ShopApproval = () => {
  const [shops, setShops] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchShops = async () => {
    setLoading(true);
    try { setShops((await listShopsForReview(filterStatus ? { status: filterStatus } : {})).shops); }
    catch { setError("Không tải được danh sách shop"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShops(); }, [filterStatus]);

  const handleApprove = async (id, status) => {
    setActionLoading(id);
    try { await approveShop(id, status); fetchShops(); }
    catch (err) { setError(err.response?.data?.message || "Thao tác thất bại"); }
    finally { setActionLoading(null); }
  };

  return (
    <DashboardLayout title="Quản lý & Duyệt shop" subtitle="Kiểm duyệt và quản lý trạng thái các quán ăn trong hệ thống">
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {FILTER_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setFilterStatus(tab.value)}
            className={`tab-btn ${filterStatus === tab.value ? "active" : ""}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && shops.length === 0 && (
        <div className="empty-state card card-body" style={{ padding: 48 }}>
          <div style={{ marginBottom: 16 }}><Store size={40} style={{ opacity: 0.2, margin: "0 auto" }} /></div>
          <div className="empty-state-title">Không có shop nào</div>
          <p className="empty-state-desc">Không có shop nào trong trạng thái này.</p>
        </div>
      )}

      {!loading && shops.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="simple-table">
            <thead>
              <tr><th>Tên shop</th><th>Địa chỉ</th><th>Trạng thái</th><th style={{ textAlign: "right" }}>Thao tác quản lý</th></tr>
            </thead>
            <tbody>
              {shops.map((shop) => {
                const cfg = STATUS_CONFIG[shop.status] || { label: shop.status, badge: "", Icon: Store };
                const StatusIcon = cfg.Icon;
                return (
                  <tr key={shop._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt={shop.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--color-cream-mid)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Store size={18} color="var(--color-primary)" />
                          </div>
                        )}
                        <div>
                          <span style={{ fontWeight: 700, display: "block" }}>{shop.name}</span>
                          <span className="text-muted" style={{ fontSize: 12 }}>{shop.city || "TP. Hồ Chí Minh"}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-muted" style={{ fontSize: 13 }}>{shop.address || "Chưa cập nhật"}</span></td>
                    <td>
                      <span className={`badge ${cfg.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {shop.status === "pending" && (
                          <>
                            <button onClick={() => handleApprove(shop._id, "approved")}
                              disabled={actionLoading === shop._id} className="btn btn-primary btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle2 size={13} /> Duyệt shop
                            </button>
                            <button onClick={() => handleApprove(shop._id, "rejected")}
                              disabled={actionLoading === shop._id} className="btn btn-danger btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <XCircle size={13} /> Từ chối
                            </button>
                          </>
                        )}
                        {shop.status === "approved" && (
                          <>
                            <button onClick={() => handleApprove(shop._id, "suspended")}
                              disabled={actionLoading === shop._id} className="btn btn-outline btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-danger)", borderColor: "var(--color-danger)" }}>
                              <Lock size={13} /> Tạm khóa
                            </button>
                            <button onClick={() => handleApprove(shop._id, "hidden")}
                              disabled={actionLoading === shop._id} className="btn btn-ghost btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <EyeOff size={13} /> Ẩn shop
                            </button>
                          </>
                        )}
                        {(shop.status === "suspended" || shop.status === "hidden" || shop.status === "rejected") && (
                          <button onClick={() => handleApprove(shop._id, "approved")}
                            disabled={actionLoading === shop._id} className="btn btn-primary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <ShieldCheck size={13} /> Mở hoạt động
                          </button>
                        )}
                      </div>
                    </td>
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

export default ShopApproval;