import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';

const useCountUp = (end, duration = 1500) => {
    const [count, setCount] = useState(0);
    const prevEnd = useRef(0);

    useEffect(() => {
        if (end === prevEnd.current) return;
        prevEnd.current = end;
        const start = 0;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(start + (end - start) * eased);
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [end, duration]);

    return count;
};

const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
};

const KPICard = ({ title, value, trend, icon: Icon, color, prefix = '$', isCurrency = true, suffix = '' }) => {
    const animatedValue = useCountUp(value || 0, 1200);
    const trendNum = parseFloat(trend) || 0;
    const isPositive = trendNum >= 0;

    const colorMap = {
        blue: 'from-primary-500/20 to-primary-600/5 border-primary-500/20',
        green: 'from-success-500/20 to-success-600/5 border-success-500/20',
        red: 'from-danger-500/20 to-danger-600/5 border-danger-500/20',
        purple: 'from-accent-500/20 to-accent-600/5 border-accent-500/20',
    };

    const iconColorMap = {
        blue: 'bg-primary-500/15 text-primary-500',
        green: 'bg-success-500/15 text-success-500',
        red: 'bg-danger-500/15 text-danger-500',
        purple: 'bg-accent-500/15 text-accent-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${colorMap[color]} hover:shadow-lg transition-shadow duration-300`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-dark-900 dark:text-white animate-counter">
                        {isCurrency ? formatCurrency(animatedValue) : `${Math.round(animatedValue)}${suffix}`}
                    </p>
                </div>
                <div className={`p-2.5 rounded-xl ${iconColorMap[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            {trend !== undefined && (
                <div className="flex items-center gap-1 mt-3">
                    {isPositive ? (
                        <HiArrowTrendingUp className="w-4 h-4 text-success-500" />
                    ) : (
                        <HiArrowTrendingDown className="w-4 h-4 text-danger-500" />
                    )}
                    <span className={`text-sm font-medium ${isPositive ? 'text-success-500' : 'text-danger-500'}`}>
                        {isPositive ? '+' : ''}{trendNum}%
                    </span>
                    <span className="text-xs text-dark-400 ml-1">vs last period</span>
                </div>
            )}
        </motion.div>
    );
};

export default KPICard;
