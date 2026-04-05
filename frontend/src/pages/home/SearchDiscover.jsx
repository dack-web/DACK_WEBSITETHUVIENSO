import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getBooksAPI, getCategoriesAPI, getAuthorsAPI, getRecommendedBooksAPI } from "../../services/api/api";
import { debounce } from "lodash";
import "./SearchDiscover.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

const SearchDiscover = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recoLoading, setRecoLoading] = useState(true);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedAuthor, setSelectedAuthor] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0,
    });

    // Fetch Initial Meta Data (Categories & Authors)
    useEffect(() => {
        const fetchMeta = async () => {
            const [catRes, authRes, recoRes] = await Promise.all([getCategoriesAPI(), getAuthorsAPI(), getRecommendedBooksAPI({ limit: 6 })]);
            if (catRes.success) setCategories(catRes.data);
            if (authRes.success) setAuthors(authRes.data);
            if (recoRes.success) setRecommendations(recoRes.data);
            setRecoLoading(false);
        };
        fetchMeta();
    }, []);

    // Main Fetch Function
    const fetchBooks = useCallback(async (params) => {
        setLoading(true);
        try {
            const res = await getBooksAPI({
                q: params.q,
                category_id: params.category_id,
                author_id: params.author_id,
                sort: params.sort,
                page: params.page,
                limit: 12,
            });
            if (res.success) {
                setBooks(res.data);
                setPagination(res.pagination);
            }
        } catch (error) {
            console.error("Fetch books error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced Search
    const debouncedFetch = useCallback(
        debounce((params) => fetchBooks(params), 500),
        [fetchBooks],
    );

    // Trigger fetch on filter change
    useEffect(() => {
        const params = {
            q: searchTerm,
            category_id: selectedCategory,
            author_id: selectedAuthor,
            sort: sortBy,
            page: pagination.page,
        };

        if (searchTerm) {
            debouncedFetch(params);
        } else {
            fetchBooks(params);
        }
    }, [searchTerm, selectedCategory, selectedAuthor, sortBy, pagination.page, fetchBooks, debouncedFetch]);

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedAuthor("");
        setSortBy("newest");
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    return (
        <div className="search-discover-wrapper">
            <div className="search-header-section">
                <h1>Discover Knowledge</h1>
                <p>Browse the curated archives and find your next intellectual pursuit.</p>

                <div className="main-search-container">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder="Search by title, author, or description..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm("")}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Recommendations Section */}
            {!searchTerm && !selectedCategory && !selectedAuthor && recommendations.length > 0 && (
                <div className="recommendations-section">
                    <div className="reco-header">
                        <h2>
                            <i className="fa-solid fa-star"></i> Recommended for You
                        </h2>
                        <p>Based on our latest curated collections</p>
                    </div>
                    <div className="reco-scroll-container">
                        {recommendations.map((reco) => (
                            <div key={reco.id} className="reco-card" onClick={() => navigate(`/books/${reco.id}`)}>
                                <div className="reco-cover">
                                    {reco.cover_image ? (
                                        <img src={`${BACKEND_URL}/uploads${reco.cover_image.replace("/uploads", "")}`} alt={reco.title} />
                                    ) : (
                                        <div className="reco-placeholder">
                                            <i className="fa-solid fa-book"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="reco-info">
                                    <h4>{reco.title}</h4>
                                    <p>{reco.author_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="discovery-layout">
                <aside className="filters-panel">
                    <div className="filters-header">
                        <h3>Filters</h3>
                        <button className="reset-link" onClick={resetFilters}>
                            Reset all
                        </button>
                    </div>

                    <div className="filter-group">
                        <label>Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Author</label>
                        <select
                            value={selectedAuthor}
                            onChange={(e) => {
                                setSelectedAuthor(e.target.value);
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                        >
                            <option value="">All Authors</option>
                            {authors.map((auth) => (
                                <option key={auth.id} value={auth.id}>
                                    {auth.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Sort By</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="title_az">Title (A-Z)</option>
                            <option value="title_za">Title (Z-A)</option>
                        </select>
                    </div>

                    <div className="stats-box">
                        <div className="stat-item">
                            <span>Total volumes</span>
                            <strong>{pagination.total}</strong>
                        </div>
                    </div>
                </aside>

                <main className="results-grid">
                    <div className="results-info">
                        {loading ? (
                            <span>Searching archives...</span>
                        ) : (
                            <span>
                                Found <b>{pagination.total}</b> results for your query
                            </span>
                        )}
                    </div>

                    {loading && books.length === 0 ? (
                        <div className="discovery-loader">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                        </div>
                    ) : books.length > 0 ? (
                        <div className="books-masonry">
                            {books.map((book) => (
                                <div key={book.id} className="discovery-card" onClick={() => navigate(`/books/${book.id}`)}>
                                    <div className="card-cover">
                                        {book.cover_image ? (
                                            <img src={`${BACKEND_URL}/uploads${book.cover_image.replace("/uploads", "")}`} alt={book.title} />
                                        ) : (
                                            <div className="cover-placeholder">
                                                <i className="fa-solid fa-book-open"></i>
                                            </div>
                                        )}
                                        <div className="card-overlay">
                                            <button className="view-detail-btn">
                                                <i className="fa-solid fa-eye"></i> View Details
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-info">
                                        <span className="category-tag">{book.category_name}</span>
                                        <h4>{book.title}</h4>
                                        <p className="author-name">by {book.author_name}</p>
                                        <div className="card-meta">
                                            <span>
                                                <i className="fa-regular fa-calendar"></i> {book.published_year}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-results">
                            <i className="fa-solid fa-book-skull"></i>
                            <h3>No matches found</h3>
                            <p>Try adjusting your search terms or filters to find what you're looking for.</p>
                            <button onClick={resetFilters}>Clear all filters</button>
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="pagination-controls">
                            <button disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>

                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <button key={i + 1} className={pagination.page === i + 1 ? "active" : ""} onClick={() => handlePageChange(i + 1)}>
                                    {i + 1}
                                </button>
                            ))}

                            <button disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SearchDiscover;
