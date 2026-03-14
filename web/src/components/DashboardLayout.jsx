import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    HiChartPie, HiArrowsRightLeft, HiBookOpen, HiArrowRightOnRectangle,
    HiChevronDoubleLeft, HiChevronDoubleRight, HiSun, HiMoon, HiBell, HiBars3
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiChartPie },
    { path: '/transactions', label: 'Transactions', icon: HiArrowsRightLeft },
    { path: '/ledger', label: 'Ledger', icon: HiBookOpen },
];

const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { user, logout } = useAuth();
    const { dark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) setCollapsed(true);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        navigate('/login');
    };

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="min-h-screen flex bg-dark-50 dark:bg-dark-950 transition-colors duration-500 overflow-hidden">
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobile && !collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCollapsed(true)}
                        className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                animate={{
                    width: isMobile ? 260 : (collapsed ? 72 : 260),
                    x: isMobile && collapsed ? -260 : 0
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 left-0 h-screen z-40 flex flex-col border-r border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 transition-colors"
            >
                {/* Logo */}
                <div className="flex items-center h-16 px-4 border-b border-dark-200 dark:border-dark-800">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shrink-0">
                        <span className="text-lg font-black text-white">L</span>
                    </div>
                    <AnimatePresence>
                        {(!collapsed || isMobile) && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="ml-3 text-xl font-bold gradient-text whitespace-nowrap overflow-hidden"
                            >
                                Ledger
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 px-2 space-y-1">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400 neon-glow'
                                    : 'text-dark-500 hover:text-dark-900 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            <AnimatePresence>
                                {(!collapsed || isMobile) && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-medium whitespace-nowrap overflow-hidden"
                                    >
                                        {label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    ))}
                </nav>

                {/* Collapse */}
                <div className="p-2 border-t border-dark-200 dark:border-dark-800 hidden lg:block">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex items-center justify-center w-full p-2.5 rounded-xl text-dark-500 hover:text-dark-900 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-all"
                    >
                        {collapsed ? <HiChevronDoubleRight className="w-5 h-5" /> : <HiChevronDoubleLeft className="w-5 h-5" />}
                    </button>
                </div>
            </motion.aside>

            {/* Main */}
            <div className="flex-1 flex flex-col transition-all duration-300 h-screen overflow-hidden" style={{ marginLeft: isMobile ? 0 : (collapsed ? 72 : 260) }}>
                {/* Top Nav */}
                <header className="sticky top-0 z-30 h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-dark-200 dark:border-dark-800 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        {isMobile && (
                            <button
                                onClick={() => setCollapsed(false)}
                                className="p-2 -ml-2 rounded-xl text-dark-500 hover:text-dark-900 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-all"
                            >
                                <HiBars3 className="w-6 h-6" />
                            </button>
                        )}
                        <div className="hidden sm:block">
                            <h2 className="text-sm text-dark-400">{greeting},</h2>
                            <h1 className="text-lg font-bold text-dark-900 dark:text-dark-100">{user?.name || 'User'}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl text-dark-500 hover:text-dark-900 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-all relative">
                            <HiBell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-dark-500 hover:text-dark-900 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-all"
                        >
                            {dark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                        </button>

                        <div className="w-px h-8 bg-dark-200 dark:bg-dark-700 mx-1" />

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-xl text-dark-500 hover:text-danger-500 hover:bg-danger-500/10 transition-all"
                                title="Logout"
                            >
                                <HiArrowRightOnRectangle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
