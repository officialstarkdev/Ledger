import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import KPICard from '../components/KPICard';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import SpendingDonutChart from '../components/charts/SpendingDonutChart';
import WeeklyBarChart from '../components/charts/WeeklyBarChart';
import BalanceTrendChart from '../components/charts/BalanceTrendChart';
import Skeleton from '../components/Skeleton';
import { HiBanknotes, HiArrowTrendingUp, HiArrowTrendingDown, HiChartBar } from 'react-icons/hi2';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartRes] = await Promise.all([
                    api.get('/transactions/stats'),
                    api.get('/transactions/chart-data'),
                ]);
                setStats(statsRes.data);
                setChartData(chartRes.data);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Dashboard Overview</h1>

                {/* KPI Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton className="h-28" count={4} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard
                            title="Total Balance"
                            value={stats?.totalBalance || 0}
                            trend={stats?.trends?.balance}
                            icon={HiBanknotes}
                            color="blue"
                        />
                        <KPICard
                            title="Total Income"
                            value={stats?.totalIncome || 0}
                            trend={stats?.trends?.income}
                            icon={HiArrowTrendingUp}
                            color="green"
                        />
                        <KPICard
                            title="Total Expenses"
                            value={stats?.totalExpenses || 0}
                            trend={stats?.trends?.expenses}
                            icon={HiArrowTrendingDown}
                            color="red"
                        />
                        <KPICard
                            title="Savings Rate"
                            value={parseFloat(stats?.savingsRate) || 0}
                            icon={HiChartBar}
                            color="purple"
                            isCurrency={false}
                            suffix="%"
                        />
                    </div>
                )}

                {/* Charts */}
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Skeleton className="h-80" count={4} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <IncomeExpenseChart data={chartData?.incomeVsExpense || []} />
                        <SpendingDonutChart data={chartData?.categories || []} />
                        <WeeklyBarChart data={chartData?.weekly || []} />
                        <BalanceTrendChart data={chartData?.balanceTrend || []} />
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
};

export default Dashboard;
