import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <motion.div
                    className="text-9xl font-black gradient-text mb-4"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    404
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
                <p className="text-dark-400 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl hover:from-primary-500 hover:to-accent-500 transition-all duration-300"
                >
                    Go to Dashboard
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
