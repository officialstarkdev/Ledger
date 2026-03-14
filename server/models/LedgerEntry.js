import mongoose from 'mongoose';

const entrySubSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    description: { type: String, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
}, { _id: false });

const ledgerEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    accountName: {
        type: String,
        required: [true, 'Account name is required'],
        trim: true,
    },
    openingBalance: {
        type: Number,
        default: 0,
    },
    closingBalance: {
        type: Number,
        default: 0,
    },
    period: {
        type: String,
        required: [true, 'Period is required'],
    },
    entries: [entrySubSchema],
}, { timestamps: true });

export default mongoose.model('LedgerEntry', ledgerEntrySchema);
