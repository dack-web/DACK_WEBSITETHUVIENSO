import { useEffect, useState } from "react";
import { getBorrowHistoryAPI } from "../../services/api/api";
import { useAuth } from "../../contexts/authentication/AuthContext";
import "./BorrowHistory.css";

const BorrowHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const res = await getBorrowHistoryAPI({ user_id: user.id });
                if (res.success) {
                    setHistory(res.data);
                }
            } catch (error) {
                console.error("Fetch borrow history error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    if (loading) return <div className="history-loading"><i className="fa-solid fa-spinner fa-spin"></i> Loading Archive Records...</div>;

    return (
        <div className="history-wrapper">
            <header className="history-header">
                <h1>Borrowing History</h1>
                <p>A chronological record of your journeys through the library's collection.</p>
            </header>

            <div className="history-table-container">
                {history.length > 0 ? (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Book Title</th>
                                <th>Borrowed Date</th>
                                <th>Due Date</th>
                                <th>Returned Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr key={record.id}>
                                    <td className="book-cell">
                                        <div className="book-title-small">{record.book_title}</div>
                                    </td>
                                    <td>{formatDate(record.borrow_date)}</td>
                                    <td>{formatDate(record.due_date)}</td>
                                    <td>{record.return_date ? formatDate(record.return_date) : <span className="not-returned">Not returned</span>}</td>
                                    <td>
                                        <span className={`status-badge ${record.status}`}>
                                            {record.status === 'borrowed' ? 'In Progress' : 
                                             record.status === 'returned' ? 'Completed' : 'Overdue'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="history-empty">
                        <i className="fa-solid fa-scroll"></i>
                        <p>No borrowing history found. Start your journey by borrowing a book!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BorrowHistory;
