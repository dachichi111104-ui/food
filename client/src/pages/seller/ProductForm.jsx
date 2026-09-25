import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { createProduct, updateProduct, getProductDetail } from "../../services/product.service";
import DashboardLayout from "../../components/DashboardLayout";
import { Camera, ArrowLeft, AlertCircle, Plus, Trash2 } from "lucide-react";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const imageInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", category_id: "" });
  const [variants, setVariants] = useState([{ name: "", price: "", stock: "" }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
    if (isEdit) {
      getProductDetail(id).then((data) => {
        setForm({
          name: data.product.name,
          description: data.product.description || "",
          category_id: data.product.category_id,
        });
        setCurrentImageUrl(data.product.image_url || null);
        setLoading(false);
      });
    }
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVariantChange = (idx, field, value) => {
    const updated = [...variants];
    updated[idx][field] = value;
    setVariants(updated);
  };
  const addVariantRow = () => setVariants([...variants, { name: "", price: "", stock: "" }]);
  const removeVariantRow = (idx) => setVariants(variants.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description || "");
      fd.append("category_id", form.category_id);
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) {
        await updateProduct(id, fd);
      } else {
        fd.append(
          "variants",
          JSON.stringify(
            variants.map((v) => ({ name: v.name, price: Number(v.price), stock: Number(v.stock) }))
          )
        );
        await createProduct(fd);
      }
      navigate("/seller/products");
    } catch (err) {
      setError(err.response?.data?.message || "Lưu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <DashboardLayout title={isEdit ? "Sửa món ăn" : "Thêm món mới"}>
      <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      title={isEdit ? "Sửa thông tin món ăn" : "Thêm món ăn mới"}
      subtitle="Điền đầy đủ thông tin để hiển thị trên thực đơn"
    >
      <div style={{ maxWidth: 560 }}>
        {/* Back button */}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => navigate("/seller/products")}
          style={{ marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
        </button>

        <div className="card card-body">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="field">
              <label>Hình ảnh món ăn</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  style={{
                    width: 88, height: 88, borderRadius: "var(--radius-md)",
                    background: "var(--color-cream-mid)", overflow: "hidden", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    border: "1px dashed var(--color-border)",
                  }}
                >
                  {imagePreview || currentImageUrl
                    ? <img src={imagePreview || currentImageUrl} alt="Xem trước món ăn"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Camera size={24} color="var(--color-muted)" />
                  }
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => imageInputRef.current?.click()}>
                  {currentImageUrl || imagePreview ? "Đổi ảnh" : "Chọn ảnh"}
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </div>
            </div>

            <div className="field">
              <label>Tên món *</label>
              <input
                className="input"
                placeholder="VD: Cơm sườn bì chả"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Mô tả</label>
              <textarea
                className="input"
                placeholder="Mô tả ngắn về món ăn, nguyên liệu, đặc điểm..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ minHeight: 80, resize: "vertical" }}
              />
            </div>

            <div className="field">
              <label>Danh mục *</label>
              <select
                className="input"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {!isEdit && (
              <div className="field">
                <label>Các loại (size / phiên bản)</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {variants.map((v, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, alignItems: "center" }}>
                      <input
                        className="input"
                        placeholder="Tên loại (VD: Thường)"
                        value={v.name}
                        onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                        required
                      />
                      <input
                        className="input"
                        type="number"
                        placeholder="Giá (đ)"
                        value={v.price}
                        onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                        required
                        min="0"
                      />
                      <input
                        className="input"
                        type="number"
                        placeholder="Tồn kho"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                        required
                        min="0"
                      />
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", padding: "4px 8px", display: "flex", alignItems: "center" }}
                          title="Xoá loại này"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addVariantRow} className="btn btn-outline btn-sm" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Plus size={14} /> Thêm loại
                  </button>
                </div>
              </div>
            )}

            {error && <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={16} /> {error}</div>}

            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? (
                  <><div className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", width: 18, height: 18 }} />Đang lưu...</>
                ) : (
                  isEdit ? "Lưu thay đổi" : "Tạo món ăn"
                )}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/seller/products")}
              >
                Huỷ
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductForm;