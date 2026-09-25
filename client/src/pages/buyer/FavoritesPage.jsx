import { useState, useEffect } from "react";
import { listFavorites, toggleFavorite } from "../../services/favorite.service";
import { Link } from "react-router-dom";
import { Heart, Star, MapPin, Store, Trash2 } from "lucide-react";

const FavoritesPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => {
    setLoading(true);
    listFavorites()
      .then((data) => setShops(data.shops || []))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (e, shopId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite(shopId);
      setShops((prev) => prev.filter((s) => s._id !== shopId));
    } catch {
      // ignore error
    }
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "65vh", padding: "40px 0 64px" }}>
      <div className="container" style={{ maxWidth: 880 }}>

        <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <Heart size={26} color="var(--color-danger)" fill="var(--color-danger)" />
          Quán ăn yêu thích
        </h1>

        {loading && <div className="spinner-wrap"><div className="spinner" /><span>Đang tải...</span></div>}

        {!loading && shops.length === 0 && (
          <div className="card card-body" style={{ padding: 56, textAlign: "center" }}>
            <Heart size={48} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--color-muted)" }} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>Chưa có quán ăn yêu thích</div>
            <p className="text-muted" style={{ marginBottom: 24, fontSize: 14 }}>
              Nhấn biểu tượng trái tim tại quán ăn bạn yêu thích để lưu vào danh sách này.
            </p>
            <Link to="/" className="btn btn-primary">Khám phá quán ăn</Link>
          </div>
        )}

        {!loading && shops.length > 0 && (
          <div className="grid-restaurants">
            {shops.map((shop) => (
              <Link key={shop._id} to={`/shops/${shop._id}`} className="restaurant-card" style={{ position: "relative" }}>
                <button
                  onClick={(e) => handleRemove(e, shop._id)}
                  title="Xoá khỏi yêu thích"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 10,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  <Heart size={16} fill="var(--color-danger)" color="var(--color-danger)" />
                </button>

                <div className="restaurant-card-cover" style={{ position: "relative", overflow: "hidden" }}>
                  {shop.cover_url ? (
                    <img src={shop.cover_url} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Store size={38} color="rgba(255,255,255,0.25)" style={{ margin: "auto" }} />
                  )}
                </div>

                <div className="restaurant-card-body">
                  <div className="restaurant-card-name">{shop.name}</div>
                  {shop.address && (
                    <div className="restaurant-card-meta" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={11} style={{ flexShrink: 0 }} />
                      {shop.address}
                    </div>
                  )}
                  <div className="restaurant-card-footer">
                    {shop.rating > 0 ? (
                      <span className="badge badge-rating" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={11} fill="currentColor" />
                        {shop.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="badge" style={{ background: "var(--color-cream-mid)", color: "var(--color-muted)", fontSize: 11 }}>
                        Mới
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default FavoritesPage;
