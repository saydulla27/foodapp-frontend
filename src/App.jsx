import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";
import RequireAdminAuth from "./auth/RequireAdminAuth";

import Login from "./pages/Login";
import CompaniesList from "./pages/CompaniesList";
import CompanyForm from "./pages/CompanyForm";
import Billing from "./pages/Billing";
import SuperReports from "./pages/SuperReports";

import AdminLogin from "./pages/AdminLogin";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminCouriers from "./pages/AdminCouriers";
import AdminCategories from "./pages/AdminCategories";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminFeedback from "./pages/AdminFeedback";
import WebApp from "./pages/WebApp";

export default function App() {
  // Local dev: VITE_BASENAME is usually empty -> "/"
  // Server deploy behind /foodapp/superadmin -> set VITE_BASENAME=/foodapp/superadmin
  const basename = (import.meta?.env?.VITE_BASENAME || "/").replace(/\/+$/, "") || "/";
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Telegram Mini App */}
        <Route path="/webapp" element={<WebApp />} />

        <Route path="/" element={<Navigate to="/superadmin/companies" replace />} />

        {/* SuperAdmin */}
        <Route path="/superadmin/login" element={<Login />} />
        <Route
          path="/superadmin/companies"
          element={
            <RequireAuth>
              <CompaniesList />
            </RequireAuth>
          }
        />
        <Route
          path="/superadmin/companies/new"
          element={
            <RequireAuth>
              <CompanyForm />
            </RequireAuth>
          }
        />
        <Route
          path="/superadmin/companies/:id/edit"
          element={
            <RequireAuth>
              <CompanyForm />
            </RequireAuth>
          }
        />
        <Route
          path="/superadmin/billing"
          element={
            <RequireAuth>
              <Billing />
            </RequireAuth>
          }
        />

        <Route
          path="/superadmin/reports"
          element={
            <RequireAuth>
              <SuperReports />
            </RequireAuth>
          }
        />

        {/* Company Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/orders"
          element={
            <RequireAdminAuth>
              <AdminOrders />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAdminAuth>
              <AdminProducts />
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <RequireAdminAuth>
              <AdminCategories />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/couriers"
          element={
            <RequireAdminAuth>
              <AdminCouriers />
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <RequireAdminAuth>
              <AdminReports />
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin/feedback"
          element={
            <RequireAdminAuth>
              <AdminFeedback />
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <RequireAdminAuth>
              <AdminSettings />
            </RequireAdminAuth>
          }
        />

        <Route path="*" element={<Navigate to="/superadmin/companies" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
