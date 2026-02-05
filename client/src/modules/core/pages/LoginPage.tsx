import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/modules/core/contexts/AuthContext';
import { Eye, EyeOff, Target, ArrowRight, Loader2, Mail, Lock, BarChart3, QrCode, Wallet } from 'lucide-react';
import BackgroundCanvas from '@/modules/core/components/ui/BackgroundCanvas';
import AnimatedHexLogo from '@/modules/core/components/ui/AnimatedHexLogo';
import SIPText from '@/modules/core/components/ui/SIPText';

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

    const [isValidationTriggered, setIsValidationTriggered] = useState(false);

    const getFieldError = (field: string) => {
        if (!isValidationTriggered) return null;
        switch (field) {
            case 'email': {
                if (!email) return 'Email is required';
                if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format';
                return null;
            }
            case 'password': {
                if (!password) return 'Password is required';
                return null;
            }
            default: return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password || getFieldError('email') || getFieldError('password')) {
            setIsValidationTriggered(true);
            return;
        }

        setIsLoading(true);

        try {
            const hasPendingLink = localStorage.getItem('pending_child_link');
            navigate(hasPendingLink ? '/profile' : '/dashboard', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                            <AnimatedHexLogo size={80} className="shadow-2xl" />

                            {/* Csystem Text */}
                            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                Csystem
                            </h1>
                        </div>

                        <SIPText size="4xl" className="mb-4 block" />
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
                            { label: 'Real-time Scoring', icon: Target, color: 'text-cyan-400', glow: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                            { label: 'Performance Analytics', icon: BarChart3, color: 'text-amber-400', glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]', bg: 'bg-amber-500/10 border-amber-500/20' },
                            { label: 'QR Attendance', icon: QrCode, color: 'text-purple-400', glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', bg: 'bg-purple-500/10 border-purple-500/20' },
                            { label: 'Financial Dashboard', icon: Wallet, color: 'text-emerald-400', glow: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group bg-dark-900/40 backdrop-blur-xl rounded-2xl p-4 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-500 transform hover:-translate-y-1 shadow-2xl"
                            >
                                <div className={`w-12 h-12 rounded-xl ${feature.bg} border flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon size={22} className={`${feature.color} ${feature.glow}`} />
                                </div>
                                <span className="text-sm font-bold text-white/90 tracking-tight group-hover:text-white transition-colors">{feature.label}</span>
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
                                <AnimatedHexLogo size={60} className="shadow-2xl" />
                                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                    Csystem
                                </h1>
                            </div>

                            <div className="text-center mb-4">
                                <SIPText size="2xl" className="block mb-1" />
                                <span className="text-xs text-dark-400 font-normal mt-1 block">Menghubungkan ekosistem, meningkatkan performa.</span>
                            </div>
                        </div>

                        <div className="glass rounded-[2rem] p-10 relative border-white/5 shadow-2xl backdrop-blur-3xl bg-dark-950/40">
                            {/* Back Button */}
                            <button
                                onClick={() => navigate('/')}
                                className="absolute top-6 left-6 text-dark-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-cyan-400/5 flex items-center justify-center border border-cyan-400/20 group-hover:border-cyan-400 group-hover:bg-cyan-400/10 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 group-active:scale-90">
                                    <ArrowRight className="rotate-180 text-cyan-400 group-hover:text-cyan-400 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={18} />
                                </div>
                                <span className="group-hover:text-cyan-400 transition-colors">Back</span>
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
                                    <label htmlFor="email" className="label text-[10px] uppercase tracking-widest font-black text-dark-500 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (error) setError('');
                                            }}
                                            placeholder="you@example.com"
                                            className={`input pl-12 h-14 bg-dark-950/40 border-white/5 focus:border-cyan-400/50 hover:border-white/10 transition-all rounded-2xl w-full ${getFieldError('email') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                            autoComplete="email"
                                        />
                                    </div>
                                    {getFieldError('email') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('email')}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="label text-[10px] uppercase tracking-widest font-black text-dark-500 ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (error) setError('');
                                            }}
                                            placeholder="••••••••"
                                            className={`input pl-12 pr-12 h-14 bg-dark-950/40 border-white/5 focus:border-cyan-400/50 hover:border-white/10 transition-all rounded-2xl w-full ${getFieldError('password') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-cyan-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {getFieldError('password') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('password')}</p>}
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-dark-900/50 text-cyan-400 focus:ring-cyan-400 transition-all" />
                                        <span className="text-dark-400 group-hover:text-white transition-colors text-xs font-medium">Remember me</span>
                                    </label>
                                    <a href="#" className="text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-colors">Forgot password?</a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 text-lg font-black text-dark-950 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            SIGN IN
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-10 pt-6 border-t border-white/5 text-center">
                                <p className="text-dark-400 text-sm font-medium tracking-tight">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => navigate('/?step=role')}
                                        className="text-cyan-400 hover:text-cyan-300 font-black transition-colors underline decoration-cyan-400/30 underline-offset-8"
                                    >
                                        Register Now
                                    </button>
                                </p>
                            </div>

                            <div className="mt-8 flex flex-col items-center gap-3">
                                <p className="text-dark-500 text-[10px] uppercase font-black tracking-widest">Install App for easier access</p>
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-dark-900/50 hover:bg-dark-900 text-cyan-400 rounded-xl border border-white/5 transition-all hover:scale-105 flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg"
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

                        <p className="mt-8 text-center text-dark-500 text-[10px] uppercase font-black tracking-[0.2em] opacity-50 flex items-center justify-center gap-1">
                            © 2026 Corelink - <SIPText size="xs" isUppercase={true} className="!tracking-[0.2em]" />. All rights reserved.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
