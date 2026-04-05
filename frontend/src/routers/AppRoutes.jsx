import { Routes, Route } from "react-router-dom";
import Login from "../pages/authentication/Login/Login";
import Register from "../pages/authentication/Register/Register";
import ForgotPass from "../pages/authentication/ForgotPass/ForgotPass";
import ResetPass from "../pages/authentication/ResetPass/ResetPass";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/request-reset" element={<ForgotPass />} />
            <Route path="/reset-password" element={<ResetPass />} />
        </Routes>
    );
}
