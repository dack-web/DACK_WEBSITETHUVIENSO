import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookByIdAPI, getRecommendedBooksAPI, borrowBookAPI, toggleFavoriteAPI, checkFavoriteStatusAPI } from "../../services/api/api";
import { useAuth } from "../../contexts/authentication/AuthContext";
import { toast } from "react-toastify";
import "./BookDetail.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [borrowLoading, setBorrowLoading] = useState(false);

    useEffect(() => {
        const fetchBookData = async () => {
            setLoading(true);
            try {
                const res = await getBookByIdAPI(id);
                if (res.success) {
                    setBook(res.data);
                    // Fetch related books once we have the category
                    const recoRes = await getRecommendedBooksAPI({
                        category_id: res.data.category_id,
                        exclude: id,
                        limit: 4,
                    });
                    if (recoRes.success) setRelatedBooks(recoRes.data);
                }
            } catch (error) {
                console.error("Fetch book detail error:", error);
            } finally {
                setLoading(false);
            }
        };

        const checkFavorite = async () => {
            if (!user) return;
            try {
                const res = await checkFavoriteStatusAPI(id);
                if (res.success) setIsFavorite(res.isFavorite);
            } catch (error) {
                console.error("Check favorite error:", error);
            }
        };

        fetchBookData();
        checkFavorite();
        window.scrollTo(0, 0);
    }, [id, user]);

    const handleBorrow = async () => {
        if (!user) {
            toast.info("Please login to borrow books");
            navigate("/login");
            return;
        }

        setBorrowLoading(true);
        try {
            const res = await borrowBookAPI({ book_id: id });
            if (res.success) {
                toast.success("Book borrowed successfully!");
            } else {
                toast.error(res.message || "Failed to borrow book");
            }
        } catch (error) {
            console.error("Borrow error:", error);
            toast.error(error.response?.data?.message || "An error occurred while borrowing");
        } finally {
            setBorrowLoading(false);
        }
    };

    const handleSaveToList = async () => {
        if (!user) {
            toast.info("Please login to save books to your list");
            navigate("/login");
            return;
        }

        try {
            const res = await toggleFavoriteAPI(id);
            if (res.success) {
                setIsFavorite(res.isFavorite);
                toast.success(res.message);
            }
        } catch (error) {
            console.error("Toggle favorite error:", error);
            toast.error("Failed to update favorite list");
        }
    };

    const handleReadPDF = () => {
        if (book.pdf_file) {
            window.open(`${BACKEND_URL}/uploads${book.pdf_file.replace("/uploads", "")}`, "_blank");
        } else {
            toast.info("PDF not available for this book");
        }
    };

    if (loading)
        return (
            <div className="detail-loading">
                <i className="fa-solid fa-spinner fa-spin"></i> Loading Archive...
            </div>
        );
    if (!book) return <div className="detail-error">Book not found.</div>;

    return (
        <div className="book-detail-wrapper">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <i className="fa-solid fa-arrow-left"></i> Back to Catalog
            </button>

            <div className="detail-container">
                <div className="detail-visual">
                    <div className="book-cover-large">
                        {book.cover_image ? (
                            <img src={`${BACKEND_URL}/uploads${book.cover_image.replace("/uploads", "")}`} alt={book.title} />
                        ) : (
                            <div className="cover-placeholder-large">
                                <i className="fa-solid fa-book-open"></i>
                            </div>
                        )}
                    </div>
                </div>

                <div className="detail-info">
                    <div className="info-header">
                        <span className="category-tag">{book.category_name}</span>
                        <h1>{book.title}</h1>
                        <p className="author-by">
                            by <span>{book.author_name}</span>
                        </p>
                    </div>

                    <div className="meta-grid">
                        <div className="meta-item">
                            <span>ISBN</span>
                            <strong>{book.isbn || "N/A"}</strong>
                        </div>
                        <div className="meta-item">
                            <span>Published</span>
                            <strong>{book.published_year}</strong>
                        </div>
                        <div className="meta-item">
                            <span>Format</span>
                            <strong>Hardcover</strong>
                        </div>
                        <div className="meta-item">
                            <span>Language</span>
                            <strong>English</strong>
                        </div>
                    </div>

                    <div className="book-description">
                        <h3>Description</h3>
                        <p>{book.description || "No description available for this volume."}</p>
                    </div>

                    <div className="action-panel">
                        <button className="borrow-btn" onClick={handleBorrow} disabled={borrowLoading}>
                            <i className={`fa-solid ${borrowLoading ? "fa-spinner fa-spin" : "fa-book-medical"}`}></i>
                            {borrowLoading ? " Processing..." : " Borrow this Book"}
                        </button>
                        <button className={`secondary-action-btn ${isFavorite ? "active" : ""}`} onClick={handleSaveToList}>
                            <i className={`${isFavorite ? "fa-solid" : "fa-regular"} fa-bookmark`}></i>
                            {isFavorite ? " Saved to List" : " Save to List"}
                        </button>
                        {book.pdf_file && (
                            <button className="secondary-action-btn" onClick={handleReadPDF}>
                                <i className="fa-solid fa-file-pdf"></i> Read PDF
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {relatedBooks.length > 0 && (
                <section className="related-books-section">
                    <h2>Related Volumes</h2>
                    <div className="related-grid">
                        {relatedBooks.map((reco) => (
                            <div key={reco.id} className="related-card" onClick={() => navigate(`/books/${reco.id}`)}>
                                <div className="related-cover">
                                    {reco.cover_image ? (
                                        <img src={`${BACKEND_URL}/uploads${reco.cover_image.replace("/uploads", "")}`} alt={reco.title} />
                                    ) : (
                                        <div className="placeholder-mini">
                                            <i className="fa-solid fa-book"></i>
                                        </div>
                                    )}
                                </div>
                                <h4>{reco.title}</h4>
                                <p>{reco.author_name}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default BookDetail;
