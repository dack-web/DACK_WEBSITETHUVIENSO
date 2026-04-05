import { createContext, useContext, useState, useMemo } from "react";
import { loginAPI, refreshTokenAPI, logoutAPI, registerAPI, resetPasswordAPI, forgotPasswordAPI } from "../../services/api/api";
import { toast } from "react-toastify";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [loading, setLoading] = useState(false);

    const login = async (values) => {
        try {
            setLoading(true);

            const res = await loginAPI(values);
            const { accessToken, user } = res;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(user));

            setUser(user);

            return res;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const refreshAccessToken = async () => {
        try {
            const res = await refreshTokenAPI();
            const newToken = res.accessToken || res.data?.accessToken;

            localStorage.setItem("accessToken", newToken);

            return newToken;
        } catch (err) {
            await logout();
        }
    };

    const logout = async () => {
        try {
            await logoutAPI();
        } catch {}

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        toast.info("Đã đăng xuất");
        setUser(null);
    };

    const register = async (values) => {
        try {
            const res = await registerAPI(values);

            toast.success("Đăng ký thành công 🎉");

            return res.data;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Đăng ký thất bại");
            throw err;
        }
    };

    const requestResetPassword = async (email) => {
        try {
            const res = await forgotPasswordAPI({ email });

            toast.success("Đã gửi email reset 📩");

            return res.data;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Gửi email thất bại");
            throw err;
        }
    };
    const resetPassword = async (data) => {
        try {
            const res = await resetPasswordAPI(data.token, data.new_password);

            toast.success("Đổi mật khẩu thành công 🔑");

            return res;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại");
            throw err;
        }
    };

    const updateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
            register,
            requestResetPassword,
            resetPassword,
            refreshAccessToken,
            updateUser,
        }),
        [user, loading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
