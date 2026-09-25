import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../../services/cart.service";
import { useCart } from "../../context/CartContext";
import { ShoppingCart, Trash2, ChevronRight, UtensilsCrossed, Loader2, Store, CheckSquare, Square } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  const [cart, setCart] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const isInitialLoad = useState(true);

  const fetchCart = async (isFirstTime = false) => {
    setLoading(true);
    try {
      const cartData = await getCart();
      setCart(cartData);

      if (cartData && cartData.items) {
        if (isFirstTime) {
          setSelectedItemIds(cartData.items.map((i) => i.item_id));
        } else {
          // Keep current selectedItemIds that are still in the cart
          setSelectedItemIds((prev) =>
            prev.filter((id) => cartData.items.some((item) => item.item_id === id))
          );
        }
      }
    } catch {
      setError("Không tải được giỏ hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart(true);
  }, []);

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    setUpdatingId(itemId);
    setError("");
    try {
      await updateCartItem(itemId, quantity);
      await fetchCart();
      refreshCartCount();
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setUpdatingId(itemId);
    setError("");
    try {
      await removeCartItem(itemId);
      setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
      await fetchCart();
      refreshCartCount();
    } catch {
      setError("Xoá thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleSelectShop = (shopItems) => {
    const shopItemIds = shopItems.map((i) => i.item_id);
    const allSelected = shopItemIds.every((id) => selectedItemIds.includes(id));

    if (allSelected) {
      setSelectedItemIds((prev) => prev.filter((id) => !shopItemIds.includes(id)));
    } else {
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...shopItemIds])));
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: "40px 32px" }}>
      <div className="spinner-wrap"><div className="spinner" /><span>Đang tải giỏ hàng...</span></div>
    </div>
  );

  if (error && !cart) return (
    <div className="container" style={{ padding: "60px 32px" }}>
      <div className="alert alert-error">{error}</div>
    </div>
  );

  // Group cart items by Shop
  const groupedShops = {};
  (cart?.items || []).forEach((item) => {
    const shopId = item.shop?.id || item.shop?._id || item.shop_id || "unknown";
    if (!groupedShops[shopId]) {
      groupedShops[shopId] = {
        shopName: item.shop?.name || "Quán ăn",
        items: [],
      };
    }
    groupedShops[shopId].items.push(item);
  });

  const allCartItemIds = (cart?.items || []).map((i) => i.item_id);
  const isGlobalAllSelected = allCartItemIds.length > 0 && allCartItemIds.every((id) => selectedItemIds.includes(id));

  const toggleSelectAllGlobal = () => {
    if (isGlobalAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(allCartItemIds);
    }
  };

  const selectedItems = (cart?.items || []).filter((i) => selectedItemIds.includes(i.item_id));
  const selectedSubtotal = selectedItems.reduce((sum, i) => sum + (i.line_total || 0), 0);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "60vh", padding: "40px 0 64px" }}>
      <div className="container">
        <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <ShoppingCart size={26} color="var(--color-primary)" />
          Giỏ hàng của bạn
        </h1>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        {!cart || cart.items.length === 0 ? (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div className="card card-body" style={{ textAlign: "center", padding: 56 }}>
              <UtensilsCrossed size={52} style={{ margin: "0 auto 20px", opacity: 0.25, color: "var(--color-muted)" }} />
              <h2 style={{ fontSize: 20, marginBottom: 10 }}>Giỏ hàng đang trống</h2>
              <p className="text-muted" style={{ marginBottom: 28, fontSize: 14 }}>
                Khám phá các quán ăn ngon và thêm món vào giỏ hàng nhé!
              </p>
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                Khám phá quán ăn
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>

            {/* ── Cart items grouped by Shop ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Global Select All / Unselect All Action Bar */}
              <div
                className="card card-body"
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--color-cream-mid)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
                onClick={toggleSelectAllGlobal}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 14 }}>
                  {isGlobalAllSelected ? (
                    <CheckSquare size={20} color="var(--color-primary)" />
                  ) : (
                    <Square size={20} color="var(--color-muted)" />
                  )}
                  <span>{isGlobalAllSelected ? "Đã chọn tất cả món ăn" : "Chọn tất cả món ăn trong giỏ hàng (Tích full)"}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectAllGlobal();
                  }}
                  style={{ fontSize: 12 }}
                >
                  {isGlobalAllSelected ? "Bỏ tích tất cả" : "Tích full tất cả"}
                </button>
              </div>
              {Object.entries(groupedShops).map(([shopId, group]) => {
                const shopItemIds = group.items.map((i) => i.item_id);
                const isShopAllSelected = shopItemIds.every((id) => selectedItemIds.includes(id));

                return (
                  <div key={shopId} className="card card-body" style={{ padding: 20 }}>
                    {/* Shop Header Checkbox */}
                    <div
                      onClick={() => toggleSelectShop(group.items)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        paddingBottom: 14,
                        borderBottom: "1px solid var(--color-border-light)",
                        marginBottom: 16,
                        cursor: "pointer",
                      }}
                    >
                      {isShopAllSelected ? (
                        <CheckSquare size={20} color="var(--color-primary)" />
                      ) : (
                        <Square size={20} color="var(--color-muted)" />
                      )}
                      <Store size={18} color="var(--color-primary)" />
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{group.shopName}</span>
                      <span className="text-muted" style={{ fontSize: 12, marginLeft: "auto" }}>
                        ({group.items.length} món)
                      </span>
                    </div>

                    {/* Shop Items List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {group.items.map((item) => {
                        const isItemSelected = selectedItemIds.includes(item.item_id);
                        return (
                          <div
                            key={item.item_id}
                            style={{
                              display: "flex",
                              gap: 14,
                              alignItems: "center",
                              opacity: updatingId === item.item_id ? 0.55 : 1,
                              transition: "opacity 0.2s",
                            }}
                          >
                            {/* Checkbox */}
                            <div
                              onClick={() => toggleSelectItem(item.item_id)}
                              style={{ cursor: "pointer", flexShrink: 0 }}
                            >
                              {isItemSelected ? (
                                <CheckSquare size={18} color="var(--color-primary)" />
                              ) : (
                                <Square size={18} color="var(--color-muted)" />
                              )}
                            </div>

                            {/* Item Thumbnail */}
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: "var(--radius-sm)",
                                background: item.product?.image_url ? "#f5f5f5" : "var(--color-cream-mid)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                overflow: "hidden",
                              }}
                            >
                              {item.product?.image_url ? (
                                <img src={item.product.image_url} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <UtensilsCrossed size={20} color="var(--color-muted)" style={{ opacity: 0.5 }} />
                              )}
                            </div>

                            {/* Item Details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.product?.name}
                              </div>
                              <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>
                                {item.variant?.name && `Khẩu phần: ${item.variant.name}`}
                              </div>
                              <div className="text-price" style={{ fontSize: 13 }}>
                                {item.variant?.price?.toLocaleString()}đ / phần
                              </div>
                            </div>

                            {/* Quantity Control & Line Total */}
                            <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                              <div className="qty-control">
                                <button className="qty-btn" onClick={() => handleUpdateQuantity(item.item_id, item.quantity - 1)} disabled={item.quantity <= 1 || updatingId === item.item_id}>−</button>
                                <span className="qty-num">{item.quantity}</span>
                                <button className="qty-btn" onClick={() => handleUpdateQuantity(item.item_id, item.quantity + 1)} disabled={updatingId === item.item_id}>+</button>
                              </div>
                              <div style={{ minWidth: 76, textAlign: "right" }}>
                                <div className="text-price" style={{ fontSize: 14.5 }}>{item.line_total?.toLocaleString()}đ</div>
                              </div>
                              <button
                                onClick={() => handleRemove(item.item_id)}
                                disabled={updatingId === item.item_id}
                                style={{
                                  background: "none", border: "none", cursor: "pointer",
                                  color: "var(--color-muted)", padding: 4,
                                }}
                                title="Xóa món này"
                              >
                                {updatingId === item.item_id ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Order Summary Box ── */}
            <div className="card card-body" style={{ position: "sticky", top: 80 }}>
              <h3 style={{ fontSize: 16, marginBottom: 18 }}>Tóm tắt đơn hàng</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span className="text-muted">Đã chọn ({selectedItems.length} món)</span>
                  <span>{selectedSubtotal.toLocaleString()}đ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span className="text-muted">Phí giao hàng</span>
                  <span style={{ fontSize: 12.5, color: "var(--color-muted)" }}>Tính tại Checkout</span>
                </div>
              </div>
              <div className="divider-dashed" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng tạm tính</span>
                <span className="text-price" style={{ fontSize: 22 }}>{selectedSubtotal.toLocaleString()}đ</span>
              </div>
              <button
                className="btn btn-primary btn-block btn-lg"
                disabled={selectedItems.length === 0}
                onClick={() => navigate("/checkout")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                Tiến hành thanh toán ({selectedItems.length}) <ChevronRight size={17} />
              </button>
              <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 14, fontSize: 13, color: "var(--color-muted)", textDecoration: "none" }}>
                ← Tiếp tục mua sắm
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;