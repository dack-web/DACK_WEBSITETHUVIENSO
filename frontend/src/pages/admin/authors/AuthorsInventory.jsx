import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuthorsAPI, deleteAuthorAPI } from "../../../services/api/api";
import { toast } from "react-toastify";
import "./AuthorsInventory.css";

const AuthorsInventory = () => {
    const navigate = useNavigate();
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getAuthorsAPI();
            if (res.success) {
                setAuthors(res.data || []);
            } else {
                toast.error(res.message || "Không thể tải danh sách tác giả!");
            }
        } catch (error) {
            console.error("Error fetching authors:", error);
            toast.error("Lỗi khi kết nối server!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tác giả này?")) {
            try {
                const res = await deleteAuthorAPI(id);
                if (res.success) {
                    toast.success("Xóa tác giả thành công!");
                    fetchData();
                } else {
                    toast.error(res.message || "Không thể xóa tác giả!");
                }
            } catch (error) {
                toast.error("Lỗi khi xóa tác giả!");
            }
        }
    };

    const filteredAuthors = useMemo(() => {
        return (authors || []).filter(author => 
            author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            author.id.toString().includes(searchTerm)
        );
    }, [authors, searchTerm]);

    return (
        <div className="inventory-wrapper">
            <div className="breadcrumb-nav">
                <Link to="/admin/dashboard" className="breadcrumb-item">Dashboard</Link>
                <span className="breadcrumb-separator"><i className="fa-solid fa-chevron-right"></i></span>
                <span className="breadcrumb-item active">Authors Inventory</span>
            </div>

            <div className="inventory-container">
                <div className="inventory-header">
                    <div className="header-info">
                        <h1>Authors Management</h1>
                        <p>Maintain and organize the list of authors contributing to your library's archive. Manage names and track individual profiles.</p>
                    </div>
                    <button className="add-btn" onClick={() => navigate("add")}>
                        <i className="fa-solid fa-plus"></i> Add New Author
                    </button>
                </div>

                <div className="inventory-filters">
                    <div className="search-box">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            placeholder="Search authors by name or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="inventory-table-wrapper">
                    {loading ? (
                        <div className="loading-state">
                            <i className="fa-solid fa-spinner fa-spin"></i> Loading authors...
                        </div>
                    ) : (
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>AUTHOR NAME</th>
                                    <th>CREATED AT</th>
                                    <th className="actions-header">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAuthors.length > 0 ? (
                                    filteredAuthors.map(author => (
                                        <tr key={author.id}>
                                            <td className="id-cell">#{author.id.toString().padStart(3, '0')}</td>
                                            <td>
                                                <div className="author-name-cell">
                                                    <div className="author-avatar">
                                                        {author.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="name-text">{author.name}</span>
                                                </div>
                                            </td>
                                            <td className="date-cell">{new Date(author.created_at || Date.now()).toLocaleDateString('vi-VN')}</td>
                                            <td className="actions-cell">
                                                <button className="icon-btn edit" onClick={() => navigate(`edit/${author.id}`)}>
                                                    <i className="fa-solid fa-pencil"></i>
                                                </button>
                                                <button className="icon-btn delete" onClick={() => handleDelete(author.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-table-cell">
                                            No authors found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="inventory-footer-info">
                    Showing {filteredAuthors.length} of {authors.length} authors
                </div>
            </div>
        </div>
    );
};

export default AuthorsInventory;
