import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCategoriesAPI, deleteCategoryAPI } from "../../../services/api/api";
import { toast } from "react-toastify";
import "./CategoriesInventory.css";

const CategoriesInventory = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getCategoriesAPI();
            if (res.success) {
                setCategories(res.data || []);
            } else {
                toast.error(res.message || "Không thể tải danh sách danh mục!");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Lỗi khi kết nối server!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                const res = await deleteCategoryAPI(id);
                if (res.success) {
                    toast.success("Xóa danh mục thành công!");
                    fetchData();
                } else {
                    toast.error(res.message || "Không thể xóa danh mục!");
                }
            } catch (error) {
                toast.error("Lỗi khi xóa danh mục!");
            }
        }
    };

    const filteredCategories = useMemo(() => {
        return (categories || []).filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.id.toString().includes(searchTerm)
        );
    }, [categories, searchTerm]);

    return (
        <div className="inventory-wrapper">
            <div className="breadcrumb-nav">
                <Link to="/admin/dashboard" className="breadcrumb-item">Dashboard</Link>
                <span className="breadcrumb-separator"><i className="fa-solid fa-chevron-right"></i></span>
                <span className="breadcrumb-item active">Categories Inventory</span>
            </div>

            <div className="inventory-container">
                <div className="inventory-header">
                    <div className="header-info">
                        <h1>Categories Management</h1>
                        <p>Classify and organize your library's collection. Create categories like "Philosophy", "Science Fiction", or "Historical Research" to help users find books faster.</p>
                    </div>
                    <button className="add-btn" onClick={() => navigate("add")}>
                        <i className="fa-solid fa-plus"></i> Add New Category
                    </button>
                </div>

                <div className="inventory-filters">
                    <div className="search-box">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            placeholder="Search categories by name or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="inventory-table-wrapper">
                    {loading ? (
                        <div className="loading-state">
                            <i className="fa-solid fa-spinner fa-spin"></i> Loading categories...
                        </div>
                    ) : (
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>CATEGORY NAME</th>
                                    <th>DESCRIPTION</th>
                                    <th className="actions-header">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(cat => (
                                        <tr key={cat.id}>
                                            <td className="id-cell">#{cat.id.toString().padStart(3, '0')}</td>
                                            <td>
                                                <div className="category-name-cell">
                                                    <span className={`category-dot dot-${cat.name.length % 5}`}></span>
                                                    <span className="name-text">{cat.name}</span>
                                                </div>
                                            </td>
                                            <td className="desc-cell text-truncate">Sách thuộc chủ đề {cat.name}</td>
                                            <td className="actions-cell">
                                                <button className="icon-btn edit" onClick={() => navigate(`edit/${cat.id}`)}>
                                                    <i className="fa-solid fa-pencil"></i>
                                                </button>
                                                <button className="icon-btn delete" onClick={() => handleDelete(cat.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-table-cell">
                                            No categories found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="inventory-footer-info">
                    Showing {filteredCategories.length} of {categories.length} categories
                </div>
            </div>
        </div>
    );
};

export default CategoriesInventory;
