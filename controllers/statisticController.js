const pool = require('../config/db');
const moment = require('moment');

const getTopSpending = async (req, res) => {
    const userId = req.user.userId;
    const { filter } = req.query;

    let startDate, endDate;

    switch (filter) {
        case 'last-7-days':
            startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
            endDate = moment().format('YYYY-MM-DD');
            break;
        case 'last-30-days':
            startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
            endDate = moment().format('YYYY-MM-DD');
            break;
        case 'all-time':
        default:
            startDate = null;
            endDate = null;
            break;
    }

    let expenseQuery = `
        SELECT 
            e.category_id, c.name as category_name, SUM(e.amount) as total_amount
        FROM 
            expenses e
        JOIN 
            categories c ON e.category_id = c.id
        WHERE 
            e.user_uuid = $1`;

    const queryParams = [userId];

    if (startDate && endDate) {
        expenseQuery += ` AND e.date BETWEEN $2 AND $3`;
        queryParams.push(startDate, endDate);
    }

    expenseQuery += ` GROUP BY e.category_id, c.name ORDER BY total_amount DESC LIMIT 5`;

    try {
        const expenseResult = await pool.query(expenseQuery, queryParams);

        res.status(200).json({
            error: false,
            message: 'Top spending fetched successfully',
            data: expenseResult.rows.map(row => ({
                category_name: row.category_name,
                total_amount: parseInt(row.total_amount)
            }))
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

module.exports = {
    getTopSpending
};