const db = require("../config/db_config");

const getOverview = async (req, res) => {
    try {
        const queries = [
            "SELECT COUNT(*) AS total FROM books",
            "SELECT COUNT(*) AS total FROM borrows WHERE status = 'borrowed' AND return_date IS NULL",
            "SELECT COUNT(*) AS total FROM borrows WHERE due_date < CURDATE() AND return_date IS NULL",
            "SELECT COUNT(*) AS total FROM users WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())",
        ];

        const results = await Promise.all(queries.map((q) => db.query(q)));

        // Destructure cho dễ đọc
        const [books, borrowed, overdue, users] = results;

        const totalBooks = books?.[0]?.total || 0;
        const borrowedBooks = borrowed?.[0]?.total || 0;
        const overdueBooks = overdue?.[0]?.total || 0;
        const newMembers = users?.[0]?.total || 0;

        return res.status(200).json({
            success: true,
            data: {
                totalBooks,
                borrowedBooks,
                overdueBooks,
                newMembers,
            },
        });
    } catch (error) {
        console.error("Dashboard overview error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard overview",
            error: error.message,
        });
    }
};

const getRecentActivities = async (req, res) => {
    try {
        const activities = await db.query(`
            SELECT 
                CASE 
                    WHEN br.status = 'borrowed' THEN 'borrow'
                    WHEN br.status = 'returned' THEN 'return'
                    ELSE 'overdue'
                END as type,
                CONCAT(
                    CASE 
                        WHEN br.status = 'borrowed' THEN 'Book Borrowed: '
                        WHEN br.status = 'returned' THEN 'Book Returned: '
                        ELSE 'Book Overdue: '
                    END, b.title
                ) as title,
                u.name as user,
                br.borrow_date as time
            FROM borrows br
            JOIN books b ON br.book_id = b.id
            JOIN users u ON br.user_id = u.id
            ORDER BY br.created_at DESC
            LIMIT 5
        `);

        res.json({ success: true, data: activities });
    } catch (error) {
        console.error("🔥 Dashboard recent activities Error Details:", {
            message: error.message,
            stack: error.stack,
            sql: error.sql,
        });
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWeeklyActivity = async (req, res) => {
    try {
        const data = await db.query(`
            SELECT 
                DAYOFWEEK(borrow_date) as day,
                COUNT(*) as count
            FROM borrows
            WHERE borrow_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DAYOFWEEK(borrow_date)
            ORDER BY day
        `);

        // Map day number to name
        const dayNames = {
            1: "SUN",
            2: "MON",
            3: "TUE",
            4: "WED",
            5: "THU",
            6: "FRI",
            7: "SAT",
        };
        const formattedData = data.map((item) => ({
            day: dayNames[item.day],
            count: item.count,
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        console.error("🔥 Dashboard weekly activity Error Details:", {
            message: error.message,
            stack: error.stack,
            sql: error.sql,
        });
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getOverview, getRecentActivities, getWeeklyActivity };
