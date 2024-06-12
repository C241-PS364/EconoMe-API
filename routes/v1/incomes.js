const express = require('express');
const router = express.Router();

const {
    getIncomeById,
    createIncome,
    updateIncome,
    deleteIncome
} = require('../../controllers/incomesController');

router.get('/:id', getIncomeById);
router.post('/input', createIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;