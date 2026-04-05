import { useState, useEffect } from "react";
import { 
    borrowBookAPI, 
    returnBookAPI, 
    getBorrowHistoryAPI, 
    getMemberByIdAPI, 
    getBookStatusAPI 
} from "../../../services/api/api";
import { toast } from "react-toastify";
import "./Circulation.css";

const Circulation = () => {
    // Shared State
    const [activeTab, setActiveTab] = useState("checkout"); // checkout | return
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Checkout State
    const [memberId, setMemberId] = useState("");
    const [memberInfo, setMemberInfo] = useState(null);
    const [bookIdInput, setBookIdInput] = useState("");
    const [pendingItems, setPendingItems] = useState([]);
    const [borrowDays, setBorrowDays] = useState(14);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Return State
    const [returnQuery, setReturnQuery] = useState("");
    const [activeBorrow, setActiveBorrow] = useState(null);
    const [isReturning, setIsReturning] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await getBorrowHistoryAPI();
            if (res.success) {
                setHistory(res.data || []);
            }
        } catch (error) {
            console.error("Fetch history error:", error);
            toast.error("Không thể tải lịch sử lưu thông");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleIdentifyMember = async () => {
        if (!memberId) return;
        try {
            const res = await getMemberByIdAPI(memberId);
            if (res.success) {
                setMemberInfo(res.data);
            } else {
                setMemberInfo(null);
                toast.error("Không tìm thấy thành viên");
            }
        } catch (error) {
            setMemberInfo(null);
            toast.error("Lỗi khi tìm thành viên");
        }
    };

    const handleAddPendingItem = async (e) => {
        e.preventDefault();
        if (!bookIdInput) return;

        // Check if already in list
        if (pendingItems.find(item => item.id === bookIdInput || item.isbn === bookIdInput)) {
            toast.warning("Sách này đã có trong danh sách chờ");
            return;
        }

        try {
            const res = await getBookStatusAPI(bookIdInput);
            if (res.success) {
                const bookData = res.data.book;
                const status = res.data.status;

                if (status !== "available") {
                    toast.error(`Sách này hiện đang ${status === 'borrowed' ? 'được mượn' : 'quá hạn'}`);
                    return;
                }

                setPendingItems([...pendingItems, {
                    id: bookData.id,
                    title: bookData.title,
                    isbn: bookData.isbn,
                    cover_image: bookData.cover_image
                }]);
                setBookIdInput("");
            } else {
                toast.error("Không tìm thấy sách");
            }
        } catch (error) {
            toast.error("Lỗi khi tìm sách");
        }
    };

    const handleRemovePendingItem = (id) => {
        setPendingItems(pendingItems.filter(item => item.id !== id));
    };

    const handleCheckOut = async () => {
        if (!memberId) {
            toast.warning("Vui lòng nhập ID thành viên");
            return;
        }
        if (pendingItems.length === 0) {
            toast.warning("Danh sách chờ trống");
            return;
        }

        setIsCheckingOut(true);
        let successCount = 0;
        let failCount = 0;

        for (const item of pendingItems) {
            try {
                const res = await borrowBookAPI({
                    user_id: memberId,
                    book_id: item.id,
                    borrow_days: borrowDays
                });
                if (res.success) successCount++;
                else failCount++;
            } catch (error) {
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Đã mượn thành công ${successCount} sách!`);
            setPendingItems([]);
            fetchHistory();
        }
        if (failCount > 0) {
            toast.error(`Thất bại ${failCount} sách.`);
        }
        setIsCheckingOut(false);
    };

    const handleFindBorrowRecord = async (e) => {
        e.preventDefault();
        if (!returnQuery) return;

        try {
            const res = await getBookStatusAPI(returnQuery);
            if (res.success && res.data.activeBorrow) {
                setActiveBorrow(res.data);
            } else {
                setActiveBorrow(null);
                toast.info("Không có phiếu mượn đang hoạt động cho sách này");
            }
        } catch (error) {
            setActiveBorrow(null);
            toast.error("Lỗi khi tìm phiếu mượn");
        }
    };

    const handleConfirmReturn = async () => {
        if (!activeBorrow) return;

        setIsReturning(true);
        try {
            const res = await returnBookAPI(activeBorrow.activeBorrow.id);
            if (res.success) {
                toast.success("Trả sách thành công!");
                setActiveBorrow(null);
                setReturnQuery("");
                fetchHistory();
            } else {
                toast.error(res.message || "Lỗi trả sách");
            }
        } catch (error) {
            toast.error("Lỗi hệ thống khi trả sách");
        } finally {
            setIsReturning(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return "";
        if (imagePath.startsWith("http")) return imagePath;
        const baseURL = import.meta.env.VITE_BACKEND_URL;
        return `${baseURL}${imagePath}`;
    };

    return (
        <div className="circulation-wrapper">
            <div className="circulation-container-v2">
                <header className="circulation-header-v2">
                    <div className="header-top-v2">
                        <div className="title-section">
                            <span className="nav-hint">ADMIN PORTAL</span>
                            <h1>Circulation Desk</h1>
                            <p className="subtitle-v2">Manage the pulse of the library. Toggle between checkout and return processes with precision and ease.</p>
                        </div>
                    </div>

                    <div className="tab-switcher-v2">
                        <button 
                            className={`tab-btn-v2 ${activeTab === 'checkout' ? 'active' : ''}`}
                            onClick={() => setActiveTab('checkout')}
                        >
                            Check-out
                        </button>
                        <button 
                            className={`tab-btn-v2 ${activeTab === 'return' ? 'active' : ''}`}
                            onClick={() => setActiveTab('return')}
                        >
                            Returns
                        </button>
                    </div>
                </header>

                <div className="circulation-grid-v2">
                    {/* Left Column: Data Entry */}
                    <div className="entry-column">
                        {activeTab === 'checkout' ? (
                            <section className="entry-section">
                                <h2 className="section-title-v2">Issue New Materials</h2>
                                <p className="section-desc-v2">Identify the member and scan items to build the transaction.</p>

                                <div className="data-group">
                                    <label className="label-v2">MEMBER IDENTIFICATION</label>
                                    <div className="input-with-icon-v2">
                                        <i className="fa-solid fa-user-plus"></i>
                                        <input 
                                            type="text" 
                                            placeholder="Enter Member ID" 
                                            value={memberId}
                                            onChange={(e) => setMemberId(e.target.value)}
                                            onBlur={handleIdentifyMember}
                                            onKeyDown={(e) => e.key === 'Enter' && handleIdentifyMember()}
                                        />
                                    </div>
                                    {memberInfo && (
                                        <div className="selected-member-card">
                                            <div className="member-avatar">
                                                <img src={getFullImageUrl(memberInfo.avatar)} alt="" onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
                                            </div>
                                            <div className="member-info-v2">
                                                <span className="member-name-v2">{memberInfo.name}</span>
                                                <span className="member-id-v2">Email: {memberInfo.email}</span>
                                            </div>
                                            <span className="account-status-v2">
                                                <i className="fa-solid fa-circle-check"></i> Account ID: {memberInfo.id}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="data-group">
                                    <label className="label-v2">MATERIAL SCAN (ISBN / BOOK ID)</label>
                                    <form className="material-input-row" onSubmit={handleAddPendingItem}>
                                        <div className="input-with-icon-v2 flex-1">
                                            <i className="fa-solid fa-barcode"></i>
                                            <input 
                                                type="text" 
                                                placeholder="Scan or type ISBN..." 
                                                value={bookIdInput}
                                                onChange={(e) => setBookIdInput(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="add-item-btn-v2">Add Item</button>
                                    </form>
                                </div>

                                <div className="pending-items-section">
                                    <label className="label-v2">PENDING CHECKOUT ({pendingItems.length} ITEMS)</label>
                                    <div className="pending-list">
                                        {pendingItems.length > 0 ? pendingItems.map(item => (
                                            <div className="pending-item" key={item.id}>
                                                <div className="item-thumb">
                                                    <img src={getFullImageUrl(item.cover_image)} alt="" onError={(e) => e.target.src = "https://via.placeholder.com/40x60?text=Book"} />
                                                </div>
                                                <div className="item-meta">
                                                    <span className="item-title-v2">{item.title}</span>
                                                    <span className="item-id-v2">ISBN {item.isbn} | ID: {item.id}</span>
                                                </div>
                                                <button className="remove-item-btn" onClick={() => handleRemovePendingItem(item.id)}>
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        )) : (
                                            <p className="empty-pending">No items added yet</p>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    className="confirm-checkout-btn-v2" 
                                    onClick={handleCheckOut} 
                                    disabled={isCheckingOut || pendingItems.length === 0 || !memberId}
                                >
                                    {isCheckingOut ? <i className="fa-solid fa-spinner fa-spin"></i> : "Confirm Checkout"}
                                </button>
                            </section>
                        ) : (
                            <section className="entry-section">
                                <h2 className="section-title-v2">Return Materials</h2>
                                <p className="section-desc-v2">Scan materials or enter Borrow ID to process returns and calculate fines.</p>

                                <div className="data-group">
                                    <label className="label-v2">IDENTIFY MATERIAL</label>
                                    <form className="material-input-row" onSubmit={handleFindBorrowRecord}>
                                        <div className="input-with-icon-v2 flex-1">
                                            <i className="fa-solid fa-magnifying-glass"></i>
                                            <input 
                                                type="text" 
                                                placeholder="Scan ISBN, Book ID, or Borrow ID" 
                                                value={returnQuery}
                                                onChange={(e) => setReturnQuery(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="add-item-btn-v2">Search</button>
                                    </form>
                                </div>

                                {activeBorrow && (
                                    <div className="return-details-card">
                                        <div className="return-book-header">
                                            <img src={getFullImageUrl(activeBorrow.book.cover_image)} alt="" className="return-book-img" onError={(e) => e.target.src = "https://via.placeholder.com/100x150?text=Book"} />
                                            <div className="return-book-info">
                                                <h3>{activeBorrow.book.title}</h3>
                                                <p>ISBN: {activeBorrow.book.isbn}</p>
                                            </div>
                                        </div>
                                        <div className="return-borrow-meta">
                                            <div className="meta-item">
                                                <span className="meta-label">Borrower</span>
                                                <span className="meta-value">{activeBorrow.activeBorrow.borrower_name}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">Due Date</span>
                                                <span className="meta-value">{formatDate(activeBorrow.activeBorrow.due_date)}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">Status</span>
                                                <span className={`meta-value status-${activeBorrow.status}`}>{activeBorrow.status.toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <button 
                                            className="confirm-return-btn-v2" 
                                            onClick={handleConfirmReturn}
                                            disabled={isReturning}
                                        >
                                            {isReturning ? <i className="fa-solid fa-spinner fa-spin"></i> : "Process Return"}
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Right Column: Activity Log */}
                    <div className="activity-column">
                        <section className="activity-section">
                            <div className="activity-header-v2">
                                <h2 className="section-title-v2">Recent Activity</h2>
                                <span className="live-dot"></span>
                            </div>

                            <div className="activity-feed">
                                {loadingHistory ? (
                                    <div className="loading-feed">Loading activity...</div>
                                ) : (
                                    history.slice(0, 8).map((record) => (
                                        <div className="activity-card-v2" key={record.id}>
                                            <div className="activity-type-badge">
                                                <span className={`badge-v2 ${record.status === 'borrowed' ? 'checkout' : 'return'}`}>
                                                    {record.status === 'borrowed' ? 'CHECKOUT' : 'RETURN'}
                                                </span>
                                                <span className="activity-time">{formatDate(record.borrow_date)}</span>
                                            </div>
                                            <div className="activity-details">
                                                <h4 className="activity-title-v2">{record.book_title}</h4>
                                                <p className="activity-member-v2">Processed for <strong>{record.user_name}</strong></p>
                                                <span className="activity-due">Due: {formatDate(record.due_date)}</span>
                                            </div>
                                            {record.status === 'late' && (
                                                <div className="late-notice-v2">
                                                    <i className="fa-solid fa-circle-exclamation"></i>
                                                    LATE RETURN
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <button className="view-audit-log-btn" onClick={fetchHistory}>Refresh Activity</button>
                        </section>
                    </div>
                </div>
            </div>

            <footer className="admin-footer-v2">
                <div className="footer-content">
                    <span className="copyright">© 2024 The Scholarly Curator. All rights reserved.</span>
                    <div className="footer-links">
                        <a href="#">System Status</a>
                        <a href="#">API Documentation</a>
                        <a href="#">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Circulation;
