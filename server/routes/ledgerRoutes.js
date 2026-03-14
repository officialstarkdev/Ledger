import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { ledgerEntryValidation } from '../middleware/validate.js';
import {
    getLedgerEntries,
    getLedgerEntry,
    createLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
} from '../controllers/ledgerController.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getLedgerEntries).post(ledgerEntryValidation, createLedgerEntry);
router.route('/:id').get(getLedgerEntry).put(ledgerEntryValidation, updateLedgerEntry).delete(deleteLedgerEntry);

export default router;
