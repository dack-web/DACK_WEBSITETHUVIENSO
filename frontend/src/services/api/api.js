import axios from "../../utils/axios.customize";

// === Auth API ===
export const registerAPI = (data) => axios.post(`/auth/register`, data).then((res) => res.data);
export const loginAPI = (data) => axios.post(`/auth/login`, data).then((res) => res.data);
export const forgotPasswordAPI = (data) => axios.post(`/auth/forgot-password`, data).then((res) => res.data);
export const resetPasswordAPI = (token, new_password) => axios.post(`/auth/reset-password`, { token, new_password }).then((res) => res.data);
export const logoutAPI = () => axios.post(`/auth/logout`).then((res) => res.data);
export const refreshTokenAPI = () => axios.post("/auth/refresh-token").then((res) => res.data);
