import { Navigate } from "react-router-dom";
import { getAdminToken } from "./adminToken";

export default function RequireAdminAuth({ children }) {
  const token = getAdminToken();
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}
