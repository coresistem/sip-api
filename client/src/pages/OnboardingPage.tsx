import HexLogo from '../components/onboarding/HexLogo';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Target, Briefcase, HeartHandshake, Dumbbell,
    Scale, Calendar, Package, ChevronRight,
    Phone, Check, Loader2, GraduationCap, Eye, EyeOff
} from 'lucide-react';
import { PROVINCES, getCitiesByProvince } from '../types/territoryData';
import { useAuth } from '../context/AuthContext';
import { useBackgroundEffect } from '../context/BackgroundEffectContext';


// Role cards configuration - Codes 01-09 (00 SuperAdmin not selectable by users)

const ROLE_CARDS = [
    { code: '01', role: 'PERPANI', icon: Shield, label: 'Perpani', description: 'National archery federation member', color: 'from-red-600 to-red-500' },
    { code: '02', role: 'CLUB', icon: Briefcase, label: 'Club', description: 'Archery club owner or manager', color: 'from-amber-500 to-orange-500' },
    { code: '03', role: 'SCHOOL', icon: GraduationCap, label: 'School', description: 'School or educational institution', color: 'from-emerald-500 to-teal-500' },
    { code: '04', role: 'ATHLETE', icon: Target, label: 'Athlete', description: 'Registered athlete or archer', color: 'from-blue-500 to-cyan-500' },
    { code: '05', role: 'PARENT', icon: HeartHandshake, label: 'Parent', description: 'Parent or guardian of athlete', color: 'from-purple-500 to-pink-500' },
    { code: '06', role: 'COACH', icon: Dumbbell, label: 'Coach', description: 'Archery coach or trainer', color: 'from-green-500 to-emerald-500' },
    { code: '07', role: 'JUDGE', icon: Scale, label: 'Judge', description: 'Competition judge or referee', color: 'from-indigo-500 to-violet-500' },
    { code: '08', role: 'EO', icon: Calendar, label: 'Event Organizer', description: 'Event organizer', color: 'from-teal-500 to-cyan-500' },
    { code: '09', role: 'SUPPLIER', icon: Package, label: 'Supplier', description: 'Equipment supplier or vendor', color: 'from-rose-500 to-red-500' },
];

