import axios from "../../utils/axios.customize";

// === Auth API ===
export const registerAPI = (data) => axios.post(`/auth/register`, data).then((res) => res.data);
export const loginAPI = (data) => axios.post(`/auth/login`, data).then((res) => res.data);
export const forgotPasswordAPI = (data) => axios.post(`/auth/forgot-password`, data).then((res) => res.data);
export const resetPasswordAPI = (token, new_password) => axios.post(`/auth/reset-password`, { token, new_password }).then((res) => res.data);
export const logoutAPI = () => axios.post(`/auth/logout`).then((res) => res.data);
export const refreshTokenAPI = () => axios.post("/auth/refresh-token").then((res) => res.data);

// === Books API ===
export const getBooksAPI = (params) => axios.get("/books", { params }).then((res) => res.data);
export const getBookByIdAPI = (id) => axios.get(`/books/${id}`).then((res) => res.data);
export const getRecommendedBooksAPI = (params) => axios.get("/books/recommended", { params }).then((res) => res.data);
export const addBookAPI = (formData) => axios.post("/books", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);
export const updateBookAPI = (id, formData) => axios.put(`/books/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);
export const deleteBookAPI = (id) => axios.delete(`/books/${id}`).then((res) => res.data);
