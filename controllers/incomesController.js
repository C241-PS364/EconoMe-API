const moment = require('moment');
const pool = require('../config/db');

const getIncomeById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM incomes WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({
                error: false,
                message: 'Income fetched successfully',
                income: result.rows[0]
              });
        } else {
            res.status(404).json({ message: 'Income not found' });
        }
    } catch (err) {
        res.status(500).json({ error: true, err: err.message });
    }
};

const createIncome = async (req, res) => {
    const { date, title, amount } = req.body;
    const userId = req.user.userId;

    if (!date || !title || amount == null) {
        return res.status(400).json({
            error: true,
            message: 'All fields (date, title, amount) are required'
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
            'INSERT INTO incomes (date, title, amount, user_uuid) VALUES ($1, $2, $3, $4) RETURNING *',
            [formattedDate.format('YYYY-MM-DD'), title, amount, userId]
        );
        res.status(201).json({
            error: false,
            message: 'Income added successfully',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const updateIncome = async (req, res) => {
    const { id } = req.params;
    const { date, title, amount } = req.body;
    const userId = req.user.userId;

    if (!date || !title || amount == null) {
        return res.status(400).json({
            error: true,
            message: 'All fields (date, title, amount) are required'
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
            'UPDATE incomes SET date = $1, title = $2, amount = $3, user_uuid = $4 WHERE id = $5 RETURNING *',
            [formattedDate.format('YYYY-MM-DD'), title, amount, userId, id]
        );
        if (result.rows.length > 0) {
            res.status(200).json({
                error: false,
                message: 'Income updated successfully',
                data: result.rows[0]
            });
        } else {
            res.status(404).json({
                error: true,
                message: 'Income not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const deleteIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM incomes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Income deleted' });
        } else {
            res.status(404).json({ message: 'Income not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getIncomeById,
    createIncome,
    updateIncome,
    deleteIncome
};