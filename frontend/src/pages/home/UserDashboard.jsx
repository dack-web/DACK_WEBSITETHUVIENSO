import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authentication/AuthContext";
import { getBooksAPI } from "../../services/api/api";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

const UserDashboard = () => {
    const { user } = useAuth();
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const res = await getBooksAPI({ limit: 4, sort: "newest" });
                if (res.success) {
                    setNewArrivals(res.data);
                }
            } catch (error) {
                console.error("Fetch new arrivals error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewArrivals();
    }, []);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="user-dashboard-wrapper">
            <header className="dashboard-hero">
                <div className="hero-content">
                    <span className="greeting-pill">{getTimeGreeting()}</span>
                    <h1>Welcome back, {user?.name || "Bibliophile"}</h1>
                    <p>“Reading is a conversation. All books talk. But a good book listens as well.”</p>
                    <div className="hero-actions">
                        <button className="primary-btn" onClick={() => navigate("/books")}>
                            <i className="fa-solid fa-magnifying-glass"></i> Explore Catalog
                        </button>
                        <button className="secondary-btn" onClick={() => navigate("/my-books")}>
                            My Reading List
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="abstract-shape-1"></div>
                    <div className="abstract-shape-2"></div>
                </div>
            </header>

            <section className="stats-overview">
                <div className="stat-card">
                    <i className="fa-solid fa-book-reader"></i>
                    <div>
                        <h3>2</h3>
                        <p>Active Borrows</p>
                    </div>
                </div>
                <div className="stat-card">
                    <i className="fa-solid fa-clock"></i>
                    <div>
                        <h3>4 Days</h3>
                        <p>Until Next Due</p>
                    </div>
                </div>
                <div className="stat-card gold">
                    <i className="fa-solid fa-bolt"></i>
                    <div>
                        <h3>12 Days</h3>
                        <p>Reading Streak</p>
                    </div>
                </div>
            </section>

            <div className="dashboard-main-content">
                <section className="new-arrivals-section">
                    <div className="section-header">
                        <h2>New Arrivals</h2>
                        <button className="text-link" onClick={() => navigate("/books")}>
                            View all
                        </button>
                    </div>

                    <div className="arrivals-grid">
                        {loading ? (
                            <div className="arrival-skeleton-loader">Loading...</div>
                        ) : newArrivals.length > 0 ? (
                            newArrivals.map((book) => (
                                <div key={book.id} className="arrival-card" onClick={() => navigate(`/books/${book.id}`)}>
                                    <div className="arrival-cover">
                                        {book.cover_image ? (
                                            <img src={`${BACKEND_URL}/uploads${book.cover_image.replace("/uploads", "")}`} alt={book.title} />
                                        ) : (
                                            <div className="cover-placeholder">
                                                <i className="fa-solid fa-book"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="arrival-info">
                                        <h4>{book.title}</h4>
                                        <p>{book.author_name}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-msg">No new arrivals yet.</p>
                        )}
                    </div>
                </section>

                <aside className="quick-activity-panel">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon return">
                                <i className="fa-solid fa-rotate-left"></i>
                            </div>
                            <div className="activity-text">
                                <p>
                                    <strong>Returned</strong> 'The Republic'
                                </p>
                                <span>2 days ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon borrow">
                                <i className="fa-solid fa-book-medical"></i>
                            </div>
                            <div className="activity-text">
                                <p>
                                    <strong>Borrowed</strong> 'The Iliad'
                                </p>
                                <span>5 days ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon star">
                                <i className="fa-solid fa-medal"></i>
                            </div>
                            <div className="activity-text">
                                <p>
                                    <strong>Earned Badge</strong> 'History Buff'
                                </p>
                                <span>1 week ago</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default UserDashboard;
