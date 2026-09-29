import { useState, useEffect } from "react";
import { listAllBanners, createBanner, updateBanner, deleteBanner } from "../../services/banner.service";
import { Plus, Trash2, Edit2, Image, ExternalLink, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* Modal state */
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* Form state */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("/");
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const fetchBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAllBanners();
      setBanners(data.banners || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle("");
    setDescription("");
    setTargetUrl("/");
    setPriority(0);
    setIsActive(true);
    setImageFile(null);
    setImageUrlInput("");
    setImagePreview("");
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || "");
    setDescription(banner.description || "");
    setTargetUrl(banner.target_url || "/");
    setPriority(banner.priority || 0);
    setIsActive(banner.is_active !== undefined ? banner.is_active : true);
    setImageFile(null);
    setImageUrlInput(banner.image_url || "");
    setImagePreview(banner.image_url || "");
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề banner");
      return;
    }
    if (!editingBanner && !imageFile && !imageUrlInput.trim()) {
      alert("Vui lòng chọn hình ảnh banner");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("target_url", targetUrl);
      formData.append("priority", priority);
      formData.append("is_active", isActive);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrlInput) {
        formData.append("image_url", imageUrlInput);
      }

      if (editingBanner) {
        await updateBanner(editingBanner._id, formData);
        setSuccessMsg("Cập nhật banner thành công!");
      } else {
        await createBanner(formData);
        setSuccessMsg("Thêm mới banner thành công!");
      }

      setShowModal(false);
      fetchBanners();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu thông tin banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await updateBanner(banner._id, { is_active: !banner.is_active });
      fetchBanners();
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa banner này?")) return;
    try {
      await deleteBanner(id);
      setSuccessMsg("Đã xóa banner!");
      fetchBanners();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Xóa banner thất bại");
    }
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "80vh", padding: "36px 0 60px" }}>
      <div className="container" style={{ maxWidth: 1060 }}>
        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: "var(--color-ink)", marginBottom: 6 }}>
              Quản lý Banner Quảng cáo 🖼️
            </h1>
            <p className="text-muted" style={{ fontSize: 14 }}>
              Thêm, sửa, hiển thị và thứ tự ưu tiên các banner khuyến mãi trên trang chủ FoodGo.
            </p>
          </div>

          <button onClick={openAddModal} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} /> Thêm Banner Mới
          </button>
        </div>

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Loader2 size={32} className="spin" style={{ color: "var(--color-primary)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--color-muted)" }}>Đang tải danh sách banner...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="card card-body" style={{ textAlign: "center", padding: "48px 20px" }}>
            <Image size={48} color="var(--color-muted)" style={{ margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Chưa có banner nào</h3>
            <p className="text-muted" style={{ fontSize: 13.5, marginBottom: 20 }}>Bấm nút "Thêm Banner Mới" để đăng banner khuyến mãi đầu tiên.</p>
            <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6, margin: "0 auto" }}>
              <Plus size={16} /> Thêm Banner
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {banners.map((banner) => (
              <div key={banner._id} className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Image Container */}
                <div style={{ position: "relative", width: "100%", height: 160, background: "#f0f0f0" }}>
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: banner.is_active ? 1 : 0.45 }}
                  />
                  {!banner.is_active && (
                    <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                      Đã ẩn
                    </span>
                  )}
                  <span style={{ position: "absolute", top: 10, right: 10, background: "var(--color-primary)", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                    Độ ưu tiên: {banner.priority}
                  </span>
                </div>

                {/* Banner Info */}
                <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--color-ink)" }}>
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p className="text-muted" style={{ fontSize: 13, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {banner.description}
                      </p>
                    )}
                    {banner.target_url && (
                      <a href={banner.target_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--color-primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                        <ExternalLink size={12} /> Link: {banner.target_url}
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--color-border-light)" }}>
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`btn ${banner.is_active ? "btn-outline" : "btn-primary"} btn-sm`}
                      style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 }}
                    >
                      {banner.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      {banner.is_active ? "Ẩn Banner" : "Hiện Banner"}
                    </button>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEditModal(banner)} className="btn btn-outline btn-sm" title="Chỉnh sửa">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(banner._id)} className="btn btn-outline btn-sm" style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }} title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Thêm/Sửa Banner */}
        {showModal && (
          <div className="logout-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  {editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner Quảng cáo Mới"}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="field">
                  <label>Tiêu đề Banner *</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="VD: Siêu khuyến mãi Giảm 50% Cuối tuần"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label>Mô tả ngắn</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="VD: Áp dụng cho đơn từ 100k..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Image input */}
                <div className="field">
                  <label>Hình ảnh Banner *</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: 13, marginBottom: 8 }} />
                  <p style={{ fontSize: 11.5, color: "var(--color-muted)", margin: "0 0 6px" }}>Hoặc dán URL hình ảnh trực tiếp:</p>
                  <input
                    className="input"
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", border: "1px solid var(--color-border)", height: 120 }}>
                      <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="field">
                    <label>Đường dẫn đích (Target URL)</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="/"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Mức ưu tiên (Số càng lớn xếp trước)</label>
                    <input
                      className="input"
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <label htmlFor="isActiveCheck" style={{ fontSize: 13.5, cursor: "pointer", margin: 0, fontWeight: 600 }}>
                    Hiển thị banner này ngay trên trang chủ
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Đang lưu..." : editingBanner ? "Cập nhật Banner" : "Thêm Banner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManagement;
