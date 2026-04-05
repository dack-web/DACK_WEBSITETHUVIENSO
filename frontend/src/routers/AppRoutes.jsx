import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/authentication/Login/Login";
import Register from "../pages/authentication/Register/Register";
import ForgotPass from "../pages/authentication/ForgotPass/ForgotPass";
import ResetPass from "../pages/authentication/ResetPass/ResetPass";
import HomePage from "../pages/home/HomePage";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import BooksInventory from "../pages/admin/books/BooksInventory";
import ManageBook from "../pages/admin/books/ManageBook";
import Circulation from "../pages/admin/circulation/Circulation";
import AuthorsInventory from "../pages/admin/authors/AuthorsInventory";
import ManageAuthor from "../pages/admin/authors/ManageAuthor";
import CategoriesInventory from "../pages/admin/categories/CategoriesInventory";
import ManageCategory from "../pages/admin/categories/ManageCategory";
import SearchDiscover from "../pages/home/SearchDiscover";
import UserDashboard from "../pages/home/UserDashboard";
import BookDetail from "../pages/home/BookDetail";
import NotFound from "../components/global/404/NotFound";
import MyBooks from "../pages/home/MyBooks";
import BorrowHistory from "../pages/home/BorrowHistory";
import UserProfile from "../pages/user/UserProfile";
import MembersInventory from "../pages/admin/members/MembersInventory";

import { ProtectedRoute, GuestRoute, RoleRoute, ResetPasswordGuard } from "../utils/RouteGuard";

export default function AppRoutes() {
    return (
        <Routes>
            {/* ... existing admin routes ... */}
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<HomePage />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="books" element={<BooksInventory />} />
                    <Route path="books/add" element={<ManageBook />} />
                    <Route path="books/edit/:id" element={<ManageBook />} />
                    <Route path="circulation" element={<Circulation />} />
                    <Route path="authors" element={<AuthorsInventory />} />
                    <Route path="authors/add" element={<ManageAuthor />} />
                    <Route path="authors/edit/:id" element={<ManageAuthor />} />
                    <Route path="categories" element={<CategoriesInventory />} />
                    <Route path="categories/add" element={<ManageCategory />} />
                    <Route path="categories/edit/:id" element={<ManageCategory />} />
                    <Route path="members" element={<MembersInventory />} />
                    <Route path="statistics" element={<div>Statistics (Coming Soon)</div>} />
                </Route>
            </Route>

            {/* Protected User routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />}>
                    <Route index element={<UserDashboard />} />
                    <Route path="books" element={<SearchDiscover />} />
                    <Route path="books/:id" element={<BookDetail />} />
                    <Route path="my-books" element={<MyBooks />} />
                    <Route path="history" element={<BorrowHistory />} />
                    <Route path="profile" element={<UserProfile />} />
                </Route>
            </Route>

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
