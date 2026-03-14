import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const WeeklyBarChart = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-5"
        >
            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-4">Weekly Transaction Volume</h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12 }}
                        itemStyle={{ color: '#e2e8f0' }}
                        formatter={(value, name) => [name === 'transactions' ? value : `$${value.toLocaleString()}`, name === 'transactions' ? 'Transactions' : 'Volume']}
                    />
                    <Bar dataKey="transactions" fill="#8b5cf6" radius={[6, 6, 0, 0]} animationDuration={800} />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default WeeklyBarChart;
