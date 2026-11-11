import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMyShops, createShop, updateMyShop } from "../../services/shop.service";
import DashboardLayout from "../../components/DashboardLayout";
import { VIETNAM_LOCATIONS } from "../../data/vietnamLocations";
import {
  Store,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Pencil,
  Camera,
  X,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShoppingBag,
  BarChart3,
  Check,
} from "lucide-react";

const STATUS_CONFIG = {
  approved: {
    label: "Đã duyệt (Hoạt động)",
    badge: "badge-success",
    Icon: CheckCircle2,
    desc: "Quán đang hoạt động chính thức trên FoodGo và có thể tiếp nhận đơn hàng.",
  },
  pending: {
    label: "Đang chờ duyệt",
    badge: "badge-warning",
    Icon: Clock,
    desc: "Hồ sơ quán ăn đang được Quản trị viên kiểm duyệt. Quán sẽ tự động mở bán ngay sau khi được duyệt.",
  },
  rejected: {
    label: "Bị từ chối",
    badge: "badge-danger",
    Icon: XCircle,
    desc: "Hồ sơ chưa đạt yêu cầu. Bạn có thể bấm 'Cập nhật & Gửi lại' để chỉnh sửa và yêu cầu duyệt lại.",
  },
  suspended: {
    label: "Tạm khóa",
    badge: "badge-danger",
    Icon: XCircle,
    desc: "Quán đang bị tạm khóa bởi Quản trị viên.",
  },
};

const DEFAULT_FORM = {
  name: "",
  description: "",
  city: "TP. Hồ Chí Minh",
  district: "Quận 1",
  ward: "Phường Bến Nghé",
  street: "Nguyễn Huệ",
  house_number: "",
  address: "Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
};

