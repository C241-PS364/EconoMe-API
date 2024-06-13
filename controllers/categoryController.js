const pool = require('../config/db');

const getCategories = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM categories');
      res.status(200).json({ error: false, data: result.rows });
    } catch (err) {
      res.status(500).json({ error: true, message: err.message });
    }
  };

  const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({
                error: false,
                data: result.rows[0]
            });
        } else {
            res.status(404).json({
                error: true,
                message: 'Category not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const result = await pool.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json({
            error: false,
            message: 'Category created successfully',
            data: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505' && err.constraint === 'categories_name_key') {
            res.status(409).json({
                error: true,
                message: 'Category already exists'
            });
        } else {
            res.status(500).json({
                error: true,
                message: err.message
            });
        }
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        if (result.rows.length > 0) {
            res.status(200).json({
                error: false,
                message: 'Category updated successfully',
                data: result.rows[0]
            });
        } else {
            res.status(404).json({
                error: true,
                message: 'Category not found'
            });
        }
    } catch (err) {
        if (err.code === '23505' && err.constraint === 'categories_name_key') {
            res.status(409).json({
                error: true,
                message: 'Category already exists'
            });
        } else {
            res.status(500).json({
                error: true,
                message: err.message
            });
        }
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({
                error: false,
                message: 'Category deleted successfully'
            });
        } else {
            res.status(404).json({
                error: true,
                message: 'Category not found'
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
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};

