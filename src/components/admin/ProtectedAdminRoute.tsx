import { Navigate } from "react-router-dom";
import { clearAdminSession, getAdminLoginTime, getAdminToken } from "@/lib/authStorage";

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  const loginTime = getAdminLoginTime();

  if (!token || !loginTime) return false;

  const elapsed = Date.now() - Number(loginTime);
  if (elapsed > SESSION_DURATION) {
    clearAdminSession();
    return false;
  }

  return true;
}

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedAdminRoute;
