import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Target, ArrowRight, Loader2 } from 'lucide-react';
import BackgroundCanvas from '../components/ui/BackgroundCanvas';
import HexLogo from '../components/ui/HexLogo';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ... (existing imports)

    return (
        <div className="min-h-screen relative overflow-hidden bg-dark-950">
            {/* Background Canvas */}
            <div className="absolute inset-0 z-0">
                <BackgroundCanvas />
            </div>

            <div className="min-h-screen flex relative z-10">
                {/* Left side - Semi-transparent Glass */}
                <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-12 text-white bg-dark-900/40 backdrop-blur-xl border-r border-white/5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-6 mb-8 transform hover:scale-105 transition-transform duration-500">
                            {/* Logo */}
                            <div className="w-[80px] h-[80px] relative flex justify-center items-center bg-white/5 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
                                <img src="/logo.png" alt="SIP Logo" className="w-[60px] h-[60px] object-contain" />
                            </div>

                            {/* Csystem Text */}
                            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                Csystem
                            </h1>
                        </div>

                        <h2 className="text-4xl font-display font-bold mb-4 text-white leading-tight">
                            <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">S</span>istem{' '}
                            <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">I</span>ntegrasi<br />
                            <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">P</span>anahan
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            Platform digital untuk manajemen klub panahan modern.
                            Kelola atlet, skor, jadwal, dan keuangan dalam satu tempat.
                        </p>
                    </motion.div>

                    <motion.div
                        className="mt-12 grid grid-cols-2 gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {[
                            { label: 'Real-time Scoring', icon: '🎯' },
                            { label: 'Performance Analytics', icon: '📊' },
                            { label: 'QR Attendance', icon: '📱' },
                            { label: 'Financial Dashboard', icon: '💰' },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <span className="text-2xl mb-2 block">{feature.icon}</span>
                                <span className="text-sm font-medium">{feature.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Right side - Login form */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <motion.div
                        className="w-full max-w-md"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Mobile logo */}
                        <div className="lg:hidden flex flex-col items-center justify-center mb-8">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="w-[60px] h-[60px] relative flex justify-center items-center shadow-2xl skew-y-0"
                                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                                    {/* Spinner Background */}
                                    <div
                                        className="absolute inset-[-50%]"
                                        style={{
                                            background: 'conic-gradient(from 0deg, transparent 0%, #fbbf24 100%)',
                                            animation: 'spin 3s linear infinite'
                                        }}
                                    />
                                    {/* Inner Background */}
                                    <div className="absolute inset-[2px] bg-dark-950"
                                        style={{
                                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                        }}
                                    />
                                    <div className="w-[90%] h-[90%] p-1 flex items-center justify-center relative z-10">
                                        <HexLogo />
                                    </div>
                                </div>
                                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                    Csystem
                                </h1>
                            </div>

                            <p className="text-2xl text-white leading-tight font-bold text-center">
                                <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">S</span>istem{' '}
                                <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">I</span>ntegrasi{' '}
                                <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">P</span>anahan
                                <br />
                                <span className="text-xs text-dark-400 font-normal mt-1 block">Menghubungkan ekosistem, meningkatkan performa.</span>
                            </p>
                        </div>

                        <div className="glass rounded-2xl p-8 relative">
                            {/* Back Button */}
                            <button
                                onClick={() => navigate('/')}
                                className="absolute top-6 left-6 text-dark-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-amber-500/5 flex items-center justify-center border border-amber-500/20 group-hover:border-amber-400 group-hover:bg-amber-500/10 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all duration-300 group-active:scale-90">
                                    <ArrowRight className="rotate-180 text-amber-500 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" size={18} />
                                </div>
                                <span className="group-hover:text-amber-400 transition-colors">Back</span>
                            </button>

                            <div className="pt-10">
                                <h2 className="text-2xl font-display font-bold mb-2">Welcome Back</h2>
                                <p className="text-dark-400 mb-8">Sign in to your account to continue</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <motion.div
                                        className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div>
                                    <label htmlFor="email" className="label">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="input"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="label">Password</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input pr-12"
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500" />
                                        <span className="text-dark-400">Remember me</span>
                                    </label>
                                    <a href="#" className="text-primary-400 hover:text-primary-300">Forgot password?</a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn btn-primary w-full py-3 text-base"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 flex flex-col items-center gap-2">
                                <p className="text-dark-400 text-sm">Install App for easier access</p>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-primary-400 rounded-lg border border-dark-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                    onClick={() => {
                                        if (deferredPrompt) {
                                            deferredPrompt.prompt();
                                            deferredPrompt.userChoice.then((choiceResult: any) => {
                                                if (choiceResult.outcome === 'accepted') {
                                                    setDeferredPrompt(null);
                                                }
                                            });
                                        } else {
                                            // Fallback for iOS or if already installed/not supported
                                            alert("To install app:\n\n1. Tap the browser menu (three dots/lines)\n2. Select 'Add to Home Screen'");
                                        }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2" /><path d="M12 9v6" /><path d="M9 12h6" /></svg>
                                    Add to Home Screen
                                </button>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-dark-500 text-xs">
                            © 2024 Sistem Integrasi Panahan. All rights reserved.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
