import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencilSquare, HiTrash, HiEye } from 'react-icons/hi2';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';

const LedgerEntries = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [viewEntry, setViewEntry] = useState(null);

    const [form, setForm] = useState({
        accountName: '', openingBalance: '', period: '', entries: [],
    });

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/ledger');
            setEntries(data.entries);
        } catch { toast.error('Failed to load ledger entries'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEntries(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ accountName: '', openingBalance: '', period: '', entries: [] });
        setModalOpen(true);
    };

    const openEdit = (entry) => {
        setEditing(entry);
        setForm({
            accountName: entry.accountName,
            openingBalance: entry.openingBalance,
            period: entry.period,
            entries: entry.entries || [],
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/ledger/${editing._id}`, form);
                toast.success('Ledger entry updated');
            } else {
                await api.post('/ledger', form);
                toast.success('Ledger entry created');
            }
            setModalOpen(false);
            fetchEntries();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/ledger/${deleteId}`);
            toast.success('Ledger entry deleted');
            setDeleteId(null);
            fetchEntries();
        } catch { toast.error('Delete failed'); }
    };

    const addSubEntry = () => {
        setForm({
            ...form,
            entries: [...form.entries, { date: new Date().toISOString().split('T')[0], description: '', debit: 0, credit: 0 }],
        });
    };

    const updateSubEntry = (index, field, value) => {
        const updated = [...form.entries];
        updated[index] = { ...updated[index], [field]: value };
        setForm({ ...form, entries: updated });
    };

    const removeSubEntry = (index) => {
        setForm({ ...form, entries: form.entries.filter((_, i) => i !== index) });
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Ledger Entries</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-xl"
                    >
                        <HiPlus className="w-5 h-5" /> New Entry
                    </motion.button>
                </div>

                {/* Entry Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-40" count={6} />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center text-dark-400">
                        <p className="text-lg">No ledger entries yet</p>
                        <p className="text-sm mt-1">Create your first ledger entry to start tracking</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {entries.map((entry) => (
                            <motion.div
                                key={entry._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-dark-900 dark:text-white">{entry.accountName}</h3>
                                        <p className="text-sm text-dark-400">{entry.period}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setViewEntry(entry)} className="p-1.5 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all">
                                            <HiEye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => openEdit(entry)} className="p-1.5 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all">
                                            <HiPencilSquare className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDeleteId(entry._id)} className="p-1.5 rounded-lg text-dark-400 hover:text-danger-500 hover:bg-danger-500/10 transition-all">
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-dark-500">Opening</span>
                                        <span className="font-medium text-dark-700 dark:text-dark-300">${entry.openingBalance.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-500">Closing</span>
                                        <span className="font-bold text-primary-500">${entry.closingBalance.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-500">Entries</span>
                                        <span className="text-dark-400">{entry.entries?.length || 0}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-5">
                                {editing ? 'Edit Ledger Entry' : 'New Ledger Entry'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Account Name"
                                    value={form.accountName}
                                    onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                                />
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        placeholder="Opening Balance"
                                        value={form.openingBalance}
                                        onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                                        required
                                        className="flex-1 px-4 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Period (e.g. 2025-03)"
                                        value={form.period}
                                        onChange={(e) => setForm({ ...form, period: e.target.value })}
                                        required
                                        className="flex-1 px-4 py-2.5 bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-dark-600 dark:text-dark-400">Sub-Entries</label>
                                        <button type="button" onClick={addSubEntry} className="text-sm text-primary-500 hover:text-primary-400">+ Add Entry</button>
                                    </div>
                                    {form.entries.map((entry, i) => (
                                        <div key={i} className="flex gap-2 mb-2 items-center">
                                            <input type="date" value={entry.date?.split('T')[0] || ''} onChange={(e) => updateSubEntry(i, 'date', e.target.value)}
                                                className="w-28 px-2 py-1.5 text-sm bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white" />
                                            <input type="text" placeholder="Desc" value={entry.description} onChange={(e) => updateSubEntry(i, 'description', e.target.value)}
                                                className="flex-1 px-2 py-1.5 text-sm bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white" />
                                            <input type="number" placeholder="Dr" value={entry.debit || ''} onChange={(e) => updateSubEntry(i, 'debit', e.target.value)}
                                                className="w-20 px-2 py-1.5 text-sm bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white" />
                                            <input type="number" placeholder="Cr" value={entry.credit || ''} onChange={(e) => updateSubEntry(i, 'credit', e.target.value)}
                                                className="w-20 px-2 py-1.5 text-sm bg-dark-100 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white" />
                                            <button type="button" onClick={() => removeSubEntry(i)} className="p-1 text-danger-500 hover:bg-danger-500/10 rounded">
                                                <HiTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setModalOpen(false)}
                                        className="flex-1 py-2.5 rounded-xl text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 font-medium">Cancel</button>
                                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-xl">
                                        {editing ? 'Update' : 'Create'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {viewEntry && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setViewEntry(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-1">{viewEntry.accountName}</h3>
                            <p className="text-sm text-dark-400 mb-4">Period: {viewEntry.period}</p>
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1 text-center p-3 bg-dark-100 dark:bg-dark-800 rounded-xl">
                                    <p className="text-xs text-dark-400">Opening</p>
                                    <p className="text-lg font-bold text-dark-900 dark:text-white">${viewEntry.openingBalance.toFixed(2)}</p>
                                </div>
                                <div className="flex-1 text-center p-3 bg-dark-100 dark:bg-dark-800 rounded-xl">
                                    <p className="text-xs text-dark-400">Closing</p>
                                    <p className="text-lg font-bold text-primary-500">${viewEntry.closingBalance.toFixed(2)}</p>
                                </div>
                            </div>
                            {viewEntry.entries?.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-dark-500 border-b border-dark-200 dark:border-dark-700">
                                                <th className="pb-2 text-left whitespace-nowrap">Date</th>
                                                <th className="pb-2 text-left whitespace-nowrap">Description</th>
                                                <th className="pb-2 text-right whitespace-nowrap">Dr</th>
                                                <th className="pb-2 text-right whitespace-nowrap">Cr</th>
                                                <th className="pb-2 text-right whitespace-nowrap">Bal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {viewEntry.entries.map((e, i) => (
                                                <tr key={i} className="border-b border-dark-100 dark:border-dark-800/50">
                                                    <td className="py-2 text-dark-600 dark:text-dark-400 whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</td>
                                                    <td className="py-2 text-dark-700 dark:text-dark-300 min-w-[120px]">{e.description}</td>
                                                    <td className="py-2 text-right text-danger-500 whitespace-nowrap">{e.debit > 0 ? `$${e.debit.toFixed(2)}` : '-'}</td>
                                                    <td className="py-2 text-right text-success-500 whitespace-nowrap">{e.credit > 0 ? `$${e.credit.toFixed(2)}` : '-'}</td>
                                                    <td className="py-2 text-right font-medium text-dark-700 dark:text-dark-300 whitespace-nowrap">${e.balance.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <button
                                onClick={() => setViewEntry(null)}
                                className="w-full mt-4 py-2.5 rounded-xl text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Ledger Entry"
                message="Are you sure you want to delete this ledger entry?"
            />
        </DashboardLayout>
    );
};

export default LedgerEntries;
