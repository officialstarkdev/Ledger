import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import LedgerEntry from './models/LedgerEntry.js';

dotenv.config();

const categories = {
    credit: ['Salary', 'Freelance', 'Investments', 'Refund', 'Bonus'],
    debit: ['Groceries', 'Rent', 'Utilities', 'Entertainment', 'Transport', 'Health', 'Shopping', 'Dining'],
};

const descriptions = {
    Salary: ['Monthly salary', 'Salary payment', 'Pay check'],
    Freelance: ['Web development project', 'Design consultation', 'Content writing'],
    Investments: ['Stock dividends', 'Mutual fund returns', 'Interest income'],
    Refund: ['Product refund', 'Service refund', 'Overcharge adjustment'],
    Bonus: ['Performance bonus', 'Year-end bonus', 'Referral bonus'],
    Groceries: ['Weekly groceries', 'Supermarket shopping', 'Fresh produce'],
    Rent: ['Monthly rent', 'Apartment rent', 'Office rent'],
    Utilities: ['Electricity bill', 'Water bill', 'Internet bill', 'Gas bill'],
    Entertainment: ['Movie tickets', 'Concert tickets', 'Streaming subscription', 'Gaming'],
    Transport: ['Fuel', 'Uber ride', 'Bus pass', 'Car maintenance'],
    Health: ['Doctor visit', 'Pharmacy', 'Gym membership', 'Health insurance'],
    Shopping: ['Clothing', 'Electronics', 'Home decor', 'Books'],
    Dining: ['Restaurant', 'Coffee shop', 'Food delivery', 'Lunch out'],
};

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomAmount = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Transaction.deleteMany({});
        await LedgerEntry.deleteMany({});

        // Create demo user
        const user = await User.create({
            name: 'Demo User',
            email: 'demo@ledger.com',
            password: 'Password123!',
            avatar: '',
            role: 'user',
        });

        console.log('Demo user created: demo@ledger.com / Password123!');

        // Generate transactions for the last 6 months
        const transactions = [];
        let balance = 0;
        const now = new Date();

        for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
            const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

            // 1-2 salary credits per month
            const salaryDay = Math.floor(Math.random() * 5) + 1;
            const salaryDate = new Date(month.getFullYear(), month.getMonth(), salaryDay);
            const salaryAmount = randomAmount(3000, 6000);
            balance += salaryAmount;
            transactions.push({
                userId: user._id,
                type: 'credit',
                amount: salaryAmount,
                category: 'Salary',
                description: randomItem(descriptions.Salary),
                date: salaryDate,
                balance,
            });

            // 0-1 freelance income
            if (Math.random() > 0.4) {
                const freelanceDay = Math.floor(Math.random() * 20) + 5;
                const freelanceDate = new Date(month.getFullYear(), month.getMonth(), freelanceDay);
                const freelanceAmount = randomAmount(500, 2500);
                balance += freelanceAmount;
                transactions.push({
                    userId: user._id,
                    type: 'credit',
                    amount: freelanceAmount,
                    category: randomItem(['Freelance', 'Investments', 'Bonus']),
                    description: randomItem(descriptions.Freelance),
                    date: freelanceDate,
                    balance,
                });
            }

            // 10-18 expense transactions per month
            const numExpenses = Math.floor(Math.random() * 9) + 10;
            for (let i = 0; i < numExpenses; i++) {
                const cat = randomItem(categories.debit);
                const day = Math.floor(Math.random() * 28) + 1;
                const date = new Date(month.getFullYear(), month.getMonth(), day);
                let amount;
                if (cat === 'Rent') amount = randomAmount(800, 1500);
                else if (cat === 'Utilities') amount = randomAmount(50, 200);
                else if (cat === 'Health') amount = randomAmount(20, 400);
                else amount = randomAmount(10, 300);

                balance -= amount;
                transactions.push({
                    userId: user._id,
                    type: 'debit',
                    amount,
                    category: cat,
                    description: randomItem(descriptions[cat]),
                    date,
                    balance,
                });
            }
        }

        // Sort by date
        transactions.sort((a, b) => a.date - b.date);

        // Recalculate running balance
        let runBal = 0;
        for (const t of transactions) {
            runBal = t.type === 'credit' ? runBal + t.amount : runBal - t.amount;
            t.balance = Number(runBal.toFixed(2));
        }

        await Transaction.insertMany(transactions);
        console.log(`${transactions.length} transactions created`);

        // Create a sample ledger entry
        await LedgerEntry.create({
            userId: user._id,
            accountName: 'Main Account',
            openingBalance: 0,
            closingBalance: runBal,
            period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
            entries: transactions.slice(-5).map((t) => ({
                date: t.date,
                description: t.description,
                debit: t.type === 'debit' ? t.amount : 0,
                credit: t.type === 'credit' ? t.amount : 0,
                balance: t.balance,
            })),
        });

        console.log('Sample ledger entry created');
        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
