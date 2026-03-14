import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/ParticleBackground';
import toast from 'react-hot-toast';
import { HiUser, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';

const strengthLevels = [
    { label: 'Very Weak', color: 'bg-danger-500', width: '20%' },
    { label: 'Weak', color: 'bg-danger-400', width: '40%' },
    { label: 'Fair', color: 'bg-warning-500', width: '60%' },
    { label: 'Strong', color: 'bg-success-400', width: '80%' },
    { label: 'Very Strong', color: 'bg-success-500', width: '100%' },
];

const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
};

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const strength = useMemo(() => getStrength(password), [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(name, email, password);
            setSuccess(true);
            toast.success('Account created!');
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
            setShake(true);
            toast.error(msg);
            setTimeout(() => setShake(false), 600);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-accent-600/20 to-primary-900/40 animate-gradient" />
            <ParticleBackground />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`relative z-10 w-full max-w-md mx-4 ${shake ? 'animate-shake' : ''}`}
            >
                <div className="glass rounded-3xl p-8 shadow-2xl">
                    {/* Success Overlay */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 z-20 flex items-center justify-center bg-dark-950/80 rounded-3xl backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.6 }}
                                className="text-center"
                            >
                                <div className="text-7xl mb-4">✨</div>
                                <h2 className="text-2xl font-bold text-white">Account Created!</h2>
                                <p className="text-dark-400 mt-2">Redirecting to dashboard...</p>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Brand */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 mb-4"
                            whileHover={{ rotate: -12, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <span className="text-3xl font-black text-white">L</span>
                        </motion.div>
                        <h1 className="text-3xl font-black text-white mb-1">Create Account</h1>
                        <p className="text-dark-400">Start managing your finances today</p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm text-center neon-glow-danger"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div className="relative group">
                            <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-400 transition-colors w-5 h-5" />
                            <input
                                id="signup-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Full name"
                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500/60 focus:bg-white/8 transition-all duration-300"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <HiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-400 transition-colors w-5 h-5" />
                            <input
                                id="signup-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email address"
                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500/60 focus:bg-white/8 transition-all duration-300"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative group">
                                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-400 transition-colors w-5 h-5" />
                                <input
                                    id="signup-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Password (min 6 characters)"
                                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500/60 focus:bg-white/8 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                                >
                                    {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Strength indicator */}
                            {password && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${strengthLevels[strength].color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: strengthLevels[strength].width }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <p className={`text-xs mt-1 ${strength < 2 ? 'text-danger-400' : strength < 4 ? 'text-warning-400' : 'text-success-400'}`}>
                                        {strengthLevels[strength].label}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 bg-gradient-to-r from-accent-600 to-primary-600 hover:from-accent-500 hover:to-primary-500 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <span className="relative z-10">{loading ? 'Creating Account...' : 'Create Account'}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>
                    </form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-dark-400 mt-6 text-sm"
                    >
                        Already have an account?{' '}
                        <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
