import { useState, useEffect } from "react";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../../services/admin.service";
import DashboardLayout from "../../components/DashboardLayout";
import { Plus, Pencil, Trash2, Tag, Check, X } from "lucide-react";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try { setCategories((await listCategories()).categories); }
    catch { setError("Không tải được danh mục"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError("");
    try { await createCategory({ name: newName }); setNewName(""); fetchCategories(); }
    catch (err) { setError(err.response?.data?.message || "Tạo thất bại"); }
  };

  const handleUpdate = async (id) => {
    setError("");
    try { await updateCategory(id, { name: editingName }); setEditingId(null); fetchCategories(); }
    catch (err) { setError(err.response?.data?.message || "Cập nhật thất bại"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá danh mục này?")) return;
    try { await deleteCategory(id); fetchCategories(); }
    catch (err) { setError(err.response?.data?.message || "Không thể xoá danh mục đang được sử dụng"); }
  };

  return (
    <DashboardLayout title="Quản lý danh mục" subtitle={`${categories.length} danh mục`}>
      <div style={{ maxWidth: 540 }}>
        {/* Add form */}
        <div className="card card-body" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={16} color="var(--color-primary)" /> Thêm danh mục mới
          </h3>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: 10 }}>
            <input className="input" placeholder="Tên danh mục (VD: Cơm, Phở, Đồ uống...)"
              value={newName} onChange={(e) => setNewName(e.target.value)} required style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Plus size={16} /> Thêm
            </button>
          </form>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {loading && <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>}

        {!loading && categories.length > 0 && (
          <div className="card" style={{ overflow: "hidden" }}>
            {categories.map((cat, idx) => (
              <div key={cat._id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, padding: "13px 16px",
                borderBottom: idx < categories.length - 1 ? "1px solid var(--color-border-light)" : "none",
              }}>
                {editingId === cat._id ? (
                  <>
                    <input className="input" value={editingName}
                      onChange={(e) => setEditingName(e.target.value)} style={{ flex: 1 }} autoFocus />
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleUpdate(cat._id)} className="btn btn-primary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Check size={13} /> Lưu
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <X size={13} /> Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 14.5, fontWeight: 600 }}>{cat.name}</span>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => { setEditingId(cat._id); setEditingName(cat.name); }}
                        className="btn btn-outline btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Pencil size={13} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(cat._id)} className="btn btn-danger btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Trash2 size={13} /> Xoá
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CategoryManagement;