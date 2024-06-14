const moment = require('moment');
const pool = require('../config/db');

const createExpense = async (req, res) => {
    const { date, title, category_id, amount } = req.body;
    const userId = req.user.userId;

    if (!date || !title || !category_id || amount == null) {
        return res.status(400).json({
            error: true,
            message: 'All fields (date, title, category_id, amount) are required'
        });
    }

    if (!Number.isInteger(amount)) {
        return res.status(400).json({
            error: true,
            message: 'Amount must be an integer'
        });
    }

    const formattedDate = moment(date, 'YYYY-MM-DD', true);
    if (!formattedDate.isValid()) {
        return res.status(400).json({
            error: true,
            message: 'Date must be in the format YYYY-MM-DD'
        });
    }

    try {
        const result = await pool.query(
            'INSERT INTO expenses (date, title, category_id, amount, user_uuid) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [formattedDate.format('YYYY-MM-DD'), title, category_id, amount, userId]
        );
        const expense = result.rows[0];
        res.status(201).json({
            error: false,
            message: 'Expense added successfully',
            data: {
                id: expense.id,
                date: moment(expense.date).format('YYYY-MM-DD'),
                title: expense.title,
                category_id: expense.category_id,
                amount: parseInt(expense.amount)
            }
        });
    } catch (err) {
        if (err.code === '23503') {
            res.status(400).json({
                error: true,
                message: 'Invalid category_id'
            });
        } else {
            res.status(500).json({
                error: true,
                message: err.message
            });
        }
    }
};

module.exports = {
    createExpense
};