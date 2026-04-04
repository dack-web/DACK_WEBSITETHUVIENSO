import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authentication/AuthContext";

// Chặn trang private nếu chưa login
export const ProtectedRoute = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

// Chặn trang login/register nếu đã login
export const GuestRoute = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/"} replace />;
    }

    return <Outlet />;
};

// Chặn role
export const RoleRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/404" replace />;
    }

    return <Outlet />;
};

// Chặn reset password nếu không có token
export const ResetPasswordGuard = ({ children }) => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
        return <Navigate to="/404" replace />;
    }

    return children;
};
