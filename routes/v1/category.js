const express = require('express');
const router = express.Router();

const {
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../../controllers/categoryController');

router.get('/:id', getCategoryById);
router.post('/input', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;

