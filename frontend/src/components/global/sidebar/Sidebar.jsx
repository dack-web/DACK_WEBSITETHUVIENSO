import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import { useRef } from "react";
import "./Sidebar.css";
import useClickOutside from "../../../hooks/useClickOutside";

const menuConfig = {
    admin: [
        { path: "/admin/dashboard", name: "Dashboard", icon: "fa-chart-bar" },
        { path: "/admin/books", name: "Books Inventory", icon: "fa-book-open" },
        { path: "/admin/authors", name: "Authors", icon: "fa-user-pen" },
        { path: "/admin/categories", name: "Categories", icon: "fa-tags" },
        { path: "/admin/circulation", name: "Circulation", icon: "fa-exchange-alt" },
        { path: "/admin/members", name: "Members", icon: "fa-users" },
        
    ],
    user: [
        { path: "/", name: "Home", icon: "fa-home" },
        { path: "/books", name: "Browse Books", icon: "fa-book" },
        { path: "/my-books", name: "My Borrowed", icon: "fa-bookmark" },
        { path: "/history", name: "History", icon: "fa-history" },
        { path: "/profile", name: "Profile", icon: "fa-user" },
    ],
};

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const role = user?.role || "user";
    const menu = menuConfig[role] || menuConfig.user;

    useClickOutside([sidebarRef], () => {
        if (isOpen) onClose();
    });

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <>
            {/* 🔥 Overlay */}
            <div className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={onClose}></div>
            <aside ref={sidebarRef} className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <h3>{role === "admin" ? "Admin Management" : "Library"}</h3>
                </div>

                <nav className="sidebar-nav">
                    {menu.map((item) => (
                        <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <i className={`fa-solid ${item.icon}`}></i>
                            <span className="nav-text">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span className="nav-text">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
