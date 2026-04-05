import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCategoriesAPI, addCategoryAPI, updateCategoryAPI } from "../../../services/api/api";
import { toast } from "react-toastify";
import "./ManageCategory.css";

const ManageCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        if (isEditing) {
            const fetchCategory = async () => {
                try {
                    const res = await getCategoriesAPI();
                    if (res.success) {
                        const category = res.data.find(c => c.id === parseInt(id));
                        if (category) {
                            setName(category.name);
                        } else {
                            toast.error("Không tìm thấy danh mục!");
                            navigate("/admin/categories");
                        }
                    }
                } catch (error) {
                    toast.error("Lỗi khi tải dữ liệu!");
                } finally {
                    setLoading(false);
                }
            };
            fetchCategory();
        }
    }, [id, isEditing, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.warning("Vui lòng nhập tên danh mục!");
            return;
        }

        setSubmitting(true);
        try {
            let res;
            if (isEditing) {
                res = await updateCategoryAPI(id, { name });
            } else {
                res = await addCategoryAPI({ name });
            }

            if (res.success) {
                toast.success(isEditing ? "Cập nhật thành công!" : "Thêm mới thành công!");
                navigate("/admin/categories");
            } else {
                toast.error(res.message || "Đã xảy ra lỗi!");
            }
        } catch (error) {
            toast.error("Lỗi khi kết nối server!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="manage-category-loading"><i className="fa-solid fa-spinner fa-spin"></i> Loading...</div>;
    }

    return (
        <div className="manage-category-wrapper">
            <div className="breadcrumb-nav">
                <Link to="/admin/dashboard" className="breadcrumb-item">Dashboard</Link>
                <span className="breadcrumb-separator"><i className="fa-solid fa-chevron-right"></i></span>
                <Link to="/admin/categories" className="breadcrumb-item">Categories Inventory</Link>
                <span className="breadcrumb-separator"><i className="fa-solid fa-chevron-right"></i></span>
                <span className="breadcrumb-item active">{isEditing ? "Edit Category" : "Add New Category"}</span>
            </div>

            <div className="manage-category-container">
                <div className="manage-header">
                    <div className="header-text">
                        <h1>{isEditing ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h1>
                        <p>Tạo hoặc chỉnh sửa danh mục để phân loại sách trong thư viện một cách khoa học.</p>
                    </div>
                    <button className="back-btn" onClick={() => navigate("/admin/categories")}>
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </button>
                </div>

                <div className="manage-card">
                    <form onSubmit={handleSubmit} className="manage-form">
                        <div className="form-group">
                            <label>Tên danh mục <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <i className="fa-solid fa-tags"></i>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="VD: Kinh tế, Lịch sử, Văn học..."
                                    required 
                                />
                            </div>
                            <p className="input-hint">Tên danh mục nên ngắn gọn và súc tích để người dùng dễ tìm kiếm.</p>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => navigate("/admin/categories")}>Hủy bỏ</button>
                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</>
                                ) : (
                                    <><i className="fa-solid fa-save"></i> {isEditing ? "Lưu thay đổi" : "Lưu danh mục"}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageCategory;
