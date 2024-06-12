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
    try {
        const { date, title, amount, user_id } = req.body;
        const result = await pool.query(
            'INSERT INTO incomes (date, title, amount, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [date, title, amount, user_id]
        );
        res.status(201).json(result.rows[[1]]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, title, amount, user_id } = req.body;
        const result = await pool.query(
            'UPDATE incomes SET date = $1, title = $2, amount = $3, user_id = $4 WHERE id = $5 RETURNING *',
            [date, title, amount, user_id, id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[[1]]);
        } else {
            res.status(404).json({ message: 'Income not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
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