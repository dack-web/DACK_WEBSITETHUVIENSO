import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getBooksAPI, getAuthorsAPI, getCategoriesAPI, deleteBookAPI } from "../../../services/api/api";
import { toast } from "react-toastify";
import "./BooksInventory.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const BooksInventory = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedAuthor, setSelectedAuthor] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [booksRes, authorsRes, categoriesRes] = await Promise.all([
                getBooksAPI(),
                getAuthorsAPI(),
                getCategoriesAPI()
            ]);

            if (booksRes.success) setBooks(booksRes.data || []);
            if (authorsRes.success) setAuthors(authorsRes.data || []);
            if (categoriesRes.success) setCategories(categoriesRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Không thể tải dữ liệu!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này?")) {
            try {
                const res = await deleteBookAPI(id);
                if (res.success) {
                    toast.success("Xóa sách thành công!");
                    fetchData();
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Lỗi khi xóa sách!");
            }
        }
    };

    const filteredBooks = useMemo(() => {
        return (books || []).filter(book => {
            const title = book.title || "";
            const authorName = book.author_name || "";
            const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 authorName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "" || book.category_id === parseInt(selectedCategory);
            const matchesAuthor = selectedAuthor === "" || book.author_id === parseInt(selectedAuthor);
            
            return matchesSearch && matchesCategory && matchesAuthor;
        });
    }, [books, searchTerm, selectedCategory, selectedAuthor]);

    return (
        <div className="admin-inventory-wrapper">
            <div className="admin-inventory-container">
                <header className="admin-inventory-header">
                    <div className="breadcrumb-v2">
                        <span>ADMIN PORTAL</span>
                        <i className="fa-solid fa-chevron-right"></i>
                        <span>MAIN BRANCH</span>
                    </div>
                    
                    <div className="header-main-v2">
                        <div className="title-area">
                            <h1>Books Inventory</h1>
                            <p className="subtitle-v2">Manage and curate your library's collection. Add new materials, track status, and maintain catalog accuracy.</p>
                        </div>
                        <button className="add-book-primary-btn" onClick={() => navigate("add")}>
                            <i className="fa-solid fa-plus"></i> Add New Book
                        </button>
                    </div>
                </header>

                <div className="inventory-control-bar">
                    <div className="search-box-v2">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            placeholder="Search by title, author, or ISBN..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-dropdowns">
                        <select 
                            className="inventory-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select 
                            className="inventory-select"
                            value={selectedAuthor}
                            onChange={(e) => setSelectedAuthor(e.target.value)}
                        >
                            <option value="">All Authors</option>
                            {authors.map(auth => (
                                <option key={auth.id} value={auth.id}>{auth.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="inventory-table-container">
                    {loading ? (
                        <div className="loading-overlay">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <span>Fetching Collection Data...</span>
                        </div>
                    ) : (
                        <table className="inventory-table-v2">
                            <thead>
                                <tr>
                                    <th>BOOK TITLE</th>
                                    <th>AUTHOR</th>
                                    <th>CATEGORY</th>
                                    <th>ISBN</th>
                                    <th>STATUS</th>
                                    <th className="text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBooks.length > 0 ? (
                                    filteredBooks.map(book => (
                                        <tr key={book.id}>
                                            <td className="book-title-cell">
                                                <div className="book-info-v2">
                                                    <div className="book-thumb-mini">
                                                        {book.cover_image ? (
                                                            <img 
                                                                src={`${BACKEND_URL}${book.cover_image}`} 
                                                                alt={book.title} 
                                                                onError={(e) => {
                                                                    // Fallback to absolute backend URL if relative fails
                                                                    if (!e.target.src.includes("/api/uploads")) {
                                                                        e.target.src = `${BACKEND_URL.replace('/api', '')}/api${book.cover_image}`;
                                                                    } else {
                                                                        e.target.src = "https://placehold.co/40x56/1e293b/white?text=BK";
                                                                    }
                                                                    e.target.onerror = null;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="placeholder-thumb">BK</div>
                                                        )}
                                                    </div>
                                                    <div className="title-meta-v2">
                                                        <span className="main-title">{book.title}</span>
                                                        <span className="sub-id">SYSTEM ID: {book.id.toString().padStart(4, '0')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{book.author_name || "N/A"}</td>
                                            <td>
                                                <span className="category-tag-v2">{book.category_name || "General"}</span>
                                            </td>
                                            <td><code className="isbn-code">{book.isbn || "---"}</code></td>
                                            <td>
                                                <span className={`status-badge-v3 ${book.status === 'borrowed' ? 'checked-out' : 'available'}`}>
                                                    <i className={`fa-solid ${book.status === 'borrowed' ? 'fa-circle-dot' : 'fa-circle-check'}`}></i>
                                                    {book.status === 'borrowed' ? 'Checked Out' : 'Available'}
                                                </span>
                                            </td>
                                            <td className="text-right action-cell">
                                                <button className="action-btn edit" onClick={() => navigate(`edit/${book.id}`)} title="Edit">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(book.id)} title="Delete">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-table-state">
                                            No materials found matching your current search parameters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <footer className="inventory-footer-v2">
                    <span className="results-info">Showing <strong>{filteredBooks.length}</strong> to <strong>{books.length}</strong> results</span>
                    <div className="pagination-v3">
                        <button className="pag-btn"><i className="fa-solid fa-chevron-left"></i></button>
                        <button className="pag-num active">1</button>
                        <button className="pag-num">2</button>
                        <button className="pag-num">3</button>
                        <button className="pag-btn"><i className="fa-solid fa-chevron-right"></i></button>
                    </div>
                </footer>
            </div>

            <footer className="admin-bottom-footer">
                <div className="footer-content">
                    <span className="copyright">© 2024 The Scholarly Curator. Centralized Library Management.</span>
                    <div className="footer-links">
                        <a href="#">System Help</a>
                        <a href="#">Policy Manual</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BooksInventory;
