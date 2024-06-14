const moment = require('moment');
const pool = require('../config/db');

const getExpenses = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query('SELECT * FROM expenses WHERE user_uuid = $1 ORDER BY date DESC', [userId]);
        const expenses = result.rows.map(expense => ({
            id: expense.id,
            date: moment(expense.date).format('YYYY-MM-DD'),
            title: expense.title,
            category_id: expense.category_id,
            amount: parseInt(expense.amount)
        }));
        res.status(200).json({
            error: false,
            message: 'Expenses fetched successfully',
            data: expenses
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const getMonthlyExpenses = async (req, res) => {
    const userId = req.user.userId;
    const { year, month } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM expenses WHERE user_uuid = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3 ORDER BY date DESC',
            [userId, year, month]
        );
        
        const expenses = result.rows.map(expense => ({
            id: expense.id,
            date: moment(expense.date).format('YYYY-MM-DD'),
            title: expense.title,
            category_id: expense.category_id,
            amount: parseInt(expense.amount)
        }));

        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        res.status(200).json({
            error: false,
            message: 'Monthly expenses fetched successfully',
            data: expenses,
            total_amount: totalAmount
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

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
        const categoryCheck = await pool.query('SELECT * FROM categories WHERE id = $1', [category_id]);
        if (categoryCheck.rows.length === 0) {
            return res.status(400).json({
                error: true,
                message: 'Invalid category_id'
            });
        }

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
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const updateExpense = async (req, res) => {
    const { id } = req.params;
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
        const categoryCheck = await pool.query('SELECT * FROM categories WHERE id = $1', [category_id]);
        if (categoryCheck.rows.length === 0) {
            return res.status(400).json({
                error: true,
                message: 'Invalid category_id'
            });
        }

        const result = await pool.query(
            'UPDATE expenses SET date = $1, title = $2, category_id = $3, amount = $4 WHERE id = $5 AND user_uuid = $6 RETURNING *',
            [formattedDate.format('YYYY-MM-DD'), title, category_id, amount, id, userId]
        );
        if (result.rows.length > 0) {
            const expense = result.rows[0];
            res.status(200).json({
                error: false,
                message: 'Expense updated successfully',
                data: {
                    id: expense.id,
                    date: moment(expense.date).format('YYYY-MM-DD'),
                    title: expense.title,
                    category_id: expense.category_id,
                    amount: parseInt(expense.amount)
                }
            });
        } else {
            res.status(404).json({
                error: true,
                message: 'Expense not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const result = await pool.query('DELETE FROM expenses WHERE id = $1 AND user_uuid = $2 RETURNING *', [id, userId]);
        if (result.rows.length > 0) {
            res.status(200).json({
                error: false,
                message: 'Expense deleted successfully'
            });
        } else {
            res.status(404).json({
                error: true,
                message: 'Expense not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

module.exports = {
    getExpenses,
    getMonthlyExpenses,
    createExpense,
    updateExpense,
    deleteExpense
};