import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Check, X, Loader2 } from "lucide-react";

// Real Interactive OpenStreetMap + Leaflet map picker component
const AddressMapPicker = ({ initialLat = 10.7769, initialLng = 106.7009, onSelectLocation, onClose }) => {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [address, setAddress] = useState("Đang tải vị trí...");
  const [parsedLocation, setParsedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Reverse geocoding via OpenStreetMap Nominatim API
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        
        // Extract location parts
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.state || "TP. Hồ Chí Minh";
        const district = addr.suburb || addr.district || addr.county || "Quận 1";
        const ward = addr.quarter || addr.neighbourhood || addr.village || "";
        const road = addr.road || "";
        const houseNumber = addr.house_number || "";

        setParsedLocation({
          city,
          district,
          ward,
          road,
          houseNumber,
        });
      } else {
        setAddress(`Vị trí: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch {
      setAddress(`Vị trí tọa độ: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reverseGeocode(initialLat, initialLng);
  }, [initialLat, initialLng, reverseGeocode]);

  // Listen to postMessage events from Leaflet iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "LOCATION_SELECTED") {
        const { lat: newLat, lng: newLng } = event.data;
        setLat(newLat);
        setLng(newLng);
        reverseGeocode(newLat, newLng);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [reverseGeocode]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị vị trí!");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        reverseGeocode(latitude, longitude);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        alert("Không thể lấy vị trí hiện tại: " + (err.message || "Vui lòng cho phép quyền truy cập vị trí."));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onSelectLocation({
      latitude: lat,
      longitude: lng,
      fullAddress: address,
      parsedLocation: parsedLocation || {},
    });
    onClose();
  };

  // Generate Leaflet iframe HTML with interactive drag/click listener
  const iframeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #e5e3df; }
        .leaflet-control-attribution { font-size: 9px !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lng}], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);
        marker.bindPopup("<b>Địa điểm giao hàng</b><br>Kéo ghim hoặc bấm bản đồ").openPopup();

        function notify(lat, lng) {
          window.parent.postMessage({ type: 'LOCATION_SELECTED', lat: lat, lng: lng }, '*');
        }

        marker.on('dragend', function (e) {
          var coord = marker.getLatLng();
          notify(coord.lat, coord.lng);
        });

        map.on('click', function (e) {
          marker.setLatLng(e.latlng);
          notify(e.latlng.lat, e.latlng.lng);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <div className="logout-modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div
        className="logout-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 620,
          width: "92vw",
          padding: 0,
          textAlign: "left",
          overflow: "hidden",
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MapPin size={20} color="var(--color-gold)" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Bản đồ định vị giao hàng</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.8 }}>
            <X size={20} />
          </button>
        </div>

        {/* Map Display Frame */}
        <div style={{ height: 320, position: "relative", background: "#e5e3df" }}>
          <iframe
            title="Leaflet Map Picker"
            srcDoc={iframeHtml}
            style={{ width: "100%", height: "100%", border: "none" }}
          />

          {/* Quick GPS Button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={gpsLoading}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              zIndex: 1000,
              background: "#fff",
              border: "1.5px solid var(--color-primary)",
              borderRadius: 20,
              padding: "8px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--color-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            }}
          >
            {gpsLoading ? <Loader2 size={14} className="spin" /> : <Navigation size={14} color="var(--color-primary)" />}
            Tự động lấy vị trí GPS hiện tại
          </button>
        </div>

        {/* Selected Address Display & Action Buttons */}
        <div style={{ padding: 20, background: "var(--color-white)" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 700, display: "block", marginBottom: 4 }}>
              Địa chỉ nhận diện theo bản đồ:
            </label>
            <div
              style={{
                padding: "12px 14px",
                background: "var(--color-cream-pale)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "var(--color-ink)",
                minHeight: 48,
                display: "flex",
                alignItems: "center",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-muted)" }}>
                  <Loader2 size={16} className="spin" /> Đang cập nhật tên đường & quận huyện từ bản đồ...
                </span>
              ) : (
                address
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
              <Check size={16} /> Chọn địa chỉ này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressMapPicker;
