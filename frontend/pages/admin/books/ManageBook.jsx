import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuthorsAPI, getCategoriesAPI, addBookAPI, updateBookAPI, getBooksAPI } from "../../../services/api/api";
import { toast } from "react-toastify";
import "./ManageBook.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const ManageBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formValues, setFormValues] = useState({
        title: "",
        author_id: "",
        category_id: "",
        published_year: "",
        isbn: "",
        description: "",
        cover_image: null,
        pdf_file: null
    });

    const [previews, setPreviews] = useState({
        cover: null
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [authRes, catRes] = await Promise.all([
                    getAuthorsAPI(),
                    getCategoriesAPI()
                ]);
                if (authRes.success) setAuthors(authRes.data || []);
                if (catRes.success) setCategories(catRes.data || []);

                if (isEditing) {
                    // Fetch specific book data
                    const booksRes = await getBooksAPI();
                    if (booksRes.success) {
                        const book = booksRes.data.find(b => b.id === parseInt(id));
                        if (book) {
                            setFormValues({
                                title: book.title || "",
                                author_id: book.author_id || "",
                                category_id: book.category_id || "",
                                published_year: book.published_year || "",
                                isbn: book.isbn || "",
                                description: book.description || "",
                                cover_image: null,
                                pdf_file: null
                            });
                            if (book.cover_image) {
                                setPreviews({ cover: `${BACKEND_URL}${book.cover_image}` });
                            }
                        } else {
                            toast.error("Không tìm thấy sách!");
                            navigate("/admin/books");
                        }
                    }
                }
            } catch (error) {
                console.error("Fetch data error:", error);
                toast.error("Lỗi khi tải dữ liệu!");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, isEditing, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        setFormValues(prev => ({ ...prev, [name]: file }));

        if (name === "cover_image" && file) {
            setPreviews({ cover: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        const formData = new FormData();
        formData.append("title", formValues.title);
        formData.append("author_id", formValues.author_id);
        formData.append("category_id", formValues.category_id);
        formData.append("published_year", formValues.published_year);
        formData.append("isbn", formValues.isbn);
        formData.append("description", formValues.description);
        
        if (formValues.cover_image) formData.append("cover_image", formValues.cover_image);
        if (formValues.pdf_file) formData.append("pdf_file", formValues.pdf_file);

        try {
            let res;
            if (isEditing) {
                res = await updateBookAPI(id, formData);
            } else {
                res = await addBookAPI(formData);
            }

            if (res.success) {
                toast.success(isEditing ? "Cập nhật thành công!" : "Thêm mới thành công!");
                navigate("/admin/books");
            } else {
                toast.error(res.message || "Đã xảy ra lỗi!");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Lỗi khi kết nối server!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="manage-book-loading">
                <i className="fa-solid fa-spinner fa-spin"></i> Loading form...
            </div>
        );
    }

    return (
        <div className="manage-book-wrapper">
            <div className="breadcrumb-nav">
                <Link to="/admin/dashboard" className="breadcrumb-item">Dashboard</Link>
                <span className="breadcrumb-separator"><i className="fa-solid fa-chevron-right"></i></span>
                <Link to="/admin/books" className="breadcrumb-item">Books Inventory</Link>
                <span className="breadcrumb-separator"><i className="fa-solid fa-chevron-right"></i></span>
                <span className="breadcrumb-item active">{isEditing ? "Edit Book" : "Add New Book"}</span>
            </div>

            <div className="manage-book-container">
                <div className="manage-header">
                    <div className="header-text">
                        <h1>{isEditing ? "Cập nhật thông tin sách" : "Thêm sách mới vào kho"}</h1>
                        <p>Điền đầy đủ thông tin bên dưới để {isEditing ? "cập nhật" : "lưu trữ"} sách vào hệ thống Archivist Pro.</p>
                    </div>
                    <button className="back-btn" onClick={() => navigate("/admin/books")}>
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="manage-form">
                    <div className="form-main-content">
                        <section className="form-section">
                            <h3 className="section-title">Thông tin cơ bản</h3>
                            <div className="form-group">
                                <label>Tên sách <span className="required">*</span></label>
                                <input 
                                    name="title" 
                                    value={formValues.title} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập tiêu đề sách..."
                                    required 
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tác giả <span className="required">*</span></label>
                                    <select name="author_id" value={formValues.author_id} onChange={handleInputChange} required>
                                        <option value="">Chọn tác giả</option>
                                        {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Danh mục <span className="required">*</span></label>
                                    <select name="category_id" value={formValues.category_id} onChange={handleInputChange} required>
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Năm xuất bản</label>
                                    <input 
                                        type="number" 
                                        name="published_year" 
                                        value={formValues.published_year} 
                                        onChange={handleInputChange} 
                                        placeholder="VD: 2024"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mã ISBN</label>
                                    <input 
                                        type="text" 
                                        name="isbn" 
                                        value={formValues.isbn} 
                                        onChange={handleInputChange} 
                                        placeholder="VD: 978-3-16-148410-0"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Mô tả chi tiết</label>
                                <textarea 
                                    name="description" 
                                    value={formValues.description} 
                                    onChange={handleInputChange} 
                                    rows="6"
                                    placeholder="Viết vài dòng giới thiệu về cuốn sách..."
                                ></textarea>
                            </div>
                        </section>

                        <section className="form-section">
                            <h3 className="section-title">Tệp đính kèm</h3>
                            <div className="upload-grid">
                                <div className="upload-item">
                                    <label>Ảnh bìa (Cover Image)</label>
                                    <div className="image-upload-wrapper">
                                        <div className="preview-box">
                                            {previews.cover ? (
                                                <img src={previews.cover} alt="Preview" />
                                            ) : (
                                                <i className="fa-solid fa-image"></i>
                                            )}
                                        </div>
                                        <div className="upload-controls">
                                            <input type="file" id="cover_image" name="cover_image" onChange={handleFileChange} accept="image/*" hidden />
                                            <label htmlFor="cover_image" className="upload-trigger">
                                                <i className="fa-solid fa-cloud-arrow-up"></i> Chọn ảnh
                                            </label>
                                            <p className="upload-hint">PNG, JPG tối đa 2MB</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="upload-item">
                                    <label>Tệp nội dung (PDF)</label>
                                    <div className="pdf-upload-wrapper">
                                        <input type="file" id="pdf_file" name="pdf_file" onChange={handleFileChange} accept="application/pdf" hidden />
                                        <label htmlFor="pdf_file" className={`pdf-trigger ${formValues.pdf_file ? 'has-file' : ''}`}>
                                            <i className={`fa-solid ${formValues.pdf_file ? 'fa-file-circle-check' : 'fa-file-pdf'}`}></i>
                                            <span>{formValues.pdf_file ? formValues.pdf_file.name : "Kéo thả hoặc chọn tệp PDF"}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate("/admin/books")}>Hủy bỏ</button>
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? (
                                <><i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</>
                            ) : (
                                <><i className="fa-solid fa-save"></i> {isEditing ? "Lưu thay đổi" : "Lưu vào kho"}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageBook;