type OnboardingStep = 'greeting' | 'role' | 'signup' | 'reveal';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { user, register, logout } = useAuth();
    const { triggerWave } = useBackgroundEffect();
    const [step, setStep] = useState<OnboardingStep>('greeting');
    const [logoGlow, setLogoGlow] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        provinceId: '', cityId: '', whatsapp: ''
    });
    const [previewSipId, setPreviewSipId] = useState<string | null>(null);

    const sortedProvinces = useMemo(() => {
        return [...PROVINCES].sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const cities = useMemo(() => {
        if (!formData.provinceId) return [];
        return getCitiesByProvince(formData.provinceId);
    }, [formData.provinceId]);

    const isSignupValid = formData.name && formData.email && formData.password.length >= 8 &&
        formData.password === formData.confirmPassword &&
        formData.provinceId && formData.cityId && formData.whatsapp;

    const [isValidationTriggered, setIsValidationTriggered] = useState(false);

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
        setStep('signup');
    };

    const handleSignupClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (!isSignupValid) {
            setIsValidationTriggered(true);
            setRegisterError('Please fill in all required information correctly.');
            return;
        }

        handleSignup(e as any);
    };

    const handleSignup = async (e: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsSubmitting(true);
        setRegisterError('');
        setIsValidationTriggered(false);

        try {
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: selectedRole as any, // Cast to Role type (defined in AuthContext or Types)
                provinceId: formData.provinceId,
                cityId: formData.cityId,
                whatsapp: formData.whatsapp
            };

            await register(userData);
            // After successful registration, user.sipId should be available in the updated auth context
            // But immediate update might depend on context refresh. 
            // The register function in AuthContext updates the user state directly.
            setStep('reveal');
        } catch (err: any) {
            // Extract error message if available
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setRegisterError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteOnboarding = (e: React.MouseEvent) => {
        // Trigger wave animation
        const rect = e.currentTarget.getBoundingClientRect();
        triggerWave(rect.x + rect.width / 2, rect.y + rect.height / 2);

        // Wait for wave before navigating
        setTimeout(() => {
            navigate('/');
        }, 4000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {/* Step 0: Greeting / Landing */}
                {step === 'greeting' && (
                    <motion.div
                        key="greeting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        className="relative w-full max-w-[800px] p-6 sm:p-10 text-center rounded-3xl bg-dark-900/70 backdrop-blur-md border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10"
                    >
                        {/* Logo & Brand Lockup */}
                        <div className="flex items-center justify-center gap-6 mb-8 transform hover:scale-105 transition-transform duration-500">
                            {/* Logo */}
                            <div
                                className={`w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] relative flex justify-center items-center shadow-2xl transition-all duration-1000 ease-out ${logoGlow
                                    ? 'drop-shadow-[0_0_50px_rgba(251,191,36,0.8)] bg-amber-500/20'
                                    : 'bg-white/5'
                                    }`}
                                style={{
                                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                }}
                            >
                                <div className="w-[90%] h-[90%] p-2 flex items-center justify-center">
                                    <HexLogo />
                                </div>
                            </div>

                            {/* Csystem Text */}
                            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                Csystem
                            </h1>
                        </div>

                        <p className="text-3xl md:text-5xl text-white mb-8 leading-tight font-bold">
                            <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">S</span>istem{' '}
                            <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">I</span>ntegrasi{' '}
                            <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">P</span>anahan
                            <br />
                            <span className="text-sm md:text-lg text-dark-400 font-normal mt-2 block">Menghubungkan ekosistem, meningkatkan performa.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <motion.button
                                whileHover={{ scale: 1.05, translateY: -2, boxShadow: '0 0 35px rgba(34,211,238,0.6)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStep('role')}
                                className="inline-block px-8 py-3 text-lg font-bold text-dark-950 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 border border-cyan-400/50"
                            >
                                MULAI SEKARANG
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    triggerWave(rect.x + rect.width / 2, rect.y + rect.height / 2);

                                    // Sequence: Wave (0-3s) -> Logo Glow (starts at 3s) -> Navigate (5s)
                                    setTimeout(() => {
                                        setLogoGlow(true);
                                    }, 3000); // Wait for wave to finish (3s)

                                    setTimeout(() => {
                                        navigate('/login');
                                    }, 4000); // Navigate after 4s total
                                }}
                                className="px-8 py-3 text-lg font-medium text-blue-400 border border-blue-500 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] bg-transparent"
                            >
                                Masuk ke Akun
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {step !== 'greeting' && (
                <div className="w-full max-w-4xl relative z-10">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {['role', 'signup', 'reveal'].map((s, i) => {
                            const steps: OnboardingStep[] = ['role', 'signup', 'reveal'];
                            const currentIndex = steps.indexOf(step as OnboardingStep);
                            const stepIndex = steps.indexOf(s as OnboardingStep);

                            return (
                                <div key={s} className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full transition-colors ${step === s ? 'bg-primary-500' :
                                        currentIndex > stepIndex ? 'bg-primary-500/50' : 'bg-dark-700'
                                        } `} />
                                    {i < 2 && <div className={`w-8 h-0.5 ${currentIndex > stepIndex ? 'bg-primary-500/50' : 'bg-dark-700'
                                        } `} />}
                                </div>
                            )
                        })}
                    </div>

                    <AnimatePresence mode="wait">

                        {/* Step 1: Role Selection */}
                        {step === 'role' && (
                            <motion.div
                                key="role"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="text-center mb-6">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 flex items-center justify-center shadow-lg">
                                            <img src="/logo.png" alt="SIP Logo" className="w-10 h-10 object-contain" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Select Your Role</h2>
                                    <p className="text-dark-400">Choose the role that best describes you</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-[50vh] overflow-y-auto p-1">
                                    {ROLE_CARDS.map((role) => {
                                        const Icon = role.icon;
                                        const isSelected = selectedRole === role.role;
                                        return (
                                            <motion.button
                                                key={role.role}
                                                onClick={() => handleRoleSelect(role.role)}
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? 'border-primary-500 bg-primary-500/10'
                                                    : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
                                                    } `}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                                                        <Icon size={20} className="text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-sm">{role.label}</h3>
                                                        </div>
                                                        <p className="text-xs text-dark-400 mt-1 line-clamp-2">{role.description}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <Check size={18} className="text-primary-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-center">
                                    <p className="text-xs text-dark-500">Tap a card to continue</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Signup & Location */}
                        {step === 'signup' && (
                            <motion.div
                                key="signup"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="text-center mb-8">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 flex items-center justify-center shadow-lg">
                                            <img src="/logo.png" alt="SIP Logo" className="w-10 h-10 object-contain" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                                    <div className="flex items-center justify-center gap-2 text-primary-400 mb-2">
                                        <span className="text-sm font-semibold bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                                            Role: {selectedRole}
                                        </span>
                                    </div>
                                    <p className="text-dark-400">Identity details must match your KTP/KK</p>
                                </div>

                                <form className="max-w-md mx-auto space-y-4">
                                    {registerError && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            {registerError}
                                        </div>
                                    )}

                                    <div>
                                        <label className="label">Full Name (Sesuai KTP/KK)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="input w-full"
                                            placeholder="e.g. Budi Santoso"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="input w-full"
                                            placeholder="name@example.com"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    className="input w-full pr-10"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-dark-500 mt-1">Minimum 8 characters</p>
                                        </div>
                                        <div>
                                            <label className="label">Confirm</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    required
                                                    value={formData.confirmPassword}
                                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className="input w-full pr-10"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-dark-800 my-4 pt-4">
                                        <h3 className="text-sm font-semibold text-dark-300 mb-3 block">Residential Location (Sesuai KTP/KK)</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="label">Province</label>
                                                <select
                                                    required
                                                    value={formData.provinceId}
                                                    onChange={(e) => setFormData({ ...formData, provinceId: e.target.value, cityId: '' })}
                                                    className="input w-full"
                                                >
                                                    <option value="">Select Province</option>
                                                    {sortedProvinces.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="label">City/Regency</label>
                                                <select
                                                    required
                                                    value={formData.cityId}
                                                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                                    disabled={!formData.provinceId}
                                                    className="input w-full disabled:opacity-50"
                                                >
                                                    <option value="">Select City</option>
                                                    {cities.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">
                                            <Phone size={14} className="inline mr-1" />
                                            WhatsApp Number
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="tel"
                                                value={formData.whatsapp}
                                                onChange={(e) => {
                                                    // Allow digits only
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setFormData({ ...formData, whatsapp: val });
                                                }}
                                                placeholder="e.g. 081234567890"
                                                className="input w-full"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-dark-500 mt-1">
                                            Active WhatsApp number for verification.
                                        </p>
                                    </div>

                                    <div className="flex justify-between pt-4 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep('role')}
                                            className="px-6 py-2.5 rounded-full border border-dark-600 text-dark-400 hover:text-white hover:border-dark-400 hover:bg-dark-800/50 transition-all duration-300"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSignupClick}
                                            disabled={isSubmitting}
                                            className={`px-8 py-2.5 rounded-full font-bold transition-all duration-300 flex items-center gap-2 ${!isSignupValid && isValidationTriggered
                                                ? 'bg-transparent border-2 border-primary-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] text-primary-400 hover:bg-primary-500/10'
                                                : isSubmitting
                                                    ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-cyan-400 to-blue-600 text-dark-950 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:scale-105'
                                                }`}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Account'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}


                        {/* Step 3: Reveal SIP ID (and finish) */}
                        {step === 'reveal' && (
                            <motion.div
                                key="reveal"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold mb-2 text-primary-400">Welcome Aboard!</h2>
                                    <p className="text-dark-400">Your account has been successfully created.</p>
                                </div>

                                <div className="max-w-md mx-auto space-y-8 text-center">
                                    <div className="p-8 bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl border border-dark-700 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-primary-500/10 blur-xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
                                        <p className="text-sm text-dark-400 mb-2 relative z-10">Your Official SIP ID</p>
                                        <p className="text-4xl md:text-5xl font-mono font-bold text-white tracking-wider relative z-10 shadow-black drop-shadow-lg">
                                            {previewSipId || user?.sipId || 'Loading...'}
                                        </p>
                                        <div className="mt-4 flex justify-center gap-2 relative z-10">
                                            <span className="badge badge-primary">{selectedRole}</span>
                                            <span className="badge badge-outline border-dark-600 text-dark-300">
                                                {cities.find(c => c.id === formData.cityId)?.name}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCompleteOnboarding}
                                        className="btn-primary w-full py-4 text-lg shadow-lg shadow-primary-500/20 transition-all hover:scale-105"
                                    >
                                        Go to Dashboard
                                        <ChevronRight size={20} className="inline ml-2" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            logout();
                                            setStep('role');
                                            setSelectedRole(null);
                                            setPreviewSipId(null);
                                            setFormData({
                                                name: '', email: '', password: '', confirmPassword: '',
                                                provinceId: '', cityId: '', whatsapp: ''
                                            });
                                        }}
                                        className="text-xs text-dark-500 hover:text-primary-400 transition-colors mt-4 block mx-auto"
                                    >
                                        Not you? Sign out and start over
                                    </button>

                                    <p className="text-xs text-dark-500 mt-2">
                                        Please verify your WhatsApp via the link sent to you later.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
