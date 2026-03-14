import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { transactionValidation } from '../middleware/validate.js';
import {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
    getChartData,
} from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/chart-data', getChartData);
router.route('/').get(getTransactions).post(transactionValidation, createTransaction);
router.route('/:id').get(getTransaction).put(transactionValidation, updateTransaction).delete(deleteTransaction);

export default router;
