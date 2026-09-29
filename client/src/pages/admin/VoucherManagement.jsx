import { useState, useEffect } from "react";
import { listAllVouchers, createVoucher, deleteVoucher } from "../../services/voucher.service";
import { listPublicShops } from "../../services/shop.service";
import { Ticket, Plus, Trash2, Tag, Calendar, AlertCircle, CheckCircle2, Loader2, X, Store, Percent, DollarSign } from "lucide-react";

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* Modal state */
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Form state */
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENT"); // 'PERCENT' | 'FIXED'
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 16));
  const [validTo, setValidTo] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [usageLimit, setUsageLimit] = useState("");
  const [shopId, setShopId] = useState(""); // "" = Toàn sàn

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [vRes, sRes] = await Promise.all([
        listAllVouchers(),
        listPublicShops({ limit: 100 }),
      ]);
      setVouchers(vRes || []);
      setShops(sRes.shops || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách Voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setCode("");
    setDiscountType("PERCENT");
    setDiscountValue(10);
    setMinOrderAmount(0);
    setMaxDiscountAmount("");
    setValidFrom(new Date().toISOString().slice(0, 16));
    setValidTo(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setUsageLimit("");
    setShopId("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      alert("Vui lòng nhập mã Voucher");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrderAmount) || 0,
        max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        valid_from: new Date(validFrom).toISOString(),
        valid_to: new Date(validTo).toISOString(),
        usage_limit: usageLimit ? Number(usageLimit) : null,
        shop_id: shopId ? shopId : null,
      };

      await createVoucher(payload);
      setSuccessMsg("Tạo mã Voucher thành công!");
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Mã voucher đã tồn tại hoặc dữ liệu không hợp lệ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, voucherCode) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mã Voucher [${voucherCode}]?`)) return;
    try {
      await deleteVoucher(id);
      setSuccessMsg(`Đã xóa voucher ${voucherCode}`);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Voucher không tồn tại hoặc lỗi khi xóa");
    }
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "80vh", padding: "36px 0 60px" }}>
      <div className="container" style={{ maxWidth: 1060 }}>
        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: "var(--color-ink)", marginBottom: 6 }}>
              Quản lý Mã giảm giá Voucher 🎟️
            </h1>
            <p className="text-muted" style={{ fontSize: 14 }}>
              Tạo và quản lý danh sách các mã khuyến mãi áp dụng toàn sàn hoặc theo cửa hàng.
            </p>
          </div>

          <button onClick={openAddModal} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} /> Tạo Voucher Mới
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
            <p style={{ color: "var(--color-muted)" }}>Đang tải danh sách Voucher...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="card card-body" style={{ textAlign: "center", padding: "48px 20px" }}>
            <Ticket size={48} color="var(--color-muted)" style={{ margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Chưa có Voucher nào</h3>
            <p className="text-muted" style={{ fontSize: 13.5, marginBottom: 20 }}>Bấm "Tạo Voucher Mới" để tạo mã giảm giá cho khách hàng.</p>
            <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6, margin: "0 auto" }}>
              <Plus size={16} /> Tạo Voucher
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {vouchers.map((v) => {
              const targetShop = shops.find((s) => s._id === v.shop_id);
              const isExpired = new Date(v.valid_to) < new Date();

              return (
                <div key={v._id} className="card card-body" style={{ position: "relative", borderLeft: "4px solid var(--color-primary)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--color-primary)", letterSpacing: 1 }}>
                          {v.code}
                        </span>
                        <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
                          {targetShop ? `🏪 Quán: ${targetShop.name}` : "🌐 Toàn sàn FoodGo"}
                        </div>
                      </div>

                      <span className={`badge ${isExpired ? "badge-danger" : "badge-success"}`} style={{ fontSize: 11 }}>
                        {isExpired ? "Hết hạn" : "Khả dụng"}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ background: "var(--color-bg)", padding: 12, borderRadius: 8, fontSize: 12.5, display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="text-muted">Mức giảm:</span>
                        <span style={{ fontWeight: 700, color: "var(--color-ink)" }}>
                          {v.discount_type === "PERCENT" ? `${v.discount_value}%` : `${v.discount_value.toLocaleString()}đ`}
                          {v.max_discount_amount ? ` (Tối đa ${v.max_discount_amount.toLocaleString()}đ)` : ""}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="text-muted">Đơn tối thiểu:</span>
                        <span style={{ fontWeight: 600 }}>{v.min_order_amount.toLocaleString()}đ</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="text-muted">Lượt đã dùng:</span>
                        <span style={{ fontWeight: 600 }}>{v.used_count} / {v.usage_limit ? v.usage_limit : "∞"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--color-muted)" }}>
                        <span>Hạn dùng:</span>
                        <span>{new Date(v.valid_to).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleDelete(v._id, v.code)}
                      className="btn btn-outline btn-sm"
                      style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 }}
                    >
                      <Trash2 size={13} /> Xóa Voucher
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Tạo Voucher Mới (AF1) */}
        {showModal && (
          <div className="logout-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Ticket size={20} color="var(--color-primary)" /> Tạo Mã Giảm Giá Voucher (AF1)
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="field">
                  <label>Mã Voucher * (In hoa, viết liền)</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="VD: FOODGO50K"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="field">
                    <label>Loại giảm giá *</label>
                    <select className="input" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                      <option value="PERCENT">Theo % (PERCENT)</option>
                      <option value="FIXED">Số tiền cố định (FIXED)</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Giá trị giảm * ({discountType === "PERCENT" ? "%" : "VNĐ"})</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="field">
                    <label>Đơn tối thiểu (VNĐ)</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Mức giảm tối đa (VNĐ)</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="Không giới hạn"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="field">
                    <label>Bắt đầu từ *</label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Hạn sử dụng *</label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={validTo}
                      onChange={(e) => setValidTo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="field">
                    <label>Tổng số lượt dùng tối đa</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="Không giới hạn"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Phạm vi áp dụng</label>
                    <select className="input" value={shopId} onChange={(e) => setShopId(e.target.value)}>
                      <option value="">🌐 Áp dụng toàn sàn FoodGo</option>
                      {shops.map((s) => (
                        <option key={s._id} value={s._id}>
                          🏪 Quán: {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Đang tạo..." : "Lưu Voucher"}
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

export default VoucherManagement;
