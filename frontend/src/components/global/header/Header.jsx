import { useRef, useState } from "react";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import "./Header.css";
import useClickOutside from "../../../hooks/useClickOutside";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

const Header = ({ activeSidebar, closeSidebar }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const iconRef = useRef(null);

    useClickOutside([searchRef, iconRef], () => {
        setIsOpen(false);
    });

    return (
        <nav className="topnav-admin">
            <div className="topnav-left">
                <span className="logo">The Scholarly Curator</span>
                <div className="search-container">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search collection or members..." className="search-input" />
                </div>
            </div>

            <div className="topnav-right">               

                <i ref={iconRef} className="fa-solid fa-magnifying-glass" onClick={() => setIsOpen((prev) => !prev)}></i>

                <i className={`fa-solid fa-bars`} onClick={activeSidebar}></i>

                <div className="avatar">
                    {user?.avatar ? (
                        <img src={`${BACKEND_URL}${user.avatar}`} alt="Avatar" />
                    ) : (
                        <div className="avatar-placeholder-header">
                            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>
            </div>
            <div className={`search-container_res ${isOpen ? "open" : ""}`} ref={searchRef}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search collection or members..." className="search-input" />
            </div>
        </nav>
    );
};

export default Header;
