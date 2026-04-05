import { useEffect, useState } from "react";
import { getFavoritesAPI, getBorrowHistoryAPI } from "../../services/api/api";
import { useAuth } from "../../contexts/authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import "./MyBooks.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const MyBooks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [savedBooks, setSavedBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("saved"); // "saved" or "borrowed"

    useEffect(() => {
        const fetchAllData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const [favRes, borrowRes] = await Promise.all([getFavoritesAPI(), getBorrowHistoryAPI({ user_id: user.id })]);

                if (favRes.success) setSavedBooks(favRes.data);

                // For borrowed, filter only those that are NOT returned yet
                if (borrowRes.success) {
                    const activeBorrows = borrowRes.data.filter((b) => !b.return_date);
                    setBorrowedBooks(activeBorrows);
                }
            } catch (error) {
                console.error("Fetch my books error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [user]);

    if (loading)
        return (
            <div className="my-books-loading">
                <i className="fa-solid fa-spinner fa-spin"></i> Loading My Collection...
            </div>
        );

    return (
        <div className="my-books-wrapper">
            <header className="my-books-header">
                <h1>My Collection</h1>
                <p>Manage your saved volumes and active borrowings.</p>
            </header>

            <div className="tab-container">
                <button className={`tab-btn ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab("saved")}>
                    <i className="fa-solid fa-bookmark"></i> Saved to List ({savedBooks.length})
                </button>
                <button className={`tab-btn ${activeTab === "borrowed" ? "active" : ""}`} onClick={() => setActiveTab("borrowed")}>
                    <i className="fa-solid fa-book-reader"></i> Currently Borrowed ({borrowedBooks.length})
                </button>
            </div>

            <div className="collection-content">
                {activeTab === "saved" ? (
                    <div className="books-grid">
                        {savedBooks.length > 0 ? (
                            savedBooks.map((book) => (
                                <div key={book.book_id} className="book-card-mini" onClick={() => navigate(`/books/${book.book_id}`)}>
                                    <div className="book-cover-mini">
                                        {book.cover_image ? (
                                            <img src={`${BACKEND_URL}/uploads${book.cover_image.replace("/uploads", "")}`} alt={book.title} />
                                        ) : (
                                            <div className="placeholder-mini">
                                                <i className="fa-solid fa-book"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="book-info-mini">
                                        <h4>{book.title}</h4>
                                        <p>{book.author_name}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <i className="fa-regular fa-bookmark"></i>
                                <p>You haven't saved any books yet.</p>
                                <button className="explore-btn" onClick={() => navigate("/books")}>
                                    Browse Catalog
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="books-grid">
                        {borrowedBooks.length > 0 ? (
                            borrowedBooks.map((borrow) => (
                                <div key={borrow.id} className="book-card-mini" onClick={() => navigate(`/books/${borrow.book_id}`)}>
                                    <div className="book-cover-mini">
                                        {borrow.cover_image ? (
                                            <img src={`${BACKEND_URL}/uploads${borrow.cover_image.replace("/uploads", "")}`} alt={borrow.book_title} />
                                        ) : (
                                            <div className="placeholder-mini">
                                                <i className="fa-solid fa-book-medical"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="book-info-mini">
                                        <h4>{borrow.book_title}</h4>
                                        <span className="due-date">Due: {new Date(borrow.due_date).toLocaleDateString()}</span>
                                        <span className={`status-tag ${borrow.status}`}>{borrow.status}</span>
                                        {borrow.pdf_file && (
                                            <button
                                                className="read-pdf-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`${BACKEND_URL}/uploads${borrow.pdf_file.replace("/uploads", "")}`, "_blank");
                                                }}
                                            >
                                                <i className="fa-solid fa-file-pdf"></i> Read PDF
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <i className="fa-solid fa-book-open"></i>
                                <p>No active borrowings found.</p>
                                <button className="explore-btn" onClick={() => navigate("/books")}>
                                    Find a Book
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBooks;
