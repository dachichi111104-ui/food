import { ChevronRight } from "lucide-react";

/**
 * DashboardLayout — shared wrapper cho seller/admin/shipper pages
 */
const DashboardLayout = ({ title, subtitle, actions, children }) => (
  <div style={{ background: "var(--color-bg)", minHeight: "60vh", padding: "32px 0 64px" }}>
    <div className="container">
      {(title || actions) && (
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 16, marginBottom: 24, flexWrap: "wrap",
        }}>
          <div>
            {title && (
              <h1 style={{ fontSize: "clamp(20px, 3vw, 26px)", marginBottom: subtitle ? 4 : 0 }}>
                {title}
              </h1>
            )}
            {subtitle && <p className="text-muted" style={{ fontSize: 14 }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  </div>
);

export default DashboardLayout;