const CreateShop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'

  // Modal create / edit
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editingShop, setEditingShop] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Dependent dropdowns calculation
  const currentCityObj =
    VIETNAM_LOCATIONS.find((c) => c.city === form.city) || VIETNAM_LOCATIONS[0];
  const currentDistrictObj =
    currentCityObj.districts.find((d) => d.name === form.district) ||
    currentCityObj.districts[0];

  const availableDistricts = currentCityObj.districts;
  const availableWards = currentDistrictObj.wards;
  const availableStreets = currentDistrictObj.streets;

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await getMyShops();
      setShops(data.shops || []);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Check URL query param ?create=true
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      openCreateModal();
      // Clear the param from URL
      searchParams.delete("create");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const handleCityChange = (newCity) => {
    const cityObj =
      VIETNAM_LOCATIONS.find((c) => c.city === newCity) || VIETNAM_LOCATIONS[0];
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
    updated.address = [
      updated.house_number,
      updated.street,
      updated.ward,
      updated.district,
      updated.city,
    ]
      .filter(Boolean)
      .join(", ");
    setForm(updated);
  };

  const handleDistrictChange = (newDist) => {
    const distObj =
      currentCityObj.districts.find((d) => d.name === newDist) ||
      currentCityObj.districts[0];
    const defaultWard = distObj.wards[0];
    const defaultStreet = distObj.streets[0];

    const updated = {
      ...form,
      district: newDist,
      ward: defaultWard,
      street: defaultStreet,
    };
    updated.address = [
      updated.house_number,
      updated.street,
      updated.ward,
      updated.district,
      updated.city,
    ]
      .filter(Boolean)
      .join(", ");
    setForm(updated);
  };

  const handleFieldChange = (field, val) => {
    const updated = { ...form, [field]: val };
    updated.address = [
      updated.house_number,
      updated.street,
      updated.ward,
      updated.district,
      updated.city,
    ]
      .filter(Boolean)
      .join(", ");
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

  const openCreateModal = () => {
    setEditingShop(null);
    setForm(DEFAULT_FORM);
    setLogoFile(null);
    setLogoPreview(null);
    setCoverFile(null);
    setCoverPreview(null);
    setError("");
    setModalMode("create");
  };

  const openEditModal = (shop) => {
    setEditingShop(shop);
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
    setLogoFile(null);
    setLogoPreview(shop.logo_url || null);
    setCoverFile(null);
    setCoverPreview(shop.cover_url || null);
    setError("");
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingShop(null);
    setError("");
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
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (modalMode === "create") {
        const res = await createShop(buildFormData());
        await fetchShops();
        closeModal();
        setActiveTab("pending");
        setSuccessMsg(
          `🎉 Đăng ký quán "${res.shop?.name || form.name}" thành công! Quán đang ở trạng thái "Chờ duyệt" và đang chờ Ban quản trị FoodGo xét duyệt.`
        );
      } else if (modalMode === "edit" && editingShop) {
        const res = await updateMyShop(buildFormData(), editingShop._id);
        await fetchShops();
        closeModal();
        setSuccessMsg(`✓ Đã cập nhật thông tin quán "${res.shop?.name || form.name}" thành công.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Thao tác thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setSubmitting(false);
    }
  };

  // Counts for tabs
  const pendingCount = shops.filter((s) => s.status === "pending").length;
  const approvedCount = shops.filter((s) => s.status === "approved").length;
  const rejectedCount = shops.filter((s) => s.status === "rejected").length;

  const filteredShops =
    activeTab === "all" ? shops : shops.filter((s) => s.status === activeTab);

  return (
    <DashboardLayout
      title="Quản lý Shop của tôi"
      subtitle="Quản lý danh sách các quán ăn của bạn, theo dõi tiến trình phê duyệt và đăng ký quán mới"
      actions={
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Plus size={16} /> Đăng ký Quán mới
        </button>
      }
    >
      {/* Alert Notification */}
      {successMsg && (
        <div
          className="alert alert-success"
          style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Status Tab Bar ── */}
      <div className="tab-bar" style={{ marginBottom: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("all")}
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
        >
          Tất cả ({shops.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
        >
          Chờ duyệt ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
        >
          Đã duyệt ({approvedCount})
        </button>
        {rejectedCount > 0 && (
          <button
            onClick={() => setActiveTab("rejected")}
            className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
          >
            Bị từ chối ({rejectedCount})
          </button>
        )}
      </div>

      {loading && (
        <div className="spinner-wrap">
          <div className="spinner" />
          <span>Đang tải danh sách quán ăn...</span>
        </div>
      )}

      {/* ── Empty State: No shops created at all ── */}
      {!loading && shops.length === 0 && (
        <div className="card card-body" style={{ textAlign: "center", padding: "60px 24px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--color-cream-mid)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <Store size={36} color="var(--color-primary)" />
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 800 }}>Bạn chưa có quán ăn nào</h3>
          <p className="text-muted" style={{ maxWidth: 440, margin: "0 auto 24px", fontSize: 14 }}>
            Đăng ký quán ăn ngay để bắt đầu bán các món ăn ngon trên nền tảng FoodGo và tiếp cận hàng ngàn khách hàng tiềm năng.
          </p>
          <button
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} /> Đăng ký Quán ăn đầu tiên
          </button>
        </div>
      )}

      {/* ── Empty State: No shops in this tab ── */}
      {!loading && shops.length > 0 && filteredShops.length === 0 && (
        <div className="card card-body" style={{ textAlign: "center", padding: "48px 20px" }}>
          <Store size={40} style={{ opacity: 0.25, margin: "0 auto 12px" }} />
          <h4 style={{ fontSize: 16, marginBottom: 6 }}>Không có quán nào trong mục này</h4>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
            {activeTab === "pending" && "Hiện không có quán ăn nào đang chờ phê duyệt."}
            {activeTab === "approved" && "Chưa có quán ăn nào được duyệt."}
            {activeTab === "rejected" && "Không có quán ăn nào bị từ chối."}
          </p>
          <button onClick={() => setActiveTab("all")} className="btn btn-outline btn-sm">
            Xem tất cả quán
          </button>
        </div>
      )}

      {/* ── Shop Cards Grid ── */}
      {!loading && filteredShops.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filteredShops.map((s) => {
            const cfg = STATUS_CONFIG[s.status] || {
              label: s.status,
              badge: "badge-warning",
              Icon: Store,
              desc: "",
            };
            const StatusIcon = cfg.Icon;

            return (
              <div
                key={s._id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Cover Banner */}
                <div
                  style={{
                    width: "100%",
                    height: 120,
                    background: s.cover_url
                      ? `url(${s.cover_url}) center/cover no-repeat`
                      : "linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(4px)",
                      borderRadius: 20,
                      padding: "4px 10px",
                    }}
                  >
                    <span
                      className={`badge ${cfg.badge}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}
                    >
                      <StatusIcon size={12} /> {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Shop Info Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12, marginTop: -30 }}>
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: "var(--radius-md)",
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: "2px solid #fff",
                      }}
                    >
                      {s.logo_url ? (
                        <img
                          src={s.logo_url}
                          alt={s.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Store size={26} color="var(--color-primary)" />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingTop: 26 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", color: "var(--color-ink)" }}>
                        {s.name}
                      </h3>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--color-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <MapPin size={13} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.address || s.city || "Chưa cập nhật địa chỉ"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {s.description && (
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "var(--color-muted)",
                        marginBottom: 14,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {s.description}
                    </p>
                  )}

                  {/* Status Note Box */}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      lineHeight: 1.5,
                      marginBottom: 16,
                      background:
                        s.status === "approved"
                          ? "#ECFDF5"
                          : s.status === "pending"
                          ? "#FFFBEB"
                          : "#FEF2F2",
                      border: `1px solid ${
                        s.status === "approved"
                          ? "#A7F3D0"
                          : s.status === "pending"
                          ? "#FDE68A"
                          : "#FECACA"
                      }`,
                      color:
                        s.status === "approved"
                          ? "#065F46"
                          : s.status === "pending"
                          ? "#92400E"
                          : "#991B1B",
                    }}
                  >
                    <strong>
                      {s.status === "approved"
                        ? "✓ Đang mở bán:"
                        : s.status === "pending"
                        ? "🕒 Đang chờ duyệt:"
                        : "✕ Chưa duyệt:"}{" "}
                    </strong>
                    {cfg.desc}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: "auto", display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
                    <button
                      onClick={() => openEditModal(s)}
                      className="btn btn-outline btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, flex: 1, justifyContent: "center" }}
                    >
                      <Pencil size={13} /> {s.status === "rejected" ? "Cập nhật & Gửi lại" : "Sửa thông tin"}
                    </button>

                    {s.status === "approved" && (
                      <>
                        <button
                          onClick={() => navigate(`/seller/products`)}
                          className="btn btn-primary btn-sm"
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, flex: 1, justifyContent: "center" }}
                        >
                          <ShoppingBag size={13} /> Món ăn
                        </button>
                        <button
                          onClick={() => navigate(`/seller/dashboard`)}
                          className="btn btn-outline btn-sm"
                          title="Xem thống kê doanh thu"
                          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                        >
                          <BarChart3 size={13} /> Thống kê
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Create / Edit Shop Form ── */}
      {modalMode && (
        <div className="logout-modal-overlay" onClick={closeModal}>
          <div
            className="logout-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 620,
              textAlign: "left",
              padding: "28px 24px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>
                  {modalMode === "create" ? "Đăng ký Quán ăn mới" : "Chỉnh sửa thông tin Quán ăn"}
                </h3>
                <p className="text-muted" style={{ fontSize: 13, margin: "4px 0 0" }}>
                  {modalMode === "create"
                    ? "Sau khi gửi thông tin, quán ăn sẽ được chuyển vào tab 'Chờ duyệt' để Admin xét duyệt."
                    : "Cập nhật hình ảnh, tên và địa chỉ của quán."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Ảnh đại diện & Ảnh bìa */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
                {/* Logo */}
                <div className="field">
                  <label style={{ fontSize: 13 }}>Ảnh đại diện (Logo)</label>
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    style={{
                      width: "100%",
                      height: 84,
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-cream-mid)",
                      overflow: "hidden",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px dashed var(--color-border)",
                    }}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Preview logo"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--color-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                        <Camera size={16} /> Chọn logo
                      </span>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ display: "none" }}
                  />
                </div>

                {/* Cover */}
                <div className="field">
                  <label style={{ fontSize: 13 }}>Ảnh bìa Quán (Banner)</label>
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    style={{
                      width: "100%",
                      height: 84,
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-cream-mid)",
                      overflow: "hidden",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px dashed var(--color-border)",
                    }}
                  >
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Preview cover"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--color-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                        <Camera size={16} /> Chọn ảnh bìa
                      </span>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              {/* Tên Quán */}
              <div className="field">
                <label>Tên Quán ăn *</label>
                <input
                  className="input"
                  placeholder="VD: Cơm Tấm Sài Gòn Xưa"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Mô tả */}
              <div className="field">
                <label>Mô tả ngắn</label>
                <textarea
                  className="input"
                  placeholder="Giới thiệu về đặc sản, hương vị nổi bật của quán..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  style={{ resize: "vertical" }}
                />
              </div>

              <hr className="divider-dashed" style={{ margin: "4px 0" }} />
              <div style={{ fontWeight: 700, fontSize: 14 }}>Địa chỉ kinh doanh quán ăn</div>

              {/* Tỉnh / Huyện */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field">
                  <label>Tỉnh / Thành phố *</label>
                  <select
                    className="input"
                    value={form.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                  >
                    {VIETNAM_LOCATIONS.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Quận / Huyện *</label>
                  <select
                    className="input"
                    value={form.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                  >
                    {availableDistricts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phường / Đường */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field">
                  <label>Phường / Xã *</label>
                  <select
                    className="input"
                    value={form.ward}
                    onChange={(e) => handleFieldChange("ward", e.target.value)}
                  >
                    {availableWards.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Tên đường *</label>
                  <select
                    className="input"
                    value={form.street}
                    onChange={(e) => handleFieldChange("street", e.target.value)}
                  >
                    {availableStreets.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Số nhà */}
              <div className="field">
                <label>Số nhà / Chi tiết địa chỉ *</label>
                <input
                  className="input"
                  placeholder="VD: Số 123 hoặc Tòa nhà Vincom"
                  value={form.house_number}
                  onChange={(e) => handleFieldChange("house_number", e.target.value)}
                  required
                />
              </div>

              {/* Address Preview Box */}
              <div className="field">
                <label style={{ fontSize: 12, color: "var(--color-muted)" }}>
                  Địa chỉ hoàn chỉnh hiển thị trên FoodGo:
                </label>
                <div
                  style={{
                    padding: "8px 12px",
                    background: "var(--color-cream-pale)",
                    borderRadius: 6,
                    fontSize: 13,
                    border: "1px solid var(--color-border)",
                    color: "var(--color-ink)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <MapPin size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <span>{form.address || "Chưa nhập địa chỉ"}</span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ minWidth: 140, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="spin" /> Đang lưu...
                    </>
                  ) : modalMode === "create" ? (
                    "Gửi hồ sơ đăng ký"
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CreateShop;
