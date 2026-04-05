import axios from "../../utils/axios.customize";

// === Auth API ===
export const registerAPI = (data) => axios.post(`/auth/register`, data).then(res => res.data);
export const loginAPI = (data) => axios.post(`/auth/login`, data).then(res => res.data);
export const forgotPasswordAPI = (data) => axios.post(`/auth/forgot-password`, data).then(res => res.data);
export const resetPasswordAPI = (token, new_password) => 
    axios.post(`/auth/reset-password`, { token, new_password }).then(res => res.data);
export const logoutAPI = () => axios.post(`/auth/logout`).then(res => res.data);
export const refreshTokenAPI = () => axios.post("/auth/refresh-token").then(res => res.data);

// === Books API ===
export const getBooksAPI = (params) => axios.get("/books", { params }).then(res => res.data);
export const getBookByIdAPI = (id) => axios.get(`/books/${id}`).then(res => res.data);
export const getRecommendedBooksAPI = (params) => axios.get("/books/recommended", { params }).then(res => res.data);
export const addBookAPI = (formData) => 
    axios.post("/books", formData, { headers: { "Content-Type": "multipart/form-data" } }).then(res => res.data);
export const updateBookAPI = (id, formData) => 
    axios.put(`/books/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then(res => res.data);
export const deleteBookAPI = (id) => axios.delete(`/books/${id}`).then(res => res.data);

// === Authors API ===
export const getAuthorsAPI = () => axios.get("/authors").then(res => res.data);
export const addAuthorAPI = (data) => axios.post("/authors", data).then(res => res.data);
export const updateAuthorAPI = (id, data) => axios.put(`/authors/${id}`, data).then(res => res.data);
export const deleteAuthorAPI = (id) => axios.delete(`/authors/${id}`).then(res => res.data);

// === Categories API ===
export const getCategoriesAPI = () => axios.get("/categories").then(res => res.data);
export const addCategoryAPI = (data) => axios.post("/categories", data).then(res => res.data);
export const updateCategoryAPI = (id, data) => axios.put(`/categories/${id}`, data).then(res => res.data);
export const deleteCategoryAPI = (id) => axios.delete(`/categories/${id}`).then(res => res.data);

// === Borrows API ===
export const borrowBookAPI = (data) => axios.post("/borrows/borrow", data).then(res => res.data);
export const returnBookAPI = (borrowId) => axios.post(`/borrows/return/${borrowId}`).then(res => res.data);
export const extendBorrowAPI = (borrowId, data) => axios.post(`/borrows/extend/${borrowId}`, data).then(res => res.data);
export const reserveBookAPI = (data) => axios.post("/borrows/reserve", data).then(res => res.data);
export const getBorrowHistoryAPI = (params) => axios.get("/borrows/history", { params }).then(res => res.data);
export const getBookStatusAPI = (bookId) => axios.get(`/borrows/status/${bookId}`).then(res => res.data);
export const checkOverdueAPI = () => axios.get("/borrows/overdue").then(res => res.data);
export const getMemberByIdAPI = (id) => axios.get(`/members/${id}`).then(res => res.data);


// === Favorites API ===
export const toggleFavoriteAPI = (bookId) => axios.post("/favorites/toggle", { bookId }).then(res => res.data);
export const getFavoritesAPI = () => axios.get("/favorites").then(res => res.data);
export const checkFavoriteStatusAPI = (bookId) => axios.get(`/favorites/status/${bookId}`).then(res => res.data);