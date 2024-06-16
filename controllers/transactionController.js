const pool = require('../config/db');
const moment = require('moment');

const getTransactions = async (req, res) => {
    const userId = req.user.userId;
    const { type, startDate, endDate } = req.query;

    let incomeQuery = `
        SELECT 
            i.id, i.date, i.title, i.amount, null as category_name, 'income' as type
        FROM 
            incomes i
        WHERE 
            i.user_uuid = $1`;

    let expenseQuery = `
        SELECT 
            e.id, e.date, e.title, e.amount, c.name as category_name, 'expense' as type
        FROM 
            expenses e
        JOIN 
            categories c ON e.category_id = c.id
        WHERE 
            e.user_uuid = $1`;

    const queryParams = [userId];

    if (startDate) {
        incomeQuery += ` AND i.date >= $2`;
        expenseQuery += ` AND e.date >= $2`;
        queryParams.push(startDate);
    }

    if (endDate) {
        incomeQuery += ` AND i.date <= $3`;
        expenseQuery += ` AND e.date <= $3`;
        queryParams.push(endDate);
    }

    try {
        let transactions = [];
        if (!type || type === 'income') {
            const incomeResult = await pool.query(incomeQuery, queryParams);
            transactions = [...transactions, ...incomeResult.rows];
        }

        if (!type || type === 'expense') {
            const expenseResult = await pool.query(expenseQuery, queryParams);
            transactions = [...transactions, ...expenseResult.rows];
        }

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            error: false,
            message: 'Transactions fetched successfully',
            data: transactions.map(transaction => ({
                ...transaction,
                amount: parseInt(transaction.amount),
                date: moment(transaction.date).format('YYYY-MM-DD')
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
    getTransactions,
};