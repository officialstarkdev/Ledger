import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#14b8a6', '#ef4444', '#6366f1'];

const SpendingDonutChart = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5"
        >
            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        animationBegin={0}
                        animationDuration={800}
                    >
                        {data?.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12 }}
                        itemStyle={{ color: '#e2e8f0' }}
                        formatter={(value) => [`$${value.toLocaleString()}`]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default SpendingDonutChart;
