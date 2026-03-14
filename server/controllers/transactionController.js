import Transaction from '../models/Transaction.js';

// GET /api/transactions
export const getTransactions = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = '-date', type, category, search, startDate, endDate } = req.query;

        const query = { userId: req.user._id };

        if (type) query.type = type;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
            ];
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            transactions,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/transactions/:id
export const getTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
        if (!transaction) {
            res.status(404);
            throw new Error('Transaction not found');
        }
        res.json(transaction);
    } catch (error) {
        next(error);
    }
};

// POST /api/transactions
export const createTransaction = async (req, res, next) => {
    try {
        const { type, amount, category, description, date, profit } = req.body;

        // Calculate running balance
        const lastTransaction = await Transaction.findOne({ userId: req.user._id }).sort('-date -createdAt');
        const prevBalance = lastTransaction ? lastTransaction.balance : 0;
        const balance = type === 'credit' ? prevBalance + Number(amount) : prevBalance - Number(amount);

        const transaction = await Transaction.create({
            userId: req.user._id,
            type,
            amount: Number(amount),
            category,
            description,
            date: date || new Date(),
            balance,
            profit: profit !== undefined ? Number(profit) : 0,
        });

        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

// PUT /api/transactions/:id
export const updateTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
        if (!transaction) {
            res.status(404);
            throw new Error('Transaction not found');
        }

        const { type, amount, category, description, date, profit } = req.body;
        if (type) transaction.type = type;
        if (amount) transaction.amount = Number(amount);
        if (category) transaction.category = category;
        if (description !== undefined) transaction.description = description;
        if (date) transaction.date = date;
        if (profit !== undefined) transaction.profit = Number(profit);

        await transaction.save();
        res.json(transaction);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!transaction) {
            res.status(404);
            throw new Error('Transaction not found');
        }
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        next(error);
    }
};

// GET /api/transactions/stats
export const getStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const [stats] = await Transaction.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
                    totalExpenses: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
                    totalTransactions: { $sum: 1 },
                },
            },
        ]);

        const result = stats || { totalIncome: 0, totalExpenses: 0, totalTransactions: 0 };
        result.totalBalance = result.totalIncome - result.totalExpenses;
        result.savingsRate = result.totalIncome > 0
            ? ((result.totalIncome - result.totalExpenses) / result.totalIncome * 100).toFixed(1)
            : 0;

        // Previous period for trend comparison
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [currentPeriod] = await Transaction.aggregate([
            { $match: { userId, date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: null,
                    income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
                    expenses: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
                },
            },
        ]);

        const [previousPeriod] = await Transaction.aggregate([
            { $match: { userId, date: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
            {
                $group: {
                    _id: null,
                    income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
                    expenses: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
                },
            },
        ]);

        const cur = currentPeriod || { income: 0, expenses: 0 };
        const prev = previousPeriod || { income: 0, expenses: 0 };

        result.trends = {
            income: prev.income > 0 ? (((cur.income - prev.income) / prev.income) * 100).toFixed(1) : 0,
            expenses: prev.expenses > 0 ? (((cur.expenses - prev.expenses) / prev.expenses) * 100).toFixed(1) : 0,
            balance: prev.income - prev.expenses !== 0
                ? ((((cur.income - cur.expenses) - (prev.income - prev.expenses)) / Math.abs(prev.income - prev.expenses)) * 100).toFixed(1)
                : 0,
        };

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// GET /api/transactions/chart-data
export const getChartData = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { period = '6' } = req.query;
        const monthsBack = parseInt(period);
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack);

        // Monthly income vs expense
        const monthlyData = await Transaction.aggregate([
            { $match: { userId, date: { $gte: startDate } } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
                    expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const incomeVsExpense = monthlyData.map((item) => ({
            month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            income: item.income,
            expense: item.expense,
        }));

        // Category breakdown
        const categoryData = await Transaction.aggregate([
            { $match: { userId, type: 'debit', date: { $gte: startDate } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
        ]);

        const categories = categoryData.map((item) => ({
            name: item._id,
            value: item.total,
        }));

        // Weekly transaction volume (last 8 weeks)
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

        const weeklyData = await Transaction.aggregate([
            { $match: { userId, date: { $gte: eightWeeksAgo } } },
            {
                $group: {
                    _id: { week: { $isoWeek: '$date' }, year: { $isoWeekYear: '$date' } },
                    count: { $sum: 1 },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } },
        ]);

        const weekly = weeklyData.map((item) => ({
            week: `W${item._id.week}`,
            transactions: item.count,
            volume: item.total,
        }));

        // Balance trend (daily for last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const balanceTrend = await Transaction.aggregate([
            { $match: { userId, date: { $gte: ninetyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
                    expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        let runningBalance = 0;
        const balanceData = balanceTrend.map((item) => {
            runningBalance += item.income - item.expense;
            return { date: item._id, balance: runningBalance };
        });

        res.json({ incomeVsExpense, categories, weekly, balanceTrend: balanceData });
    } catch (error) {
        next(error);
    }
};
