import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/authentication/Login/Login";
import Register from "../pages/authentication/Register/Register";
import ForgotPass from "../pages/authentication/ForgotPass/ForgotPass";
import ResetPass from "../pages/authentication/ResetPass/ResetPass";
import NotFound from "../components/global/404/NotFound";

import { GuestRoute, ResetPasswordGuard } from "../utils/RouteGuard";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Guest */}
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPass />} />
            </Route>

            {/* Reset password */}
            <Route
                path="/reset-password"
                element={
                    <ResetPasswordGuard>
                        <ResetPass />
                    </ResetPasswordGuard>
                }
            />

            {/* 404 */}
            <Route path="/404" element={<NotFound />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}
