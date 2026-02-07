import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, User, Building2, MapPin, Calendar, QrCode as QrIcon, AlertCircle, Info, ArrowRight } from 'lucide-react';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import AnimatedHexLogo from '../components/ui/AnimatedHexLogo';
import SIPText from '../components/ui/SIPText';
import { ClubStatusResponse, getClubStatus } from '../services/profileApi';
import { useLocations } from '../hooks/useLocations';
import ProfileCompletionModal from '../components/profile/ProfileCompletionModal';

import { formatAge } from '../utils/ageCalculator';

const IdentityDashboard = () => {
    const { user } = useAuth();
    const { profile, isLoading } = useProfile();
    const navigate = useNavigate();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [clubStatus, setClubStatus] = useState<ClubStatusResponse | null>(null);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

    // Check for profile completion and open modal if needed
    useEffect(() => {
        if (!isLoading && profile?.user) {
            const age = profile.user.dateOfBirth ? formatAge(profile.user.dateOfBirth) : null;
            const isUnderAge = age !== null && age < 18;

            const isComplete = (isUnderAge ? true : profile.user.nik) &&
                profile.user.dateOfBirth &&
                profile.user.gender &&
                profile.user.provinceId &&
                profile.user.cityId &&
                profile.user.isStudent !== undefined && profile.user.isStudent !== null;

            if (!isComplete) {
                // Small delay for better UX
                const timer = setTimeout(() => setIsCompletionModalOpen(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [profile, isLoading]);

    useEffect(() => {
        const generateQr = async () => {
            if (user?.coreId) {
                // Use the Unified Verification Gateway URL for the QR
                const verificationUrl = `${window.location.origin}/verify/${user.coreId}`;
                const url = await QRCode.toDataURL(verificationUrl, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#0f172a',
                        light: '#ffffff'
                    }
                });
                setQrCodeUrl(url);
            }
        };
        generateQr();
    }, [user?.coreId]);

    useEffect(() => {
        const shouldFetch = user?.role === 'CLUB' || user?.role === 'ATHLETE' || user?.role === 'COACH' || user?.role === 'PARENT';
        if (!shouldFetch) return;

        getClubStatus()
            .then(setClubStatus)
            .catch(() => {
                setClubStatus(null);
            });
    }, [user?.role]);


    // In real scenario, check user.status or dpaStatus

    const { getProvinceName, getCityName, isLoadingProvinces, isLoadingCities } = useLocations(profile?.user?.provinceId, profile?.user?.cityId);

    // Determine location display string
    const provinceName = profile?.user?.provinceId ? getProvinceName(profile.user.provinceId) : '';
    const cityName = profile?.user?.cityId ? getCityName(profile.user.cityId) : '';

    const locationDisplay = (isLoadingProvinces || isLoadingCities)
        ? 'Resolving Location...'
        : (provinceName && cityName)
            ? `${cityName}, ${provinceName}`
            : provinceName
                ? `${provinceName}`
                : profile?.user?.provinceId || profile?.user?.cityId
                    ? 'Loading Location...'
                    : 'Location Not Set';

    return (
        <div className="min-h-screen bg-dark-950 p-4 md:p-8 flex flex-col items-center">

            {/* Header Area */}
            <div className="text-center mb-10 w-full max-w-2xl">
                <div className="flex justify-center mb-6">
                    <AnimatedHexLogo size="w-20 h-20" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    <SIPText size="3xl">Sistem Integrasi Panahan</SIPText>
                </h1>
                <p className="text-dark-400">Identity Command Center</p>
            </div>

            {/* Membership Alerts */}
            {clubStatus && (
                <div className="w-full max-w-4xl mb-6 flex flex-col gap-4">
                    {/* Athlete's Own Alerts (Only if role is ATHLETE) */}
                    {user?.role === 'ATHLETE' && (
                        <>
                            {clubStatus.status === 'NO_CLUB' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-amber-200 font-bold">Belum Terdaftar di Klub</h3>
                                            <p className="text-amber-200/60 text-sm">Bergabunglah dengan klub untuk mulai berpartisipasi dalam event dan latihan resmi.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile?tab=ROLE')}
                                        className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold rounded-xl transition-all whitespace-nowrap"
                                    >
                                        <span>Cari Klub</span>
                                        <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {clubStatus.status === 'PENDING' && clubStatus.pendingRequest && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 flex items-center gap-4"
                                >
                                    <div className="p-2 bg-primary-500/20 rounded-lg text-primary-500">
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-primary-200 font-bold">Menunggu Persetujuan Klub</h3>
                                        <p className="text-primary-200/60 text-sm">
                                            Permintaan bergabung dengan <span className="text-primary-300 font-bold">{clubStatus.pendingRequest.club.name}</span> sedang diproses oleh admin klub.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}

                    {/* Parent's Child Alerts (Only if role is PARENT) */}
                    {user?.role === 'PARENT' && clubStatus.athleteStatuses && clubStatus.athleteStatuses.map((as) => (
                        <React.Fragment key={as.athleteId}>
                            {as.status === 'NO_CLUB' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-amber-200 font-bold">{as.athleteName} Belum Punya Klub</h3>
                                            <p className="text-amber-200/60 text-sm">Anak Anda perlu terdaftar di klub untuk bisa berpartisipasi dalam kegiatan resmi.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile?tab=INTEGRASI')}
                                        className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold rounded-xl transition-all whitespace-nowrap"
                                    >
                                        <span>Pilih Klub</span>
                                        <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {as.status === 'PENDING' && as.pendingRequest && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 flex items-center gap-4"
                                >
                                    <div className="p-2 bg-primary-500/20 rounded-lg text-primary-500">
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-primary-200 font-bold">Menunggu Persetujuan ({as.athleteName})</h3>
                                        <p className="text-primary-200/60 text-sm">
                                            Permintaan <span className="text-primary-300 font-bold">{as.athleteName}</span> bergabung dengan <span className="text-primary-300 font-bold">{as.pendingRequest.club.name}</span> sedang diproses.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Main Identity Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden w-full max-w-4xl shadow-2xl relative"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-primary-500 to-amber-500" />

                <div className="flex flex-col md:flex-row">
                    {/* Left Column: QR & Status */}
                    <div className="w-full md:w-1/3 bg-dark-800/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-dark-700">
                        <div className="relative group cursor-pointer transition-transform hover:scale-105 mb-6" onClick={() => navigate('/digitalcard')}>
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                            <div className="bg-white p-4 rounded-2xl shadow-xl relative z-10">
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="Identity QR" className="w-40 h-40 object-contain" />
                                ) : (
                                    <div className="w-40 h-40 bg-gray-200 animate-pulse rounded-lg" />
                                )}
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap border-2 border-dark-800 z-20">
                                SCAN TO VERIFY
                            </div>
                        </div>

                        <div className="mt-8 text-center space-y-2">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                                <CheckCircle2 size={16} />
                                <span>ACCOUNT ACTIVE</span>
                            </div>
                            <p className="text-xs text-dark-500 font-mono mt-2">ID: {user?.coreId || '---'}</p>
                        </div>
                    </div>

                    {/* Right Column: Profile Details */}
                    <div className="w-full md:w-2/3 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">{user?.role?.replace('_', ' ')} PROFILE</h2>
                                <p className="text-dark-400 text-sm">Personal Data & Entity Information</p>
                            </div>

                            {/* Edit Button */}
                            <button
                                onClick={() => navigate('/profile')}
                                className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white text-xs font-bold rounded-lg transition-colors border border-dark-600"
                            >
                                EDIT PROFILE
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Name */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-500/10 rounded-lg text-primary-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-dark-500 uppercase">Full Name</p>
                                    <p className="text-lg text-white font-medium">{profile?.user?.name || user?.name || '---'}</p>
                                </div>
                            </div>

                            {/* Entity/Club */}
                            {(user?.role === 'CLUB' || user?.role === 'ATHLETE' || user?.role === 'COACH') && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dark-500 uppercase">Organization / Club</p>
                                        <p className="text-lg text-white font-medium">
                                            {clubStatus?.status === 'MEMBER'
                                                ? (clubStatus.club?.name || 'Club')
                                                : clubStatus?.status === 'PENDING'
                                                    ? 'Menunggu Persetujuan Admin Klub'
                                                    : clubStatus?.status === 'LEFT'
                                                        ? 'Ex-Member'
                                                        : 'Independent / Unassigned'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-dark-500 uppercase">Region / Location</p>
                                    <p className="text-lg text-white font-medium">
                                        {locationDisplay}
                                    </p>
                                </div>
                            </div>

                            {/* Join Date */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-dark-500 uppercase">Member Since</p>
                                    <p className="text-lg text-white font-medium">
                                        January 2026
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>

            {/* Quick Actions Footer - Contextual */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                <button onClick={() => navigate('/digitalcard')} className="p-4 bg-dark-900 border border-dark-800 hover:border-primary-500/50 rounded-xl group transition-all">
                    <QrIcon className="text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">ID Card</p>
                    <p className="text-xs text-dark-500">View Digital Identity</p>
                </button>

                <button onClick={() => navigate('/settings')} className="p-4 bg-dark-900 border border-dark-800 hover:border-primary-500/50 rounded-xl group transition-all">
                    <Shield className="text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Privacy & Security</p>
                    <p className="text-xs text-dark-500">Manage Password & DPA</p>
                </button>

                {/* Placeholder for future features */}
                <div className="p-4 bg-dark-900/40 border border-dark-800/40 rounded-xl opacity-50 flex flex-col justify-center items-center">
                    <p className="text-xs text-dark-600 font-mono">FINANCE (COMING SOON)</p>
                </div>
                <div className="p-4 bg-dark-900/40 border border-dark-800/40 rounded-xl opacity-50 flex flex-col justify-center items-center">
                    <p className="text-xs text-dark-600 font-mono">EVENTS (COMING SOON)</p>
                </div>
            </div>

            <div className="mt-12 text-center text-dark-600 text-xs font-mono">
                <p>Corelink Identity System v2.0 • Secured by End-to-End Encryption</p>
            </div>

            <ProfileCompletionModal
                isOpen={isCompletionModalOpen}
                onClose={() => setIsCompletionModalOpen(false)}
                onComplete={() => {
                    // Refetch profile or rely on useProfile's built-in revalidation if it exists
                    // For now, reload window is safest for quick POC, but ideally use mutation/refetch
                    window.location.reload();
                }}
                initialData={profile?.user}
            />

        </div>
    );
};

export default IdentityDashboard;
