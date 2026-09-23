import { useState, useEffect } from "react";
import { listReports, resolveReport } from "../../services/admin.service";
import DashboardLayout from "../../components/DashboardLayout";
import { Flag, CheckCircle2, AlertCircle } from "lucide-react";

const FILTER_TABS = [
  { value: "OPEN",     label: "Chưa xử lý" },
  { value: "RESOLVED", label: "Đã xử lý" },
  { value: "",         label: "Tất cả" },
];

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try { setReports((await listReports(filterStatus ? { status: filterStatus } : {})).reports); }
    catch { setError("Không tải được report"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [filterStatus]);

  const handleResolve = async (id) => {
    const note = window.prompt("Nhập ghi chú xử lý:");
    if (!note) return;
    try { await resolveReport(id, note); fetchReports(); }
    catch (err) { setError(err.response?.data?.message || "Xử lý thất bại"); }
  };

  return (
    <DashboardLayout title="Quản lý khiếu nại" subtitle="Xem và xử lý các khiếu nại từ người dùng">
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {FILTER_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setFilterStatus(tab.value)}
            className={`tab-btn ${filterStatus === tab.value ? "active" : ""}`}>{tab.label}</button>
        ))}
      </div>

      {loading && <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && reports.length === 0 && (
        <div className="empty-state card card-body" style={{ padding: 48 }}>
          <div style={{ marginBottom: 16 }}><Flag size={40} style={{ opacity: 0.2, margin: "0 auto" }} /></div>
          <div className="empty-state-title">Không có khiếu nại nào</div>
          <p className="empty-state-desc">Không có khiếu nại trong trạng thái này.</p>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map((r) => (
            <div key={r._id} className="card card-body">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.reason}</div>
                <span className={`badge ${r.status === "OPEN" ? "badge-warning" : "badge-success"}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  {r.status === "OPEN"
                    ? <AlertCircle size={11} />
                    : <CheckCircle2 size={11} />
                  }
                  {r.status === "OPEN" ? "Chưa xử lý" : "Đã xử lý"}
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>{r.description}</p>
              {r.resolution_note && (
                <div style={{
                  padding: "10px 14px", background: "var(--color-success-bg)",
                  borderRadius: "var(--radius-xs)", fontSize: 13,
                  color: "var(--color-success)", marginBottom: 10,
                  display: "flex", alignItems: "flex-start", gap: 7,
                }}>
                  <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  Ghi chú xử lý: {r.resolution_note}
                </div>
              )}
              {r.status === "OPEN" && (
                <button onClick={() => handleResolve(r._id)} className="btn btn-primary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <CheckCircle2 size={14} /> Đánh dấu đã xử lý
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReportManagement;