import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { listAddresses, createAddress, deleteAddress, setDefaultAddress } from "../../services/address.service";
import { VIETNAM_LOCATIONS } from "../../data/vietnamLocations";
import AddressMapPicker from "../../components/AddressMapPicker";
import { User, Phone, Lock, Camera, CheckCircle2, Loader2, KeyRound, Upload, Plus, Trash2, Bookmark, Navigation, MapPin } from "lucide-react";

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'addresses' | 'password'
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  /* Saved Addresses list for Buyer */
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddAddrModal, setShowAddAddrModal] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selectedLabelTab, setSelectedLabelTab] = useState("Nhà");
  const [customLabelInput, setCustomLabelInput] = useState("");

  const [newAddr, setNewAddr] = useState({
    recipient_name: user?.name || "",
    recipient_phone: user?.phone || "",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    street: "Nguyễn Huệ",
    house_number: "",
    is_default: false,
  });

  const handleDirectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ vị trí GPS!");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.state || "TP. Hồ Chí Minh";
            const district = addr.suburb || addr.district || addr.county || "Quận 1";
            const ward = addr.quarter || addr.neighbourhood || addr.village || "Phường Bến Nghé";
            const road = addr.road || "Nguyễn Huệ";
            const houseNum = addr.house_number || "Vị trí GPS";

            // Find matching location in VIETNAM_LOCATIONS dataset
            const matchedCityObj = VIETNAM_LOCATIONS.find((c) => c.city.includes(city) || city.includes(c.city)) || VIETNAM_LOCATIONS[0];
            const matchedDistObj = matchedCityObj.districts.find((d) => d.name.includes(district) || district.includes(d.name)) || matchedCityObj.districts[0];

            setNewAddr((prev) => ({
              ...prev,
              city: matchedCityObj.city,
              district: matchedDistObj.name,
              ward: matchedDistObj.wards.includes(ward) ? ward : matchedDistObj.wards[0],
              street: matchedDistObj.streets.includes(road) ? road : matchedDistObj.streets[0],
              house_number: houseNum,
            }));
          }
        } catch {
          // ignore
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        alert("Không thể lấy GPS: " + (err.message || "Bật quyền vị trí."));
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapSelectLocation = (mapData) => {
    if (mapData.parsedLocation) {
      const { city, district, ward, road, houseNumber } = mapData.parsedLocation;
      const matchedCityObj = VIETNAM_LOCATIONS.find((c) => c.city.includes(city) || city.includes(c.city)) || VIETNAM_LOCATIONS[0];
      const matchedDistObj = matchedCityObj.districts.find((d) => d.name.includes(district) || district.includes(d.name)) || matchedCityObj.districts[0];

      setNewAddr((prev) => ({
        ...prev,
        city: matchedCityObj.city,
        district: matchedDistObj.name,
        ward: matchedDistObj.wards.includes(ward) ? ward : matchedDistObj.wards[0],
        street: matchedDistObj.streets.includes(road) ? road : matchedDistObj.streets[0],
        house_number: houseNumber || "Địa chỉ theo map",
      }));
    }
  };

  /* Info Form */
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar_url: user?.avatar_url || "",
  });

  /* Password Form */
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isBuyer = user?.role === "buyer";

  const fetchSavedAddresses = () => {
    if (!isBuyer) return;
    listAddresses()
      .then((res) => setSavedAddresses(res.addresses || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchSavedAddresses();
  }, [user]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        avatar_url: user.avatar_url || "",
      });
      setNewAddr((prev) => ({
        ...prev,
        recipient_name: user.name || "",
        recipient_phone: user.phone || "",
      }));
    }
  }, [user]);

  // Dependent dropdown calculation for Add Address modal
  const modalCityObj = VIETNAM_LOCATIONS.find((c) => c.city === newAddr.city) || VIETNAM_LOCATIONS[0];
  const modalDistrictObj = modalCityObj.districts.find((d) => d.name === newAddr.district) || modalCityObj.districts[0];

  const modalAvailableDistricts = modalCityObj.districts;
  const modalAvailableWards = modalDistrictObj.wards;
  const modalAvailableStreets = modalDistrictObj.streets;

  const handleModalCityChange = (newCity) => {
    const cityObj = VIETNAM_LOCATIONS.find((c) => c.city === newCity) || VIETNAM_LOCATIONS[0];
    const defaultDist = cityObj.districts[0];
    setNewAddr({
      ...newAddr,
      city: newCity,
      district: defaultDist.name,
      ward: defaultDist.wards[0],
      street: defaultDist.streets[0],
    });
  };

  const handleModalDistrictChange = (newDist) => {
    const distObj = modalCityObj.districts.find((d) => d.name === newDist) || modalCityObj.districts[0];
    setNewAddr({
      ...newAddr,
      district: newDist,
      ward: distObj.wards[0],
      street: distObj.streets[0],
    });
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setMsg({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await api.patch("/auth/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data.user);
      setForm((prev) => ({ ...prev, avatar_url: res.data.user.avatar_url }));
      setMsg({ type: "success", text: "Đã cập nhật ảnh đại diện mới thành công!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Tải ảnh đại diện thất bại" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await api.patch("/auth/me", {
        name: form.name,
        phone: form.phone,
      });
      setUser(res.data.user);
      setMsg({ type: "success", text: "Cập nhật thông tin tài khoản thành công!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Cập nhật thất bại" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewAddress = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalLabel = selectedLabelTab === "Khác" ? (customLabelInput.trim() || "Địa chỉ khác") : selectedLabelTab;

    try {
      await createAddress({
        ...newAddr,
        label: finalLabel,
      });
      setShowAddAddrModal(false);
      setCustomLabelInput("");
      fetchSavedAddresses();
      setMsg({ type: "success", text: "Đã thêm địa chỉ giao hàng mới vào sổ địa chỉ!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Thêm địa chỉ thất bại" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddressItem = async (addrId) => {
    try {
      await deleteAddress(addrId);
      fetchSavedAddresses();
    } catch {
      // ignore
    }
  };

  const handleSetDefaultAddressItem = async (addrId) => {
    try {
      await setDefaultAddress(addrId);
      fetchSavedAddresses();
    } catch {
      // ignore
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setMsg({ type: "error", text: "Xác nhận mật khẩu mới không khớp!" });
      return;
    }
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await api.post("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Đổi mật khẩu thất bại" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "75vh", padding: "40px 0 64px" }}>
      {/* Map Picker Modal */}
      {showMapPicker && (
        <AddressMapPicker
          onSelectLocation={handleMapSelectLocation}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      {/* Add Address Modal for Buyer */}
      {showAddAddrModal && isBuyer && (
        <div className="logout-modal-overlay" onClick={() => setShowAddAddrModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, margin: 0 }}>Thêm địa chỉ mới vào Sổ địa chỉ</h3>
            </div>

            {/* Auto GPS and Map pickers */}
            <div style={{ padding: "10px 12px", background: "var(--color-cream-mid)", borderRadius: "var(--radius-sm)", marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleDirectGPSLocation}
                disabled={gpsLoading}
                style={{ background: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}
              >
                {gpsLoading ? <Loader2 size={13} className="spin" /> : <Navigation size={13} color="var(--color-primary)" />}
                Lấy vị trí GPS hiện tại
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowMapPicker(true)}
                style={{ background: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}
              >
                <MapPin size={13} color="var(--color-primary)" />
                Mở bản đồ chọn vị trí
              </button>
            </div>

            <form onSubmit={handleCreateNewAddress} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label>Đặt tên nhãn địa chỉ *</label>
                <div style={{ display: "flex", gap: 10, marginBottom: selectedLabelTab === "Khác" ? 10 : 0 }}>
                  {["Nhà", "Trường", "Công ty", "Khác"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      className={`btn ${selectedLabelTab === lbl ? "btn-primary" : "btn-outline"} btn-sm`}
                      onClick={() => setSelectedLabelTab(lbl)}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                {selectedLabelTab === "Khác" && (
                  <input
                    className="input"
                    placeholder="Nhập tên địa chỉ riêng (VD: Nhà bạn gái, Ký túc xá B...)"
                    value={customLabelInput}
                    onChange={(e) => setCustomLabelInput(e.target.value)}
                    required
                  />
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label>Tên người nhận *</label>
                  <input className="input" value={newAddr.recipient_name} onChange={(e) => setNewAddr({ ...newAddr, recipient_name: e.target.value })} required />
                </div>
                <div className="field">
                  <label>SĐT người nhận *</label>
                  <input className="input" value={newAddr.recipient_phone} onChange={(e) => setNewAddr({ ...newAddr, recipient_phone: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label>Thành phố *</label>
                  <select className="input" value={newAddr.city} onChange={(e) => handleModalCityChange(e.target.value)}>
                    {VIETNAM_LOCATIONS.map((c) => (
                      <option key={c.city} value={c.city}>{c.city}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Quận / Huyện *</label>
                  <select className="input" value={newAddr.district} onChange={(e) => handleModalDistrictChange(e.target.value)}>
                    {modalAvailableDistricts.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label>Phường / Xã *</label>
                  <select className="input" value={newAddr.ward} onChange={(e) => setNewAddr({ ...newAddr, ward: e.target.value })}>
                    {modalAvailableWards.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Tên đường *</label>
                  <select className="input" value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}>
                    {modalAvailableStreets.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Số nhà *</label>
                <input className="input" placeholder="VD: 45A" value={newAddr.house_number} onChange={(e) => setNewAddr({ ...newAddr, house_number: e.target.value })} required />
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddAddrModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Lưu địa chỉ này</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container" style={{ maxWidth: 880 }}>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <User size={26} color="var(--color-primary)" />
          Tài khoản của tôi ({user.role === "seller" ? "Chủ quán" : user.role === "shipper" ? "Tài xế" : user.role === "admin" ? "Quản trị viên" : "Người mua"})
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 24, alignItems: "start" }}>
          {/* Left Panel Sidebar */}
          <div className="card card-body" style={{ padding: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div className="profile-avatar" style={{ margin: "0 auto 14px", position: "relative" }}>
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt={user.name} />
                ) : (
                  <User size={40} color="var(--color-muted)" />
                )}
                {avatarUploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Loader2 size={24} className="spin" color="#fff" />
                  </div>
                )}
              </div>

              <label className="btn btn-outline btn-sm" style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", marginBottom: 12 }}>
                <Upload size={13} /> Đổi ảnh từ máy
                <input type="file" accept="image/*" onChange={handleAvatarFileSelect} style={{ display: "none" }} />
              </label>

              <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{user.email}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button className={`btn ${activeTab === "info" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab("info")} style={{ justifyContent: "flex-start", fontSize: 13.5 }}>
                <User size={15} /> Thông tin cá nhân
              </button>
              {isBuyer && (
                <button className={`btn ${activeTab === "addresses" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab("addresses")} style={{ justifyContent: "flex-start", fontSize: 13.5 }}>
                  <Bookmark size={15} /> Sổ địa chỉ ({savedAddresses.length})
                </button>
              )}
              <button className={`btn ${activeTab === "password" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab("password")} style={{ justifyContent: "flex-start", fontSize: 13.5 }}>
                <KeyRound size={15} /> Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="card card-body">
            {msg.text && (
              <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                {msg.type === "success" && <CheckCircle2 size={16} />}
                {msg.text}
              </div>
            )}

            {activeTab === "info" && (
              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ fontSize: 17, margin: 0, paddingBottom: 10, borderBottom: "1px solid var(--color-border)" }}>Thông tin tài khoản</h3>
                <div className="field"><label>Họ và tên *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="field"><label>Email (cố định)</label><input className="input" value={user.email} disabled style={{ opacity: 0.7, background: "var(--color-cream-mid)" }} /></div>
                  <div className="field"><label>Số điện thoại *</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
                  {loading ? <Loader2 size={16} className="spin" /> : "Lưu thay đổi"}
                </button>
              </form>
            )}

            {activeTab === "addresses" && isBuyer && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--color-border)" }}>
                  <h3 style={{ fontSize: 17, margin: 0 }}>Sổ địa chỉ giao hàng của tôi</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddAddrModal(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Plus size={14} /> Thêm địa chỉ mới
                  </button>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <p className="text-muted">Bạn chưa lưu địa chỉ nào. Bấm nút phía trên để thêm [Nhà], [Trường], [Công ty].</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {savedAddresses.map((addr) => (
                      <div key={addr._id} style={{ padding: "14px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", background: addr.is_default ? "var(--color-primary-pale)" : "var(--color-white)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span className="badge badge-gold" style={{ fontSize: 11 }}>{addr.label}</span>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{addr.recipient_name}</span>
                            <span className="text-muted" style={{ fontSize: 13 }}>({addr.recipient_phone})</span>
                            {addr.is_default && <span className="badge badge-success" style={{ fontSize: 10 }}>Mặc định</span>}
                          </div>
                          <div style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.5 }}>{addr.full_address}</div>
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {!addr.is_default && (
                            <button className="btn btn-ghost btn-sm" onClick={() => handleSetDefaultAddressItem(addr._id)} style={{ fontSize: 12 }}>
                              Đặt mặc định
                            </button>
                          )}
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)" }} onClick={() => handleDeleteAddressItem(addr._id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ fontSize: 17, margin: 0, paddingBottom: 10, borderBottom: "1px solid var(--color-border)" }}>Đổi mật khẩu</h3>
                <div className="field"><label>Mật khẩu hiện tại *</label><input type="password" className="input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required /></div>
                <div className="field"><label>Mật khẩu mới *</label><input type="password" className="input" placeholder="Tối thiểu 6 ký tự" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required /></div>
                <div className="field"><label>Xác nhận mật khẩu mới *</label><input type="password" className="input" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required /></div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
                  {loading ? <Loader2 size={16} className="spin" /> : "Đổi mật khẩu"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
