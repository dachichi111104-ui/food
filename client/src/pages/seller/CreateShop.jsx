import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMyShop, createShop, updateMyShop } from "../../services/shop.service";
import DashboardLayout from "../../components/DashboardLayout";
import { VIETNAM_LOCATIONS } from "../../data/vietnamLocations";
import { Store, MapPin, CheckCircle2, Clock, XCircle, ChevronRight, Loader2, Pencil, Camera, X } from "lucide-react";

const STATUS_CONFIG = {
  approved:  { label: "Đã duyệt",       badge: "badge-success", Icon: CheckCircle2 },
  pending:   { label: "Đang chờ duyệt", badge: "badge-warning",  Icon: Clock },
  rejected:  { label: "Bị từ chối",     badge: "badge-danger",   Icon: XCircle },
  suspended: { label: "Tạm khóa",       badge: "badge-danger",   Icon: XCircle },
  hidden:    { label: "Đã ẩn",          badge: "badge-warning",  Icon: Clock },
};

const CreateShop = () => {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    street: "Nguyễn Huệ",
    house_number: "",
    address: "",
  });

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

  // Calculate location options
  const currentCityObj = VIETNAM_LOCATIONS.find((c) => c.city === form.city) || VIETNAM_LOCATIONS[0];
  const currentDistrictObj = currentCityObj.districts.find((d) => d.name === form.district) || currentCityObj.districts[0];

  const availableDistricts = currentCityObj.districts;
  const availableWards = currentDistrictObj.wards;
  const availableStreets = currentDistrictObj.streets;

  useEffect(() => {
    getMyShop()
      .then((data) => setShop(data.shop))
      .catch(() => setShop(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCityChange = (newCity) => {
    const cityObj = VIETNAM_LOCATIONS.find((c) => c.city === newCity) || VIETNAM_LOCATIONS[0];
    const defaultDist = cityObj.districts[0];
    const defaultWard = defaultDist.wards[0];
    const defaultStreet = defaultDist.streets[0];

    const updated = {
      ...form,
      city: newCity,
      district: defaultDist.name,
      ward: defaultWard,
      street: defaultStreet,
    };
    updated.address = [updated.house_number, updated.street, updated.ward, updated.district, updated.city].filter(Boolean).join(", ");
    setForm(updated);
  };

  const handleDistrictChange = (newDist) => {
    const distObj = currentCityObj.districts.find((d) => d.name === newDist) || currentCityObj.districts[0];
    const defaultWard = distObj.wards[0];
    const defaultStreet = distObj.streets[0];

    const updated = {
      ...form,
      district: newDist,
      ward: defaultWard,
      street: defaultStreet,
    };
    updated.address = [updated.house_number, updated.street, updated.ward, updated.district, updated.city].filter(Boolean).join(", ");
    setForm(updated);
  };

  const handleFieldChange = (field, val) => {
    const updated = { ...form, [field]: val };
    updated.address = [updated.house_number, updated.street, updated.ward, updated.district, updated.city].filter(Boolean).join(", ");
    setForm(updated);
  };

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
    fd.append("city", form.city);
    fd.append("district", form.district);
    fd.append("ward", form.ward);
    fd.append("street", form.street);
    fd.append("house_number", form.house_number || "");
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
      city: shop.city || "TP. Hồ Chí Minh",
      district: shop.district || "Quận 1",
      ward: shop.ward || "Phường Bến Nghé",
      street: shop.street || "Nguyễn Huệ",
      house_number: shop.house_number || "",
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
        <div style={{ maxWidth: 640 }}>
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
                    <MapPin size={13} color="var(--color-primary)" /> {shop.address}
                  </p>
                )}
                {shop.description && (
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-muted)" }}>{shop.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isEditMode = Boolean(shop) && editing;

  return (
    <DashboardLayout
      title={isEditMode ? "Sửa thông tin shop" : "Tạo shop của bạn"}
      subtitle={isEditMode ? "Cập nhật ảnh đại diện, ảnh bìa và địa chỉ quán" : "Điền thông tin để đăng ký quán ăn trên FoodGo"}
    >
      <div style={{ maxWidth: 580 }}>
        <div className="card card-body">
          <form onSubmit={isEditMode ? handleUpdateSubmit : handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Logo */}
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

            {/* Cover */}
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
              <input className="input" placeholder="VD: Cơm tấm Ba Đình"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="field"><label>Mô tả shop</label>
              <textarea className="input" placeholder="Giới thiệu về quán ăn của bạn..."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ minHeight: 80, resize: "vertical" }} />
            </div>

            <hr className="divider-dashed" />
            <h4 style={{ fontSize: 15, margin: 0 }}>Địa chỉ quán ăn</h4>

            {/* Dependent Dropdowns: City -> District -> Ward -> Street */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="field">
                <label>Tỉnh / Thành phố *</label>
                <select className="input" value={form.city} onChange={(e) => handleCityChange(e.target.value)}>
                  {VIETNAM_LOCATIONS.map((c) => (
                    <option key={c.city} value={c.city}>{c.city}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Quận / Huyện *</label>
                <select className="input" value={form.district} onChange={(e) => handleDistrictChange(e.target.value)}>
                  {availableDistricts.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="field">
                <label>Phường / Xã *</label>
                <select className="input" value={form.ward} onChange={(e) => handleFieldChange("ward", e.target.value)}>
                  {availableWards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Tên đường *</label>
                <select className="input" value={form.street} onChange={(e) => handleFieldChange("street", e.target.value)}>
                  {availableStreets.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Số nhà / Chi tiết *</label>
              <input className="input" placeholder="VD: Số 45"
                value={form.house_number} onChange={(e) => handleFieldChange("house_number", e.target.value)} required />
            </div>

            <div className="field">
              <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Địa chỉ hiển thị trên FoodGo:</label>
              <div style={{ padding: "10px 14px", background: "var(--color-cream-pale)", borderRadius: 6, fontSize: 13, border: "1px solid var(--color-border)", color: "var(--color-ink)" }}>
                <MapPin size={14} color="var(--color-primary)" style={{ display: "inline", marginRight: 6 }} />
                {form.address || "Chưa nhập địa chỉ"}
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flex: 1 }}>
                {submitting
                  ? <><Loader2 size={16} className="spin" />Đang lưu...</>
                  : (isEditMode ? "Lưu thay đổi" : "Đăng ký shop")}
              </button>
              {isEditMode && (
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                  Huỷ
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateShop;
