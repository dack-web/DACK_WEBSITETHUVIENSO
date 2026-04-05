import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuthorsAPI, addAuthorAPI, updateAuthorAPI } from "../../../services/api/api";
import { toast } from "react-toastify";
import "./ManageAuthor.css";

const ManageAuthor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        if (isEditing) {
            const fetchAuthor = async () => {
                try {
                    const res = await getAuthorsAPI();
                    if (res.success) {
                        const author = res.data.find(a => a.id === parseInt(id));
                        if (author) {
                            setName(author.name);
                        } else {
                            toast.error("Không tìm thấy tác giả!");
                            navigate("/admin/authors");
                        }
                    }
                } catch (error) {
                    toast.error("Lỗi khi tải dữ liệu!");
                } finally {
                    setLoading(false);
                }
            };
            fetchAuthor();
        }
    }, [id, isEditing, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.warning("Vui lòng nhập tên tác giả!");
            return;
        }

        setSubmitting(true);
        try {
            let res;
            if (isEditing) {
                res = await updateAuthorAPI(id, { name });
            } else {
                res = await addAuthorAPI({ name });
            }

            if (res.success) {
                toast.success(isEditing ? "Cập nhật thành công!" : "Thêm mới thành công!");
                navigate("/admin/authors");
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
        return <div className="manage-author-loading"><i className="fa-solid fa-spinner fa-spin"></i> Loading...</div>;
    }

    return (
        <div className="manage-author-wrapper">
            <div className="breadcrumb-nav">
                <Link to="/admin/dashboard" className="breadcrumb-item">Dashboard</Link>
                <span className="breadcrumb-separator"><i className="fa-solid fa-chevron-right"></i></span>
                <Link to="/admin/authors" className="breadcrumb-item">Authors Inventory</Link>
                <span className="breadcrumb-separator"><i className="fa-solid fa-chevron-right"></i></span>
                <span className="breadcrumb-item active">{isEditing ? "Edit Author" : "Add New Author"}</span>
            </div>

            <div className="manage-author-container">
                <div className="manage-header">
                    <div className="header-text">
                        <h1>{isEditing ? "Cập nhật tác giả" : "Thêm tác giả mới"}</h1>
                        <p>Nhập thông tin tác giả để quản lý trong hệ thống thư viện.</p>
                    </div>
                    <button className="back-btn" onClick={() => navigate("/admin/authors")}>
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </button>
                </div>

                <div className="manage-card">
                    <form onSubmit={handleSubmit} className="manage-form">
                        <div className="form-group">
                            <label>Họ và tên tác giả <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <i className="fa-solid fa-user-pen"></i>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="VD: William Shakespeare, Ngô Tất Tố..."
                                    required 
                                />
                            </div>
                            <p className="input-hint">Tên tác giả sẽ được hiển thị trong phần thông tin sách.</p>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => navigate("/admin/authors")}>Hủy bỏ</button>
                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</>
                                ) : (
                                    <><i className="fa-solid fa-save"></i> {isEditing ? "Lưu thay đổi" : "Thêm tác giả"}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageAuthor;
