import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import MainLayout from "./layouts/MainLayout";
import RoleRoute from "./routes/RoleRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

import Home from "./pages/buyer/Home";
import ShopDetail from "./pages/buyer/ShopDetail";
import ProductDetail from "./pages/buyer/ProductDetail";
import Cart from "./pages/buyer/Cart";
import Checkout from "./pages/buyer/Checkout";
import OrderHistory from "./pages/buyer/OrderHistory";
import OrderDetail from "./pages/buyer/OrderDetail";
import UserProfile from "./pages/buyer/UserProfile";
import FavoritesPage from "./pages/buyer/FavoritesPage";

import SellerDashboard from "./pages/seller/SellerDashboard";
import CreateShop from "./pages/seller/CreateShop";
import ProductManagement from "./pages/seller/ProductManagement";
import ProductForm from "./pages/seller/ProductForm";
import ShopOrders from "./pages/seller/ShopOrders";

import AdminDashboard from "./pages/admin/Dashboard";
import ShopApproval from "./pages/admin/ShopApproval";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ReportManagement from "./pages/admin/ReportManagement";
import OrdersMonitor from "./pages/admin/OrdersMonitor";

import ShipperOrders from "./pages/shipper/ShipperOrders";
import PaymentResult from "./pages/buyer/PaymentResult";
import About from "./pages/static/About";
import Support from "./pages/static/Support";
import Terms from "./pages/static/Terms";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "123456789-dummy.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/payment-result" element={<PaymentResult />} />
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<Support />} />
                <Route path="/terms" element={<Terms />} />

                {/* Profile */}
                <Route element={<RoleRoute allowedRoles={["buyer", "seller", "admin", "shipper"]} />}>
                  <Route path="/profile" element={<UserProfile />} />
                </Route>

                {/* Buyer */}
                <Route element={<RoleRoute allowedRoles={["buyer"]} />}>
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                </Route>

                {/* Seller */}
                <Route element={<RoleRoute allowedRoles={["seller"]} />}>
                  <Route path="/seller/dashboard" element={<SellerDashboard />} />
                  <Route path="/seller/shop" element={<CreateShop />} />
                  <Route path="/seller/products" element={<ProductManagement />} />
                  <Route path="/seller/products/new" element={<ProductForm />} />
                  <Route path="/seller/products/:id/edit" element={<ProductForm />} />
                  <Route path="/seller/orders" element={<ShopOrders />} />
                </Route>

                {/* Admin */}
                <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/shops" element={<ShopApproval />} />
                  <Route path="/admin/categories" element={<CategoryManagement />} />
                  <Route path="/admin/reports" element={<ReportManagement />} />
                  <Route path="/admin/orders" element={<OrdersMonitor />} />
                </Route>

                {/* Shipper */}
                <Route element={<RoleRoute allowedRoles={["shipper"]} />}>
                  <Route path="/shipper/orders" element={<ShipperOrders />} />
                </Route>
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;