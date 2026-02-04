import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
    Shield, Target, Briefcase, HeartHandshake, Dumbbell,
    Scale, Calendar, Package, ChevronRight,
    Phone, Check, Loader2, GraduationCap, Eye, EyeOff, ArrowRight,
    User, Mail, Lock, Trophy, MapPin, Activity
} from 'lucide-react';
import { PROVINCES, getCitiesByProvince } from '@/modules/core/types/territoryData';
import { useAuth, api } from '@/modules/core/contexts/AuthContext';
import { useBackgroundEffect } from '@/modules/core/contexts/BackgroundEffectContext';
import AnimatedHexLogo from '@/modules/core/components/ui/AnimatedHexLogo';
import SIPText from '@/modules/core/components/ui/SIPText';


// Role cards configuration - Codes 01-09 (00 SuperAdmin not selectable by users)

const ROLE_CARDS = [
    { code: '01', role: 'PERPANI', icon: Shield, label: 'Perpani', description: 'National archery federation member', color: 'text-red-400', glow: 'drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]', bg: 'bg-red-500/10 border-red-500/20' },
    { code: '02', role: 'CLUB', icon: Briefcase, label: 'Club', description: 'Archery club owner or manager', color: 'text-amber-400', glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]', bg: 'bg-amber-500/10 border-amber-500/20' },
    { code: '03', role: 'SCHOOL', icon: GraduationCap, label: 'School', description: 'School or educational institution', color: 'text-emerald-400', glow: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { code: '04', role: 'ATHLETE', icon: Target, label: 'Athlete', description: 'Registered athlete or archer', color: 'text-blue-400', glow: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]', bg: 'bg-blue-500/10 border-blue-500/20' },
    { code: '05', role: 'PARENT', icon: HeartHandshake, label: 'Parent', description: 'Parent or guardian of athlete', color: 'text-purple-400', glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', bg: 'bg-purple-500/10 border-purple-500/20' },
    { code: '06', role: 'COACH', icon: Dumbbell, label: 'Coach', description: 'Archery coach or trainer', color: 'text-green-400', glow: 'drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]', bg: 'bg-green-500/10 border-green-500/20' },
    { code: '07', role: 'JUDGE', icon: Scale, label: 'Judge', description: 'Competition judge or referee', color: 'text-indigo-400', glow: 'drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { code: '08', role: 'EO', icon: Calendar, label: 'Event Organizer', description: 'Event organizer', color: 'text-teal-400', glow: 'drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]', bg: 'bg-teal-500/10 border-teal-500/20' },
    { code: '09', role: 'SUPPLIER', icon: Package, label: 'Supplier', description: 'Equipment supplier or vendor', color: 'text-rose-400', glow: 'drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]', bg: 'bg-rose-500/10 border-rose-500/20' },
];

type OnboardingStep = 'greeting' | 'role' | 'signup' | 'reveal';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { user, register, logout } = useAuth();
    const { triggerWave } = useBackgroundEffect();
    // State initialization with deep-link support
    const [step, setStep] = useState<OnboardingStep>(() => {
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        const stepParam = params.get('step');
        const refAthleteId = params.get('ref_athlete_id');

        console.log('[Onboarding] Initializing step. Params:', { role: roleParam, step: stepParam });

        // Role Param takes priority for jumping directly to signup
        if (roleParam) {
            const roleExists = ROLE_CARDS.find(r => r.role === roleParam.toUpperCase());
            if (roleExists) {
                console.log('[Onboarding] Role detected, jumping to signup:', roleExists.role);
                return 'signup';
            }
        }

        if (refAthleteId) {
            return 'signup';
        }

        if (stepParam && ['greeting', 'role', 'signup', 'reveal'].includes(stepParam)) {
            return stepParam as OnboardingStep;
        }
        return 'greeting';
    });

    const [selectedRole, setSelectedRole] = useState<string | null>(() => {
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        const refAthleteId = params.get('ref_athlete_id');

        if (roleParam) {
            const roleExists = ROLE_CARDS.find(r => r.role === roleParam.toUpperCase());
            if (roleExists) return roleExists.role;
        }

        if (refAthleteId) return 'PARENT';

        // Direct 'reveal' step for demo/testing
        if (params.get('step') === 'reveal') return 'ATHLETE';

        return null;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const prefillName = params.get('prefill_name');
        const prefillWa = params.get('prefill_wa');
        const name = params.get('name');
        const phone = params.get('phone');

        return {
            name: name ? decodeURIComponent(name) : (prefillName ? decodeURIComponent(prefillName) : ''),
            email: '',
            password: '',
            confirmPassword: '',
            provinceId: '',
            cityId: '',
            whatsapp: phone ? decodeURIComponent(phone) : (prefillWa ? decodeURIComponent(prefillWa) : '')
        };
    });
    const [previewcoreId, setPreviewcoreId] = useState<string | null>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('step') === 'reveal' ? '04.1101.9999' : null;
    });
    const [isCompleting, setIsCompleting] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [consents, setConsents] = useState({
        privacy: false,
        data_processing: false,
        marketing: false
    });

    // Redirect already logged-in users to dashboard, UNLESS they are in the reveal stage or have deep links
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hasDeepLink = params.has('step') || params.has('role') || params.has('childId') || params.has('link_child') || params.has('ref_athlete_id');

        if (user && step !== 'reveal' && !isCompleting && !hasDeepLink) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, step, navigate, isCompleting]);

    // Multi-role: existing email detection
    const [showExistingEmailModal, setShowExistingEmailModal] = useState(false);
    const [existingUserData, setExistingUserData] = useState<{ name: string; currentRoles: string[] } | null>(null);

    const sortedProvinces = useMemo(() => {
        return [...PROVINCES].sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const childIdParam = params.get('ref_athlete_id') || params.get('childId') || params.get('link_child');

        if (childIdParam) {
            localStorage.setItem('pending_child_link', childIdParam);
            console.log('[Onboarding] Persisted child link:', childIdParam);
        }
    }, []);

    const cities = useMemo(() => {
        if (!formData.provinceId) return [];
        return getCitiesByProvince(formData.provinceId);
    }, [formData.provinceId]);

    const [isValidationTriggered, setIsValidationTriggered] = useState(false);

    // Core validation logic (independent of UI trigger)
    const validateField = (field: string, value: any) => {
        switch (field) {
            case 'name': return !value.name ? 'Full name is required' : null;
            case 'email': {
                if (!value.email) return 'Email is required';
                if (!/\S+@\S+\.\S+/.test(value.email)) return 'Invalid email format';
                return null;
            }
            case 'password': {
                if (!value.password) return 'Password is required';
                if (value.password.length < 8) return 'Min. 8 characters required';
                return null;
            }
            case 'confirmPassword': {
                if (!value.confirmPassword) return 'Please confirm your password';
                if (value.password !== value.confirmPassword) return 'Passwords do not match';
                return null;
            }
            case 'provinceId': return !value.provinceId ? 'Please select a province' : null;
            case 'cityId': return !value.cityId ? 'Please select a city' : null;
            case 'whatsapp': {
                if (!value.whatsapp) return 'WhatsApp number is required';
                if (value.whatsapp.length < 10) return 'Invalid phone number';
                return null;
            }
            default: return null;
        }
    };

    // UI-aware error getter (respects current state)
    const getFieldError = (field: string) => {
        if (!isValidationTriggered) return null;
        return validateField(field, formData);
    };

    // Real validity check (Checks actual data)
    const isSignupValid = useMemo(() => {
        const hasFieldErrors =
            validateField('name', formData) ||
            validateField('email', formData) ||
            validateField('password', formData) ||
            validateField('confirmPassword', formData) ||
            validateField('provinceId', formData) ||
            validateField('cityId', formData) ||
            validateField('whatsapp', formData);

        return !hasFieldErrors && consents.privacy && consents.data_processing;
    }, [formData, consents]);

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
        setStep('signup');
    };

    const handleSignupClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        // Trigger UI validation feedback
        setIsValidationTriggered(true);

        if (!isSignupValid) {
            const firstError =
                validateField('name', formData) || validateField('whatsapp', formData) ||
                validateField('email', formData) || validateField('password', formData) ||
                validateField('cityId', formData);

            if (firstError) {
                setRegisterError(`Lengkapi formulir: ${firstError}`);
            } else if (!consents.privacy || !consents.data_processing) {
                setRegisterError('Harap centang persetujuan mandatory (Syarat & Ketentuan serta Izin Pemrosesan Data).');
            } else {
                setRegisterError('Data belum lengkap atau persetujuan belum dicentang.');
            }

            // Visual feedback - wave effect to grab attention (center screen)
            triggerWave(window.innerWidth / 2, window.innerHeight / 2);
            return;
        }

        // Check if email already exists (multi-role flow)
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
            const res = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(formData.email)}`);
            const data = await res.json();

            if (data.success && data.data?.exists) {
                // Email exists - show modal to redirect to add-role
                setExistingUserData({ name: data.data.name, currentRoles: data.data.currentRoles });
                setShowExistingEmailModal(true);
                return;
            }
        } catch (err: any) {
            console.log('Email check skipped or error:', err);
        }

        handleSignup(e as any);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setRegisterError('');
        setIsValidationTriggered(false);

        try {
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: selectedRole as any,
                provinceId: formData.provinceId,
                cityId: formData.cityId,
                whatsapp: formData.whatsapp,
                childId: localStorage.getItem('pending_child_link') || undefined,
                refAthleteId: localStorage.getItem('pending_child_link') || undefined
            };

            await register(userData);
            localStorage.removeItem('pending_child_link');

            // Success: Divert straight to Dashboard to prevent looping
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            console.error('[DIAGNOSTIC] Registration failed on Frontend:', err);
            const backendMessage = err.response?.data?.message;
            const validationErrors = err.response?.data?.errors;

            if (validationErrors && Array.isArray(validationErrors)) {
                setRegisterError(`Validation Error: ${validationErrors.map((e: any) => e.msg || e.message).join(', ')}`);
            } else {
                setRegisterError(backendMessage || 'Registration failed - check network or server logs');
            }

            triggerWave(window.innerWidth / 2, window.innerHeight / 2);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteOnboarding = (e: React.MouseEvent) => {
        setIsCompleting(true);

        // Trigger wave animation
        const rect = e.currentTarget.getBoundingClientRect();
        triggerWave(rect.x + rect.width / 2, rect.y + rect.height / 2);

        // Sequence of messages
        setSyncMessage('AUTHENTICATING IDENTITY...');

        setTimeout(() => setSyncMessage('CHECKING SYSTEM TIME...'), 1100);
        setTimeout(() => setSyncMessage('SYNCHRONIZING CORE DATABASE...'), 2200);
        setTimeout(() => setSyncMessage('OPENING SECURE GATEWAY...'), 3300);

        // Wait for wave before navigating
        setTimeout(() => {
            navigate('/profile', { replace: true });
        }, 4500);
    };

    // Identity verification for existing users
    const [existingUserPassword, setExistingUserPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const { login } = useAuth();

    const handleExistingUserLogin = async () => {
        if (!existingUserPassword) {
            setVerifyError('Password is required');
            return;
        }

        setIsVerifying(true);
        setVerifyError('');

        try {
            await login(formData.email, existingUserPassword);
            // Successfully logged in - redirect to add-role with the selected role
            navigate('/add-role', { state: { requestedRole: selectedRole } });
        } catch (err: any) {
            setVerifyError(err.response?.data?.message || 'Verification failed. Please check your password.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Existing Email Modal */}
            <AnimatePresence>
                {showExistingEmailModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowExistingEmailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-dark-800 border border-dark-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Email Sudah Terdaftar</h3>
                                <p className="text-dark-400 mb-4">
                                    Halo <span className="text-white font-medium">{existingUserData?.name}</span>!
                                </p>
                                <p className="text-dark-300 mb-6 text-sm">
                                    Anda sudah memiliki akun dengan peran:{' '}
                                    <span className="text-primary-400 font-semibold">
                                        {existingUserData?.currentRoles?.join(', ')}
                                    </span>.
                                    <br /><br />
                                    Untuk mengajukan peran baru sebagai <span className="text-amber-400 font-bold">{selectedRole}</span>, silakan verifikasi kata sandi Anda:
                                </p>

                                {verifyError && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded-lg text-xs mb-4">
                                        {verifyError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={existingUserPassword}
                                            onChange={(e) => setExistingUserPassword(e.target.value)}
                                            placeholder="Masukkan kata sandi Anda"
                                            className="input w-full pr-10 text-center"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleExistingUserLogin();
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleExistingUserLogin}
                                            disabled={isVerifying}
                                            className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition flex items-center justify-center gap-2"
                                        >
                                            {isVerifying ? <Loader2 className="animate-spin" size={18} /> : 'Verifikasi & Lanjut'}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="flex-1 py-3 rounded-xl bg-dark-700 text-white font-medium hover:bg-dark-600 transition text-sm"
                                            >
                                                Masuk Biasa
                                            </button>
                                            <button
                                                onClick={() => setShowExistingEmailModal(false)}
                                                className="flex-1 py-3 rounded-xl bg-transparent border border-dark-600 text-dark-300 hover:text-white transition text-sm"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                {/* Step 0: Greeting / Landing */}
                {step === 'greeting' && (
                    <motion.div
                        key="greeting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        className="relative w-full max-w-[800px] p-6 sm:p-12 text-center rounded-[3rem] bg-dark-950/40 backdrop-blur-3xl border border-white/5 shadow-2xl z-10"
                    >
                        <div className="flex items-center justify-center gap-6 mb-8 transform hover:scale-105 transition-transform duration-500">
                            {/* Standardized Animated Logo */}
                            <AnimatedHexLogo size={100} className="shadow-2xl" />

                            {/* Csystem Text */}
                            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                Csystem
                            </h1>
                        </div>

                        <div className="mb-10 text-center">
                            <SIPText size="5xl" className="md:text-7xl block mb-2" />
                            <span className="text-sm md:text-lg text-dark-400 font-normal mt-2 block">Menghubungkan ekosistem, meningkatkan performa.</span>
                        </div>

                        {/* Action Flow */}
                        <div className="flex flex-col items-center w-full">
                            {/* Panduan -> Signup (mb-4) */}
                            <div className="mb-4">
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: 1,
                                        boxShadow: [
                                            "0 0 0px rgba(251, 191, 36, 0)",
                                            "0 0 20px rgba(251, 191, 36, 0.4)",
                                            "0 0 0px rgba(251, 191, 36, 0)"
                                        ]
                                    }}
                                    transition={{
                                        boxShadow: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        },
                                        opacity: { duration: 0.5 }
                                    }}
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(251, 191, 36, 0.2)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/ecosystem-flow')}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-400 text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                                >
                                    <Activity size={14} className="animate-pulse" />
                                    PANDUAN EKOSISTEM
                                </motion.button>
                            </div>

                            {/* Signup -> Login (mb-4) */}
                            <div className="mb-4 w-full max-w-sm">
                                <motion.button
                                    whileHover={{ scale: 1.05, translateY: -2, boxShadow: '0 0 40px rgba(34,211,238,0.5)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setStep('role')}
                                    className="w-full h-14 text-lg font-black text-dark-950 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] transition-all duration-300 border border-cyan-400/30 flex items-center justify-center gap-3 group"
                                >
                                    SIGNUP
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </div>

                            {/* Login -> Beta (mb-10) */}
                            <div className="mb-10 text-center">
                                <p className="text-dark-400 font-medium tracking-tight">
                                    Sudah punya akun?{' '}
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-cyan-400 hover:text-cyan-300 font-black transition-colors underline decoration-cyan-400/30 underline-offset-8"
                                    >
                                        Login
                                    </button>
                                </p>
                            </div>

                            {/* Beta -> Footer (mb-4) */}
                            <div className="mb-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">Beta Phase 1.0</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center pb-2 flex flex-col items-center gap-2">
                                <p className="text-[10px] text-dark-600 uppercase tracking-[0.2em] font-black opacity-40">
                                    © 2026 Corelink - <SIPText size="xs" isUppercase={true} className="!tracking-[0.2em]" />. All rights reserved.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => navigate('/terms')}
                                        className="text-[9px] text-dark-500 hover:text-cyan-400 uppercase tracking-widest font-bold transition-colors"
                                    >
                                        Terms & Conditions
                                    </button>
                                    <span className="text-dark-700 text-[9px]">•</span>
                                    <button
                                        onClick={() => navigate('/privacy')}
                                        className="text-[9px] text-dark-500 hover:text-emerald-400 uppercase tracking-widest font-bold transition-colors"
                                    >
                                        Privacy Policy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {
                step !== 'greeting' && (
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
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                    className="glass rounded-[2.5rem] p-10 relative border-white/5 shadow-2xl backdrop-blur-3xl bg-dark-950/40"
                                >
                                    <div className="text-center mb-10">
                                        <div className="flex justify-center mb-8">
                                            <AnimatedHexLogo size={80} />
                                        </div>
                                        <h2 className="text-3xl font-display font-black text-white mb-2 underline decoration-cyan-400/50 underline-offset-8">Select Your Role</h2>
                                        <p className="text-dark-400 font-medium tracking-tight">Choose the role that best describes you</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-h-[50vh] overflow-y-auto p-1 scrollbar-hide">
                                        {ROLE_CARDS.map((role) => {
                                            const Icon = role.icon;
                                            const isSelected = selectedRole === role.role;
                                            return (
                                                <motion.button
                                                    key={role.role}
                                                    onClick={() => handleRoleSelect(role.role)}
                                                    className={`p-4 rounded-2xl border transition-all text-left group ${isSelected
                                                        ? 'border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                                                        : 'border-white/5 bg-dark-900/50 hover:bg-dark-900/80 hover:border-white/10'
                                                        } `}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 rounded-xl ${role.bg} flex items-center justify-center flex-shrink-0 border transition-transform duration-500 group-hover:scale-110 shadow-lg`}>
                                                            <role.icon size={22} className={`${role.color} ${role.glow}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className={`font-black tracking-tight text-sm uppercase ${isSelected ? 'text-cyan-400' : 'text-white'}`}>{role.label}</h3>
                                                            </div>
                                                            <p className="text-[10px] text-dark-500 font-medium mt-1 uppercase tracking-wider leading-relaxed">{role.description}</p>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                                                <Check size={14} className="text-dark-950 font-bold" strokeWidth={4} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-center flex-col items-center gap-4">
                                        <p className="text-[10px] text-dark-500 font-black uppercase tracking-[0.2em]">Tap a card to continue</p>
                                        <p className="text-[10px] text-dark-600 uppercase tracking-[0.2em] font-black opacity-40 flex items-center justify-center gap-1">
                                            © 2026 Corelink - <SIPText size="xs" isUppercase={true} className="!tracking-[0.2em]" />. All rights reserved.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Signup & Location */}
                            {step === 'signup' && (
                                <motion.div
                                    key="signup"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                    className="glass rounded-[2.5rem] p-8 relative border-white/5 shadow-2xl backdrop-blur-3xl bg-dark-950/40"
                                >
                                    <div className="text-center mb-6">
                                        <div className="flex justify-center mb-4">
                                            <AnimatedHexLogo size={48} />
                                        </div>
                                        <h2 className="text-2xl font-display font-black text-white mb-2 underline decoration-cyan-400/50 underline-offset-8 uppercase tracking-tight">Create Your Account</h2>
                                        <div className="flex items-center justify-center gap-2 text-cyan-400 mb-4">
                                            <span className="text-xs font-black bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 tracking-widest uppercase italic">
                                                Role: {selectedRole}
                                            </span>
                                        </div>
                                        <p className="text-dark-400 font-medium tracking-tight">Identity details must match your KTP/KK</p>
                                    </div>

                                    <form className="max-w-md mx-auto space-y-4">
                                        {registerError && (
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2 animate-pulse whitespace-pre-wrap">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                {registerError}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-black text-dark-500 ml-1">Full Name (Sesuai KTP/KK)</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                                        <User size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        className={`input pl-11 h-12 bg-dark-950/40 border-white/5 focus:border-cyan-400/50 hover:border-white/10 transition-all rounded-xl w-full text-sm ${getFieldError('name') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''} ${new URLSearchParams(window.location.search).get('prefill_name') ? 'border-cyan-400/30 bg-cyan-400/5' : ''}`}
                                                        placeholder="e.g. Budi Santoso"
                                                    />
                                                </div>
                                                {new URLSearchParams(window.location.search).get('prefill_name') && !getFieldError('name') && (
                                                    <p className="text-[9px] text-cyan-400/60 ml-1 mt-0.5 italic font-medium">✨ Nama sudah terisi otomatis</p>
                                                )}
                                                {getFieldError('name') && <p className="text-[10px] text-red-500 ml-1 animate-fade-in font-bold">{getFieldError('name')}</p>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-black text-dark-500 ml-1">WhatsApp Number</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                                        <Phone size={18} />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={formData.whatsapp}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            setFormData({ ...formData, whatsapp: val });
                                                        }}
                                                        placeholder="08xxxxxxxxxx"
                                                        className={`input pl-11 h-12 bg-dark-950/40 border-white/5 focus:border-cyan-400/50 hover:border-white/10 transition-all rounded-xl w-full text-sm ${getFieldError('whatsapp') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''} ${new URLSearchParams(window.location.search).get('prefill_wa') ? 'border-cyan-400/30 bg-cyan-400/5' : ''}`}
                                                    />
                                                </div>
                                                {new URLSearchParams(window.location.search).get('prefill_wa') && !getFieldError('whatsapp') && (
                                                    <p className="text-[9px] text-cyan-400/60 ml-1 mt-0.5 italic font-medium">✨ WhatsApp sudah terisi otomatis</p>
                                                )}
                                                {getFieldError('whatsapp') && <p className="text-[10px] text-red-500 ml-1 animate-fade-in font-bold">{getFieldError('whatsapp')}</p>}
                                            </div>
                                        </div>


                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-dark-500 ml-1">Email Address</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                                    <Mail size={18} />
                                                </div>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className={`input pl-11 h-12 bg-dark-950/40 border-white/5 focus:border-cyan-400/50 hover:border-white/10 transition-all rounded-xl w-full text-sm ${getFieldError('email') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                                    placeholder="name@example.com"
                                                />
                                            </div>
                                            {getFieldError('email') && <p className="text-[10px] text-red-500 ml-1 animate-fade-in font-bold">{getFieldError('email')}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-black text-dark-500 ml-1">Password</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                                        <Lock size={18} />
                                                    </div>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        required
                                                        value={formData.password}
                                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                        className={`input pl-11 pr-10 h-12 bg-dark-950/40 border-white/5 focus:border-cyan-400/50 hover:border-white/10 transition-all rounded-xl w-full text-sm ${getFieldError('password') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-cyan-400 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {getFieldError('password') && <p className="text-[10px] text-red-500 ml-1 animate-fade-in font-bold">{getFieldError('password')}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-black text-dark-500 ml-1">Confirm Password</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                                        <Lock size={18} />
                                                    </div>
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        required
                                                        value={formData.confirmPassword}
                                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                        className={`input pl-11 pr-10 h-12 bg-dark-950/40 border-white/5 focus:border-cyan-400/50 hover:border-white/10 transition-all rounded-xl w-full text-sm ${getFieldError('confirmPassword') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-cyan-400 transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {getFieldError('confirmPassword') && <p className="text-[10px] text-red-500 ml-1 animate-fade-in font-bold">{getFieldError('confirmPassword')}</p>}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/5 my-4 pt-4">
                                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-cyan-400/70 mb-3 block text-center">Residential Location</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase tracking-widest font-black text-dark-500 ml-1">Province</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                                            <MapPin size={18} />
                                                        </div>
                                                        <select
                                                            required
                                                            value={formData.provinceId}
                                                            onChange={(e) => setFormData({ ...formData, provinceId: e.target.value, cityId: '' })}
                                                            className={`input pl-11 h-12 bg-dark-950/40 border-white/5 focus:border-cyan-400/50 hover:border-white/10 transition-all rounded-xl w-full appearance-none cursor-pointer text-sm ${getFieldError('provinceId') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                                        >
                                                            <option value="" className="bg-dark-900">Select Province</option>
                                                            {sortedProvinces.map(p => (
                                                                <option key={p.id} value={p.id} className="bg-dark-900">{p.name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-500">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>
                                                    {getFieldError('provinceId') && <p className="text-[10px] text-red-500 ml-1 animate-fade-in font-bold">{getFieldError('provinceId')}</p>}
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase tracking-widest font-black text-dark-500 ml-1">City/Regency</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                                            <MapPin size={18} />
                                                        </div>
                                                        <select
                                                            required
                                                            value={formData.cityId}
                                                            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                                            disabled={!formData.provinceId}
                                                            className={`input pl-11 h-12 bg-dark-950/40 border-white/5 focus:border-cyan-400/50 hover:border-white/10 transition-all rounded-xl w-full appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-sm ${getFieldError('cityId') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                                        >
                                                            <option value="" className="bg-dark-900">Select City</option>
                                                            {cities.map(c => (
                                                                <option key={c.id} value={c.id} className="bg-dark-900">{c.name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-500">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>
                                                    {getFieldError('cityId') && <p className="text-[10px] text-red-500 ml-1 animate-fade-in font-bold">{getFieldError('cityId')}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`space-y-3 py-4 border-t border-white/5 mt-4 transition-all duration-500 rounded-2xl ${isValidationTriggered && (!consents.privacy || !consents.data_processing) ? 'bg-red-500/5 ring-1 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)] p-3 -mx-3' : ''}`}>
                                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-400/70 mb-2 block text-center">Persetujuan & Privasi (UU PDP)</h3>

                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={consents.privacy}
                                                    onChange={e => setConsents({ ...consents, privacy: e.target.checked })}
                                                    className="mt-1 w-4 h-4 rounded border-white/10 bg-dark-900 checked:bg-emerald-500 transition-all cursor-pointer accent-emerald-500"
                                                />
                                                <span className="text-[11px] text-dark-300 group-hover:text-white transition-colors leading-relaxed">
                                                    Saya menyetujui <a href="/terms" target="_blank" className="text-emerald-400 underline decoration-emerald-400/30">Syarat & Ketentuan</a> serta <a href="/privacy" target="_blank" className="text-emerald-400 underline decoration-emerald-400/30">Kebijakan Privasi</a> Csystem.
                                                </span>
                                            </label>

                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={consents.data_processing}
                                                    onChange={e => setConsents({ ...consents, data_processing: e.target.checked })}
                                                    className="mt-1 w-4 h-4 rounded border-white/10 bg-dark-900 checked:bg-emerald-500 transition-all cursor-pointer accent-emerald-500"
                                                />
                                                <span className="text-[11px] text-dark-300 group-hover:text-white transition-colors leading-relaxed">
                                                    Saya memberikan izin eksplisit untuk pemrosesan data pribadi saya (termasuk NIK) untuk keperluan sistem olahraga terintegrasi sesuai UU PDP Nomor 27 Tahun 2022.
                                                </span>
                                            </label>

                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={consents.marketing}
                                                    onChange={e => setConsents({ ...consents, marketing: e.target.checked })}
                                                    className="mt-1 w-4 h-4 rounded border-white/10 bg-dark-900 checked:bg-emerald-500 transition-all cursor-pointer accent-emerald-500"
                                                />
                                                <span className="text-[11px] text-dark-300 group-hover:text-white transition-colors leading-relaxed">
                                                    (Opsional) Saya bersedia menerima informasi pembaruan, promosi, dan jadwal kompetisi melalui WhatsApp atau Email.
                                                </span>
                                            </label>
                                        </div>

                                        <div className="pt-4 flex flex-col gap-3">
                                            <button
                                                type="button"
                                                onClick={handleSignupClick}
                                                disabled={isSubmitting}
                                                className={`
                                                    w-full h-12 text-lg font-black rounded-xl transition-all duration-500 flex items-center justify-center gap-3 group
                                                    ${isSignupValid
                                                        ? 'text-dark-950 bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] active:scale-95'
                                                        : 'bg-dark-800 text-dark-500 border border-white/5 cursor-pointer opacity-80'
                                                    }
                                                    disabled:opacity-30 disabled:grayscale
                                                `}
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 className="animate-spin" size={24} />
                                                ) : (
                                                    <>
                                                        CREATE ACCOUNT
                                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setStep('role')}
                                                className="text-cyan-400 hover:text-cyan-300 transition-colors text-xs font-black uppercase tracking-widest underline decoration-cyan-400/30 underline-offset-4"
                                            >
                                                &larr; Back to select role
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}


                            {/* Step 3: Reveal CORE ID (and finish) */}
                            {step === 'reveal' && (
                                <motion.div
                                    key="reveal"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                    className="glass rounded-[2.5rem] p-10 relative border-white/5 shadow-2xl backdrop-blur-3xl bg-dark-950/40"
                                >
                                    <div className="text-center mb-10">
                                        <div className="flex justify-center mb-8">
                                            <div className="w-20 h-20 rounded-full bg-cyan-400/20 flex items-center justify-center border border-cyan-400/30 animate-pulse">
                                                <Check size={40} className="text-cyan-400" strokeWidth={3} />
                                            </div>
                                        </div>
                                        <h2 className="text-3xl font-display font-black text-white mb-2 underline decoration-cyan-400/50 underline-offset-8 uppercase tracking-tight">Welcome Aboard!</h2>
                                        <p className="text-dark-400 font-medium tracking-tight">Your account has been successfully created.</p>
                                    </div>

                                    <div className="max-w-md mx-auto space-y-8 text-center">
                                        <div className="p-8 bg-dark-950/60 rounded-[2rem] border border-white/5 shadow-inner relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all duration-700"></div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-dark-500 mb-4 relative z-10">Your Official CORE ID</p>
                                            <p className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-wider relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                                {previewcoreId || user?.coreId || 'Loading...'}
                                            </p>
                                            <div className="mt-6 flex flex-wrap justify-center gap-3 relative z-10">
                                                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest italic">{selectedRole}</span>
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-dark-300 text-[10px] font-black uppercase tracking-widest">
                                                    {cities.find(c => c.id === formData.cityId)?.name}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-dark-950/50 border border-white/5 text-dark-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar size={10} className="text-cyan-400" />
                                                    {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            {/* Standardized Active Signal - Matched with Club 'Not Assigned' style */}
                                            {!isCompleting && (
                                                <motion.div
                                                    className="absolute -inset-[1px] rounded-2xl border-2 border-amber-400/50 z-0 pointer-events-none"
                                                    animate={{
                                                        opacity: [0.1, 0.8, 0.1],
                                                        boxShadow: [
                                                            "0 0 0px rgba(251, 191, 36, 0)",
                                                            "0 0 20px rgba(251, 191, 36, 0.4)",
                                                            "0 0 0px rgba(251, 191, 36, 0)"
                                                        ]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                            )}

                                            <button
                                                onClick={handleCompleteOnboarding}
                                                disabled={isCompleting}
                                                className={`
                                                w-full h-14 text-lg font-black text-dark-950 
                                                bg-gradient-to-r from-cyan-400 to-blue-600 
                                                rounded-2xl flex items-center justify-center gap-3 
                                                relative overflow-hidden z-10 
                                                border border-amber-400/20
                                                shadow-[0_0_15px_rgba(34,211,238,0.2)]
                                            `}
                                            >
                                                {/* Subtle internal pulse */}
                                                {!isCompleting && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-white/10"
                                                        animate={{ opacity: [0, 0.2, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                    />
                                                )}

                                                {isCompleting ? (
                                                    <div className="flex flex-col items-center justify-center w-full">
                                                        <div className="flex items-center gap-3">
                                                            <Loader2 className="animate-spin" size={24} />
                                                            <span>{syncMessage}</span>
                                                        </div>
                                                        {/* Visual progress bar inside button */}
                                                        <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
                                                            <motion.div
                                                                className="h-full bg-white"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: '100%' }}
                                                                transition={{ duration: 4.5, ease: "linear" }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        ENTER
                                                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="pt-4 flex flex-col items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setStep('role');
                                                    setSelectedRole(null);
                                                    setPreviewcoreId(null);
                                                    setFormData({
                                                        name: '', email: '', password: '', confirmPassword: '',
                                                        provinceId: '', cityId: '', whatsapp: ''
                                                    });
                                                }}
                                                className="text-[10px] uppercase font-black tracking-widest text-dark-500 hover:text-cyan-400 transition-colors underline decoration-dark-500/30 underline-offset-8"
                                            >
                                                Not you? Sign out and start over
                                            </button>

                                            <p className="text-[10px] text-dark-600 uppercase font-bold tracking-widest leading-relaxed">
                                                Please verify your WhatsApp via the link<br />sent to you later.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            }
        </div >
    );
}

