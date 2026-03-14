import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const categories = ['Smartphones', 'Laptops', 'Tablets', 'Wearables', 'Audio', 'Cameras', 'Accessories', 'Other Electronics'];

const TransactionModal = ({ isOpen, onClose, transaction, onSuccess }) => {
    const isEdit = !!transaction;
    const [form, setForm] = useState({
        type: transaction?.type || 'debit',
        amount: transaction?.amount || '',
        category: transaction?.category || 'Smartphones',
        description: transaction?.description || '',
        profit: transaction?.profit || '',
        date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/transactions/${transaction._id}`, form);
                toast.success('Transaction updated');
            } else {
                await api.post('/transactions', form);
                toast.success('Transaction created');
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="glass-card rounded-2xl p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-5">
                            {isEdit ? 'Edit Transaction' : 'New Transaction'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type */}
                            <div className="flex gap-2">
                                {['credit', 'debit'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setForm({ ...form, type: t })}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${form.type === t
                                                ? t === 'credit'
                                                    ? 'bg-success-500/15 text-success-500 border border-success-500/30'
                                                    : 'bg-danger-500/15 text-danger-500 border border-danger-500/30'
                                                : 'bg-dark-100 dark:bg-dark-800 text-dark-500 border border-transparent'
                                            }`}
                                    >
                                        {t === 'credit' ? '↑ Credit' : '↓ Debit'}
                                    </button>
                                ))}
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-1">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0.01"
                                    required
                                    className="w-full px-4 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Profit */}
                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-1">Profit</label>
                                <input
                                    type="number"
                                    name="profit"
                                    value={form.profit}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full px-4 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                                >
                                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                                    placeholder="Transaction description"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-xl transition-all disabled:opacity-60"
                                >
                                    {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TransactionModal;
