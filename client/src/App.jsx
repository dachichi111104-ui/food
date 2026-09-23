import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Home from "./pages/buyer/Home";
import ShopDetail from "./pages/buyer/ShopDetail";
import ProductDetail from "./pages/buyer/ProductDetail";
import Cart from "./pages/buyer/Cart";
import Checkout from "./pages/buyer/Checkout";
import OrderHistory from "./pages/buyer/OrderHistory";
import OrderDetail from "./pages/buyer/OrderDetail";
import CreateShop from "./pages/seller/CreateShop";
import ProductManagement from "./pages/seller/ProductManagement";
import ProductForm from "./pages/seller/ProductForm";
import ShopOrders from "./pages/seller/ShopOrders";
import ShopApproval from "./pages/admin/ShopApproval";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ReportManagement from "./pages/admin/ReportManagement";
import OrdersMonitor from "./pages/admin/OrdersMonitor";
import ShipperOrders from "./pages/shipper/ShipperOrders";
import PaymentResult from "./pages/buyer/PaymentResult";
import About from "./pages/static/About";
import Support from "./pages/static/Support";
import Terms from "./pages/static/Terms";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <CartProvider>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/shops/:id" element={<ShopDetail />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/about" element={<About />} />
<Route path="/support" element={<Support />} />
<Route path="/terms" element={<Terms />} />

            {/* Buyer - cần đăng nhập + đúng role */}
            <Route element={<RoleRoute allowedRoles={["buyer"]} />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Route>

            {/* Seller - Phase 11.3 */}
<Route element={<RoleRoute allowedRoles={["seller"]} />}>
  <Route path="/seller/shop" element={<CreateShop />} />
  <Route path="/seller/products" element={<ProductManagement />} />
  <Route path="/seller/products/new" element={<ProductForm />} />
  <Route path="/seller/products/:id/edit" element={<ProductForm />} />
  <Route path="/seller/orders" element={<ShopOrders />} />
</Route>
            {/* Admin - Phase 11.4 */}
<Route element={<RoleRoute allowedRoles={["admin"]} />}>
  <Route path="/admin/shops" element={<ShopApproval />} />
  <Route path="/admin/categories" element={<CategoryManagement />} />
  <Route path="/admin/reports" element={<ReportManagement />} />
  <Route path="/admin/orders" element={<OrdersMonitor />} />
</Route>
            {/* Shipper - Phase 11.5 */}
<Route element={<RoleRoute allowedRoles={["shipper"]} />}>
  <Route path="/shipper/orders" element={<ShipperOrders />} />
</Route>
          </Route>
        </Routes>
      </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;