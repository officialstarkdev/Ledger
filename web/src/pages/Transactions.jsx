import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiMagnifyingGlass, HiFunnel, HiPencilSquare, HiTrash, HiArrowDownTray, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';
import TransactionModal from '../components/TransactionModal';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState('-date');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10, sort: sortBy };
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;
            const { data } = await api.get('/transactions', { params });
            setTransactions(data.transactions);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (err) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, search, typeFilter, sortBy]);

    const handleDelete = async () => {
        try {
            await api.delete(`/transactions/${deleteId}`);
            toast.success('Transaction deleted');
            setDeleteId(null);
            fetchTransactions();
        } catch { toast.error('Delete failed'); }
    };

    const handleExportCSV = () => {
        const headers = 'Date,Type,Category,Description,Amount,Balance\n';
        const rows = transactions.map((t) =>
            `${new Date(t.date).toLocaleDateString()},${t.type},${t.category},"${t.description}",${t.amount},${t.balance}`
        ).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported');
    };

    const handleExportPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Transaction Report', 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        autoTable(doc, {
            startY: 36,
            head: [['Date', 'Type', 'Category', 'Description', 'Amount', 'Balance']],
            body: transactions.map((t) => [
                new Date(t.date).toLocaleDateString(),
                t.type,
                t.category,
                t.description,
                `$${t.amount.toFixed(2)}`,
                `$${t.balance.toFixed(2)}`,
            ]),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
        });
        doc.save('transactions.pdf');
        toast.success('PDF exported');
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Transactions</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setEditingTx(null); setModalOpen(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-xl hover:from-primary-500 hover:to-accent-500 transition-all"
                    >
                        <HiPlus className="w-5 h-5" /> Add Transaction
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                        >
                            <option value="">All Types</option>
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                        >
                            <option value="-date">Newest</option>
                            <option value="date">Oldest</option>
                            <option value="-amount">Highest Amount</option>
                            <option value="amount">Lowest Amount</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportCSV} className="px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors flex items-center gap-1 text-sm">
                            <HiArrowDownTray className="w-4 h-4" /> CSV
                        </button>
                        <button onClick={handleExportPDF} className="px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors flex items-center gap-1 text-sm">
                            <HiArrowDownTray className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            <Skeleton className="h-12" count={8} />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-12 text-center text-dark-400">
                            <p className="text-lg">No transactions found</p>
                            <p className="text-sm mt-1">Create your first transaction to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-200 dark:border-dark-700">
                                        <th className="px-5 py-3 text-left text-xs font-bold text-dark-600 dark:text-dark-200 uppercase tracking-wider whitespace-nowrap">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-bold text-dark-600 dark:text-dark-200 uppercase tracking-wider whitespace-nowrap">Type</th>
                                        <th className="px-5 py-3 text-left text-xs font-bold text-dark-600 dark:text-dark-200 uppercase tracking-wider whitespace-nowrap">Category</th>
                                        <th className="px-5 py-3 text-left text-xs font-bold text-dark-600 dark:text-dark-200 uppercase tracking-wider whitespace-nowrap">Description</th>
                                        <th className="px-5 py-3 text-right text-xs font-bold text-dark-600 dark:text-dark-200 uppercase tracking-wider whitespace-nowrap">Amount</th>
                                        <th className="px-5 py-3 text-right text-xs font-bold text-dark-600 dark:text-dark-200 uppercase tracking-wider whitespace-nowrap">Balance</th>
                                        <th className="px-5 py-3 text-right text-xs font-bold text-dark-600 dark:text-dark-200 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx, i) => (
                                        <motion.tr
                                            key={tx._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className={`border-b border-dark-100 dark:border-dark-800/50 hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors ${tx.type === 'credit' ? 'bg-success-500/[0.02]' : 'bg-danger-500/[0.02]'
                                                }`}
                                        >
                                            <td className="px-5 py-4 text-sm font-medium text-dark-800 dark:text-dark-100 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${tx.type === 'credit' ? 'bg-success-500/15 text-success-600 dark:text-success-400' : 'bg-danger-500/15 text-danger-600 dark:text-danger-400'
                                                    }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-dark-700 dark:text-dark-200 whitespace-nowrap">{tx.category}</td>
                                            <td className="px-5 py-4 text-sm text-dark-600 dark:text-dark-300 max-w-[200px] truncate whitespace-nowrap">{tx.description}</td>
                                            <td className={`px-5 py-4 text-sm text-right font-bold whitespace-nowrap ${tx.type === 'credit' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-right font-bold text-dark-800 dark:text-white whitespace-nowrap">${tx.balance.toFixed(2)}</td>
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => { setEditingTx(tx); setModalOpen(true); }}
                                                        className="p-1.5 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                                                    >
                                                        <HiPencilSquare className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(tx._id)}
                                                        className="p-1.5 rounded-lg text-dark-400 hover:text-danger-500 hover:bg-danger-500/10 transition-all"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-dark-200 dark:border-dark-800">
                            <p className="text-sm text-dark-500">
                                Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800 disabled:opacity-40 transition-all"
                                >
                                    <HiChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = i + Math.max(1, Math.min(page - 2, totalPages - 4));
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${pageNum === page
                                                ? 'bg-primary-500 text-white'
                                                : 'text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800 disabled:opacity-40 transition-all"
                                >
                                    <HiChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <TransactionModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingTx(null); }}
                transaction={editingTx}
                onSuccess={fetchTransactions}
            />

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
            />
        </DashboardLayout>
    );
};

export default Transactions;
