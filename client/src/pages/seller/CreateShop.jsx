import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMyShop, createShop, updateMyShop } from "../../services/shop.service";
import DashboardLayout from "../../components/DashboardLayout";
import { Store, MapPin, CheckCircle2, Clock, XCircle, ChevronRight, Loader2, Pencil, Camera, X } from "lucide-react";

const STATUS_CONFIG = {
  approved: { label: "Đã duyệt",       badge: "badge-success", Icon: CheckCircle2 },
  pending:  { label: "Đang chờ duyệt", badge: "badge-warning",  Icon: Clock },
  rejected: { label: "Bị từ chối",     badge: "badge-danger",   Icon: XCircle },
};

const CreateShop = () => {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", address: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    getMyShop().then((data) => setShop(data.shop)).catch(() => setShop(null)).finally(() => setLoading(false));
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description || "");
    fd.append("address", form.address || "");
    if (logoFile) fd.append("logo", logoFile);
    if (coverFile) fd.append("cover", coverFile);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try { setShop((await createShop(buildFormData())).shop); }
    catch (err) { setError(err.response?.data?.message || "Tạo shop thất bại"); }
    finally { setSubmitting(false); }
  };

  const startEditing = () => {
    setForm({
      name: shop.name || "",
      description: shop.description || "",
      address: shop.address || "",
    });
    setLogoFile(null); setLogoPreview(null);
    setCoverFile(null); setCoverPreview(null);
    setError("");
    setEditing(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const updated = (await updateMyShop(buildFormData())).shop;
      setShop(updated);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <DashboardLayout title="Shop của tôi">
      <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>
    </DashboardLayout>
  );

  if (shop && !editing) {
    const cfg = STATUS_CONFIG[shop.status] || { label: shop.status, badge: "", Icon: Store };
    const StatusIcon = cfg.Icon;
    return (
      <DashboardLayout title="Shop của tôi" actions={
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={startEditing} className="btn btn-outline"
            style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Pencil size={14} /> Sửa thông tin & ảnh
          </button>
          {shop.status === "approved" && (
            <button onClick={() => navigate("/seller/products")} className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Quản lý sản phẩm <ChevronRight size={15} />
            </button>
          )}
        </div>
      }>
        <div style={{ maxWidth: 600 }}>
          {shop.cover_url && (
            <div style={{
              width: "100%", height: 160, borderRadius: "var(--radius-md)",
              overflow: "hidden", marginBottom: 20, background: "var(--color-cream-mid)",
            }}>
              <img src={shop.cover_url} alt={`Ảnh bìa ${shop.name}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}
          <div className="card card-body" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "var(--radius-md)",
                background: "var(--color-cream-mid)", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {shop.logo_url
                  ? <img src={shop.logo_url} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Store size={32} color="var(--color-primary)" />
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h2 style={{ fontSize: 22 }}>{shop.name}</h2>
                  <span className={`badge ${cfg.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <StatusIcon size={12} /> {cfg.label}
                  </span>
                </div>
                {shop.address && (
                  <p className="text-muted" style={{ fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={13} /> {shop.address}
                  </p>
                )}
                {shop.description && (
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-muted)" }}>{shop.description}</p>
                )}
              </div>
            </div>
          </div>

          {shop.status === "pending" && (
            <div className="alert alert-info" style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Clock size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              Shop của bạn đang chờ đội ngũ FoodGo xét duyệt (1–2 ngày làm việc). Chúng tôi sẽ thông báo khi có kết quả.
            </div>
          )}
          {shop.status === "rejected" && (
            <div className="alert alert-error" style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <XCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              Shop của bạn bị từ chối. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.
            </div>
          )}
          {shop.status === "approved" && (
            <div className="alert alert-success" style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              Shop của bạn đã được duyệt. Bắt đầu thêm sản phẩm để nhận đơn hàng!
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  const isEditMode = Boolean(shop) && editing;

  return (
    <DashboardLayout
      title={isEditMode ? "Sửa thông tin shop" : "Tạo shop của bạn"}
      subtitle={isEditMode ? "Cập nhật ảnh đại diện, ảnh bìa và thông tin quán" : "Điền thông tin để đăng ký quán ăn trên FoodGo"}
    >
      <div style={{ maxWidth: 520 }}>
        <div className="card card-body">
          <form onSubmit={isEditMode ? handleUpdateSubmit : handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Ảnh đại diện (logo) */}
            <div className="field">
              <label>Ảnh đại diện shop</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  onClick={() => logoInputRef.current?.click()}
                  style={{
                    width: 72, height: 72, borderRadius: "var(--radius-md)",
                    background: "var(--color-cream-mid)", overflow: "hidden", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    border: "1px dashed var(--color-border)", position: "relative",
                  }}
                >
                  {logoPreview || shop?.logo_url
                    ? <img src={logoPreview || shop.logo_url} alt="Xem trước logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Camera size={22} color="var(--color-muted)" />
                  }
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => logoInputRef.current?.click()}>
                  {shop?.logo_url || logoPreview ? "Đổi ảnh" : "Chọn ảnh"}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
              </div>
            </div>

            {/* Ảnh bìa (cover) */}
            <div className="field">
              <label>Ảnh bìa shop</label>
              <div
                onClick={() => coverInputRef.current?.click()}
                style={{
                  width: "100%", height: 120, borderRadius: "var(--radius-md)",
                  background: "var(--color-cream-mid)", overflow: "hidden", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px dashed var(--color-border)", position: "relative",
                }}
              >
                {coverPreview || shop?.cover_url
                  ? <img src={coverPreview || shop.cover_url} alt="Xem trước ảnh bìa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-muted)", fontSize: 13 }}><Camera size={16} /> Chọn ảnh bìa</span>
                }
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} style={{ display: "none" }} />
            </div>

            <div className="field"><label>Tên shop *</label>
              <input className="input" placeholder="VD: Cơm nhà Hai Bà"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field"><label>Mô tả</label>
              <textarea className="input" placeholder="Giới thiệu về quán ăn của bạn..."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ minHeight: 90, resize: "vertical" }} />
            </div>
            <div className="field"><label>Địa chỉ</label>
              <div style={{ position: "relative" }}>
                <MapPin size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)", pointerEvents: "none" }} />
                <input className="input" style={{ paddingLeft: 40 }} placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM"
                  value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flex: 1 }}>
                {submitting
                  ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />Đang lưu...</>
                  : (isEditMode ? "Lưu thay đổi" : "Đăng ký shop")}
              </button>
              {isEditMode && (
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <X size={15} /> Huỷ
                </button>
              )}
            </div>
          </form>
        </div>
        {!isEditMode && (
          <div className="alert alert-info" style={{ marginTop: 16, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Clock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            Sau khi đăng ký, shop sẽ được đội ngũ FoodGo xét duyệt trong 1–2 ngày làm việc.
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
};

export default CreateShop;
