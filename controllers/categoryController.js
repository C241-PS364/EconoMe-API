const pool = require('../config/db');

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[[1]]);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        const result = await pool.query(
            'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
            [category_name]
        );
        res.status(201).json(result.rows[[1]]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;
        const result = await pool.query(
            'UPDATE categories SET category_name = $1 WHERE id = $2 RETURNING *',
            [category_name, id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[[1]]);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Category deleted' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};

