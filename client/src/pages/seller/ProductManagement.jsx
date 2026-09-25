import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyShopProducts, deleteProduct } from "../../services/product.service";
import { listPublicCategories } from "../../services/shop.service";
import DashboardLayout from "../../components/DashboardLayout";
import { Plus, Pencil, EyeOff, Package, CheckCircle2, ImageOff, Star, ShoppingBag } from "lucide-react";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try { setProducts((await getMyShopProducts()).products); }
    catch (err) { setError(err.response?.data?.message || "Không tải được sản phẩm. Bạn đã tạo shop chưa?"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
    listPublicCategories()
      .then((data) => {
        const map = {};
        (data.categories || []).forEach((c) => { map[c._id] = c.name; });
        setCategoryMap(map);
      })
      .catch(() => {});
  }, []);

  const confirmHideProduct = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget);
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      setError("Ẩn món ăn thất bại");
    }
  };

  const getPriceRange = (variants) => {
    if (!variants?.length) return "—";
    const prices = variants.map((v) => v.price).filter((p) => typeof p === "number");
    if (!prices.length) return "—";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `${min.toLocaleString()}đ` : `${min.toLocaleString()}đ – ${max.toLocaleString()}đ`;
  };

  const getTotalStock = (variants) => {
    if (!variants?.length) return 0;
    return variants.reduce((sum, v) => sum + Math.max((v.available ?? (v.stock - (v.reserved_quantity || 0))), 0), 0);
  };

  return (
    <DashboardLayout
      title="Quản lý sản phẩm"
      subtitle={!loading ? `${products.length} sản phẩm` : ""}
      actions={
        <Link to="/seller/products/new" className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <Plus size={16} /> Thêm món mới
        </Link>
      }
    >
      {/* Modal xác nhận ẩn món */}
      {deleteTarget && (
        <div className="logout-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <EyeOff size={24} color="var(--color-danger)" />
            </div>
            <div className="logout-modal-title">Ẩn sản phẩm này?</div>
            <p className="logout-modal-desc">
              Sản phẩm sẽ không xuất hiện trên thực đơn người mua nhưng dữ liệu đơn hàng cũ vẫn được giữ nguyên.
            </p>
            <div className="logout-modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={confirmHideProduct}>Xác nhận ẩn</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && products.length === 0 && (
        <div className="empty-state card card-body" style={{ padding: 56 }}>
          <div style={{ marginBottom: 16 }}><Package size={48} style={{ opacity: 0.2, margin: "0 auto", color: "var(--color-muted)" }} /></div>
          <div className="empty-state-title">Chưa có sản phẩm nào</div>
          <p className="empty-state-desc" style={{ marginBottom: 24 }}>Thêm món ăn đầu tiên để bắt đầu nhận đơn hàng.</p>
          <Link to="/seller/products/new" className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <Plus size={15} /> Thêm món mới
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên món</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Đã bán</th>
                  <th>Đánh giá</th>
                  <th>Tồn kho</th>
                  <th>Biến thể</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const totalStock = getTotalStock(p.variants);
                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{
                          width: 52, height: 52, borderRadius: "var(--radius-sm)",
                          overflow: "hidden", background: "var(--color-cream-mid)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          border: "1px solid var(--color-border-light)",
                        }}>
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <ImageOff size={18} color="var(--color-muted)" />
                          }
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 14.5, display: "block" }}>{p.name}</span>
                          {p.description && (
                            <span className="text-muted" style={{ fontSize: 12, display: "block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ fontSize: 11 }}>
                          {categoryMap[p.category_id] || "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                          {getPriceRange(p.variants)}
                        </span>
                      </td>
                      <td>
                        <span className="sold-badge">
                          <ShoppingBag size={11} /> {p.order_count || 0} đã bán
                        </span>
                      </td>
                      <td>
                        {p.average_rating ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-gold)", display: "flex", alignItems: "center", gap: 3 }}>
                            <Star size={11} fill="currentColor" /> {p.average_rating}
                          </span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${totalStock === 0 ? "badge-danger" : totalStock < 10 ? "badge-warning" : "badge-success"}`}
                          style={{ fontSize: 11 }}
                          title="Tổng tồn kho khả dụng"
                        >
                          {totalStock}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 160 }}>
                          {p.variants?.map((v) => (
                            <span key={v._id} className="badge" style={{ fontSize: 10, background: "var(--color-cream-mid)" }}>
                              {v.name}: {v.price?.toLocaleString()}đ
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {p.is_active
                          ? <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={11} /> Đang bán</span>
                          : <span className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><EyeOff size={11} /> Đã ẩn</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <Link to={`/seller/products/${p._id}/edit`} className="btn btn-outline btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", fontSize: 12 }}>
                            <Pencil size={12} /> Sửa
                          </Link>
                          {p.is_active && (
                            <button onClick={() => setDeleteTarget(p._id)} className="btn btn-danger btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", fontSize: 12 }}>
                              <EyeOff size={12} /> Ẩn
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
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProductManagement;
