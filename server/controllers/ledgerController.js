import LedgerEntry from '../models/LedgerEntry.js';

// GET /api/ledger
export const getLedgerEntries = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
        const query = { userId: req.user._id };

        const total = await LedgerEntry.countDocuments(query);
        const entries = await LedgerEntry.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ entries, page: Number(page), totalPages: Math.ceil(total / limit), total });
    } catch (error) {
        next(error);
    }
};

// GET /api/ledger/:id
export const getLedgerEntry = async (req, res, next) => {
    try {
        const entry = await LedgerEntry.findOne({ _id: req.params.id, userId: req.user._id });
        if (!entry) {
            res.status(404);
            throw new Error('Ledger entry not found');
        }
        res.json(entry);
    } catch (error) {
        next(error);
    }
};

// POST /api/ledger
export const createLedgerEntry = async (req, res, next) => {
    try {
        const { accountName, openingBalance, period, entries } = req.body;

        let balance = Number(openingBalance) || 0;
        const processedEntries = (entries || []).map((e) => {
            balance = balance + (Number(e.credit) || 0) - (Number(e.debit) || 0);
            return { ...e, balance };
        });

        const ledgerEntry = await LedgerEntry.create({
            userId: req.user._id,
            accountName,
            openingBalance: Number(openingBalance) || 0,
            closingBalance: balance,
            period,
            entries: processedEntries,
        });

        res.status(201).json(ledgerEntry);
    } catch (error) {
        next(error);
    }
};

// PUT /api/ledger/:id
export const updateLedgerEntry = async (req, res, next) => {
    try {
        const entry = await LedgerEntry.findOne({ _id: req.params.id, userId: req.user._id });
        if (!entry) {
            res.status(404);
            throw new Error('Ledger entry not found');
        }

        const { accountName, openingBalance, period, entries } = req.body;
        if (accountName) entry.accountName = accountName;
        if (period) entry.period = period;
        if (openingBalance !== undefined) entry.openingBalance = Number(openingBalance);

        if (entries) {
            let balance = entry.openingBalance;
            entry.entries = entries.map((e) => {
                balance = balance + (Number(e.credit) || 0) - (Number(e.debit) || 0);
                return { ...e, balance };
            });
            entry.closingBalance = balance;
        }

        await entry.save();
        res.json(entry);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/ledger/:id
export const deleteLedgerEntry = async (req, res, next) => {
    try {
        const entry = await LedgerEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!entry) {
            res.status(404);
            throw new Error('Ledger entry not found');
        }
        res.json({ message: 'Ledger entry deleted' });
    } catch (error) {
        next(error);
    }
};
