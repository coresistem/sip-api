import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, api } from '../contexts/AuthContext'; // Import api
import { useProfile } from '../hooks/useProfile';
import { updateAvatar } from '../services/profileApi'; // Import updateAvatar service
import {
    User, Mail, Shield, Building2, Camera, QrCode, Download, Phone, CreditCard
} from 'lucide-react';
import QRCode from 'qrcode';

// Role-specific profile sections
import AthleteProfileSection from '../components/profile/AthleteProfileSection';
import ClubProfileSection from '../components/profile/ClubProfileSection';
import SchoolProfileSection from '../components/profile/SchoolProfileSection';
import PerpaniProfileSection from '../components/profile/PerpaniProfileSection';
import ParentProfileSection from '../components/profile/ParentProfileSection';
import CoachProfileSection from '../components/profile/CoachProfileSection';
import JudgeProfileSection from '../components/profile/JudgeProfileSection';
import EOProfileSection from '../components/profile/EOProfileSection';
import SupplierProfileSection from '../components/profile/SupplierProfileSection';
import SuperAdminProfileSection from '../components/profile/SuperAdminProfileSection';
import ManpowerProfileSection from '../components/profile/ManpowerProfileSection';
import WelcomeModal from '../components/profile/WelcomeModal';
import ProfileFileManager from '../components/profile/ProfileFileManager';
import AvatarCropModal from '../components/profile/AvatarCropModal'; // Import crop modal
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import MasterProfileSection from '../components/profile/MasterProfileSection';
import { useSearchParams } from 'react-router-dom';

export default function ProfilePage() {
    const { user } = useAuth();
    const { saveProfile, isSaving } = useProfile();
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [showQR, setShowQR] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showWelcome, setShowWelcome] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [imageForCrop, setImageForCrop] = useState<File | null>(null);

    // Check for welcome query param
    useEffect(() => {
        if (searchParams.get('welcome') === 'true') {
            setShowWelcome(true);
            // Clean up URL without reload
            setSearchParams(params => {
                params.delete('welcome');
                return params;
            });
        }
    }, [searchParams, setSearchParams]);

    const roleColors: Record<string, string> = {
        SUPER_ADMIN: 'bg-red-500/20 text-red-400',
        PERPANI: 'bg-red-500/20 text-red-400',
        CLUB: 'bg-amber-500/20 text-amber-400',
        SCHOOL: 'bg-emerald-500/20 text-emerald-400',
        ATHLETE: 'bg-primary-500/20 text-primary-400',
        PARENT: 'bg-pink-500/20 text-pink-400',
        COACH: 'bg-green-500/20 text-green-400',
        JUDGE: 'bg-indigo-500/20 text-indigo-400',
        EO: 'bg-teal-500/20 text-teal-400',
        SUPPLIER: 'bg-rose-500/20 text-rose-400',
        MANPOWER: 'bg-violet-500/20 text-violet-400',
    };

    // Generate personal QR code for attendance
    useEffect(() => {
        const generatePersonalQR = async () => {
            if (!user) return;

            try {
                const qrData = JSON.stringify({
                    type: 'athlete_attendance',
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    clubId: user.clubId,
                    role: user.role,
                    generatedAt: new Date().toISOString(),
                });

                const url = await QRCode.toDataURL(qrData, {
                    width: 280,
                    margin: 2,
                    color: { dark: '#0ea5e9', light: '#ffffff' },
                    errorCorrectionLevel: 'H',
                });

                setQrCodeUrl(url);
            } catch (error) {
                console.error('Failed to generate QR code:', error);
            }
        };

        generatePersonalQR();
    }, [user]);

    const downloadQRCode = () => {
        if (!qrCodeUrl || !user) return;
        const link = document.createElement('a');
        link.download = `attendance-qr-${user.name.replace(/\s+/g, '-')}.png`;
        link.href = qrCodeUrl;
        link.click();
    };

    // Mock user logic removed to prevent confusion
    const displayUser = user;
    const userRole = user?.role || 'ATHLETE';

    // Render role-specific profile section
    const renderRoleProfile = () => {
        switch (userRole) {
            case 'SUPER_ADMIN':
                return (
                    <SuperAdminProfileSection
                        user={{
                            id: displayUser?.id || '',
                            name: displayUser?.name || '',
                            email: displayUser?.email || '',
                            coreId: displayUser?.coreId,
                        }}
                    />
                );
            case 'PERPANI':
                return (
                    <PerpaniProfileSection
                        user={{
                            id: displayUser?.id || '',
                            name: displayUser?.name || '',
                            email: displayUser?.email || '',
                            coreId: (displayUser as any)?.coreId,
                        }}
                    />
                );
            case 'CLUB':
                return (
                    <ClubProfileSection
                        user={{
                            id: displayUser?.id || '',
                            name: displayUser?.name || '',
                            email: displayUser?.email || '',
                            clubId: displayUser?.clubId ?? undefined,
                        }}
                    />
                );
            case 'SCHOOL':
                return (
                    <SchoolProfileSection
                        user={{
                            id: displayUser?.id || '',
                            name: displayUser?.name || '',
                            email: displayUser?.email || '',
                            coreId: (displayUser as any)?.coreId,
                        }}
                    />
                );
            case 'ATHLETE':
                return (
                    <AthleteProfileSection
                        user={{
                            id: displayUser?.id || '',
                            name: displayUser?.name || '',
                            email: displayUser?.email || '',
                            phone: (displayUser as any)?.phone,
                            whatsapp: (displayUser as any)?.whatsapp,
                            coreId: (displayUser as any)?.coreId,
                            clubId: displayUser?.clubId ?? undefined,
                            dateOfBirth: (displayUser as any)?.dateOfBirth,
                            gender: (displayUser as any)?.gender,
                            division: (displayUser as any)?.athlete?.division,
                            provinceId: (displayUser as any)?.provinceId,
                            cityId: (displayUser as any)?.cityId,
                            role: displayUser?.role,
                        }}
                        onSave={saveProfile}
                        isSaving={isSaving}
                    />
                );
            case 'PARENT':
                return (
                    <ParentProfileSection
                        user={{
                            id: displayUser?.id || '',
                        }}
                    />
                );
            case 'COACH':
                return (
                    <CoachProfileSection
                        user={{
                            id: user?.id || '',
                            clubId: user?.clubId ?? undefined,
                        }}
                    />
                );
            case 'JUDGE':
                return (
                    <JudgeProfileSection
                        user={{
                            id: user?.id || '',
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: (user as any)?.phone,
                            coreId: (user as any)?.coreId,
                            clubId: user?.clubId ?? undefined,
                        }}
                    />
                );
            case 'EO':
                return (
                    <EOProfileSection
                        user={{
                            id: user?.id || '',
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: (user as any)?.phone,
                            coreId: (user as any)?.coreId,
                        }}
                    />
                );
            case 'SUPPLIER':
                return (
                    <SupplierProfileSection
                        user={{
                            id: user?.id || '',
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: (user as any)?.phone,
                            coreId: (user as any)?.coreId,
                        }}
                    />
                );
            case 'MANPOWER':
                return (
                    <ManpowerProfileSection
                        user={{
                            id: user?.id || '',
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: (user as any)?.phone,
                            coreId: (user as any)?.coreId,
                        }}
                    />
                );
            default:
                return <DefaultProfileSection />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                            {displayUser?.avatarUrl ? (
                                <img
                                    src={displayUser.avatarUrl}
                                    alt={displayUser.name || 'User'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        // Show fallback (parent generic background is already there, but we need text)
                                        // We can't easily inject text into the parent from here without state.
                                        // But if we hide the image, the parent div is just a colored square.
                                        // Let's use a state-based approach for robustness if this simple fix doesn't work well visually.
                                        // For now, let's assume the user wants to see the image, and if it fails, a blank colored square is better than a broken icon.
                                        // Actually, let's use a state.
                                    }}
                                />
                            ) : (
                                displayUser?.name?.charAt(0) || 'U'
                            )}
                        </div>
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Open crop modal instead of uploading directly
                                    setImageForCrop(file);
                                    setShowCropModal(true);
                                    // Reset input value to allow selecting same file again
                                    e.target.value = '';
                                }
                            }}
                        />
                        <label
                            htmlFor="avatar-upload"
                            className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </label>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-display font-bold">{displayUser?.name}</h1>
                        <p className="text-dark-400">{displayUser?.email}</p>

                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[userRole]}`}>
                                {userRole?.replace('_', ' ')}
                            </span>

                            {/* Core ID */}
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-dark-800 border border-dark-700">
                                <CreditCard className="w-3 h-3 text-dark-400" />
                                <span className="text-sm font-mono text-primary-400 tracking-wide">
                                    {displayUser?.coreId || (user as any)?.coreId || 'Not generated'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowQR(!showQR)}
                            className="mt-4 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all flex items-center gap-2"
                        >
                            <QrCode className="w-5 h-5" />
                            {showQR ? 'Hide My QR Code' : 'Show My Attendance QR'}
                        </button>
                    </div>
                </div>

                {/* Personal QR Code Section */}
                <AnimatePresence>
                    {showQR && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 pt-6 border-t border-dark-700"
                        >
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-primary-400" />
                                    Your Attendance QR Code
                                </h3>
                                <p className="text-dark-400 text-sm mb-4 text-center">
                                    Show this QR code to your coach for attendance check-in
                                </p>

                                {qrCodeUrl ? (
                                    <div className="p-4 bg-white rounded-xl shadow-lg">
                                        <img src={qrCodeUrl} alt="Personal Attendance QR Code" className="w-[260px] h-[260px]" />
                                    </div>
                                ) : (
                                    <div className="w-[280px] h-[280px] bg-dark-800 rounded-xl flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                <button
                                    onClick={downloadQRCode}
                                    disabled={!qrCodeUrl}
                                    className="mt-6 px-6 py-3 rounded-xl bg-dark-700 text-white font-medium hover:bg-dark-600 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Download className="w-5 h-5" />
                                    Download QR
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Master Profile (Root Identity) - ALWAYS VISIBLE */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <MasterProfileSection
                    user={{
                        id: displayUser?.id || '',
                        name: displayUser?.name || '',
                        email: displayUser?.email || '',
                        phone: (displayUser as any)?.phone,
                        whatsapp: (displayUser as any)?.whatsapp,
                        coreId: (displayUser as any)?.coreId,
                        nik: (displayUser as any)?.nik,
                        nikVerified: (displayUser as any)?.nikVerified,
                        provinceId: (displayUser as any)?.provinceId,
                        cityId: (displayUser as any)?.cityId,
                        dateOfBirth: (displayUser as any)?.dateOfBirth,
                        gender: (displayUser as any)?.gender,
                        isStudent: (displayUser as any)?.isStudent,
                    }}
                    onSave={saveProfile}
                    isSaving={isSaving}
                />
            </motion.div>

            {/* Role-Specific Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {renderRoleProfile()}
            </motion.div>

            {/* Universal File Manager (for anyone with a Core ID) */}
            {(displayUser as any)?.coreId && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <ProfileFileManager
                        coreId={(displayUser as any).coreId}
                        userId={displayUser?.id || ''}
                        userName={displayUser?.name || ''}
                    />
                </motion.div>
            )}

            {/* Security Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
                <h2 className="text-lg font-semibold mb-6">Security</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                        <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-dark-400">Last changed 30 days ago</p>
                        </div>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-all"
                        >
                            Change Password
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                        <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-dark-400">Add an extra layer of security</p>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all">
                            Enable 2FA
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Welcome Celebration Modal */}
            <WelcomeModal
                isOpen={showWelcome}
                onClose={() => setShowWelcome(false)}
                user={{
                    name: displayUser?.name || '',
                    coreId: (displayUser as any)?.coreId,
                    role: userRole
                }}
            />

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />

            {/* Avatar Crop Modal */}
            <AvatarCropModal

                isOpen={showCropModal}
                onClose={() => {
                    setShowCropModal(false);
                    setImageForCrop(null);
                }}
                onSave={async (blob) => {
                    try {
                        const file = Object.assign(blob, {
                            name: 'avatar.jpg',
                            lastModified: Date.now(),
                        }) as File;
                        const formData = new FormData();
                        formData.append('image', file);

                        const uploadRes = await api.post('/upload/image', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });

                        if (uploadRes.data.data?.url) {
                            // Append timestamp to bust cache
                            const newUrl = `${uploadRes.data.data.url}?t=${Date.now()}`;
                            await updateAvatar(newUrl);
                            // Close modal first
                            setShowCropModal(false);
                            setImageForCrop(null);
                            // Then reload
                            window.location.reload();
                        }
                    } catch (error) {
                        console.error('Upload failed', error);
                        alert('Failed to update avatar');
                    }
                }}
                imageFile={imageForCrop}
            />
        </div>
    );
}

// Default profile section for other roles
function DefaultProfileSection() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isValidationTriggered, setIsValidationTriggered] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: (user as any)?.phone || ''
    });

    const getFieldError = (field: string) => {
        if (!isValidationTriggered) return null;
        switch (field) {
            case 'name': return !formData.name ? 'Name is required' : null;
            case 'email': {
                if (!formData.email) return 'Email is required';
                if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format';
                return null;
            }
            default: return null;
        }
    };

    const isFormValid = !getFieldError('name') && !getFieldError('email');

    const handleSave = () => {
        if (!isFormValid) {
            setIsValidationTriggered(true);
            return;
        }
        // Logic to save would go here
        setIsEditing(false);
        setIsValidationTriggered(false);
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Profile Details</h2>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`px-4 py-2 rounded-lg transition-all ${isEditing
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}
                >
                    {isEditing ? 'Save Changes' : 'Edit'}
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="label">Full Name</label>
                    {isEditing ? (
                        <div className="relative group">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`input w-full ${getFieldError('name') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                            />
                            {getFieldError('name') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('name')}</p>}
                        </div>
                    ) : (
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70 bg-dark-900/50 border-white/5">
                            <User className="w-5 h-5 text-dark-400" />
                            <span>{formData.name}</span>
                        </div>
                    )}
                </div>
                <div>
                    <label className="label">Email Address</label>
                    {isEditing ? (
                        <div className="relative group">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`input w-full ${getFieldError('email') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                            />
                            {getFieldError('email') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('email')}</p>}
                        </div>
                    ) : (
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70 bg-dark-900/50 border-white/5">
                            <Mail className="w-5 h-5 text-dark-400" />
                            <span>{formData.email}</span>
                        </div>
                    )}
                </div>
                <div>
                    <label className="label">Core ID</label>
                    <div className="input flex items-center gap-3 cursor-not-allowed opacity-70 bg-dark-900/50 border-white/5">
                        <CreditCard className="w-5 h-5 text-dark-400" />
                        <span>{(user as any)?.coreId || 'Not set'}</span>
                    </div>
                </div>
                <div>
                    <label className="label">Phone</label>
                    {isEditing ? (
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input w-full"
                        />
                    ) : (
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70 bg-dark-900/50 border-white/5">
                            <Phone className="w-5 h-5 text-dark-400" />
                            <span>{formData.phone || 'Not set'}</span>
                        </div>
                    )}
                </div>
                <div>
                    <label className="label">Role</label>
                    <div className="input flex items-center gap-3 cursor-not-allowed opacity-70 bg-dark-900/50 border-white/5">
                        <Shield className="w-5 h-5 text-dark-400" />
                        <span>{user?.role?.replace('_', ' ')}</span>
                    </div>
                </div>
                <div>
                    <label className="label">Club</label>
                    <div className="input flex items-center gap-3 cursor-not-allowed opacity-70 bg-dark-900/50 border-white/5">
                        <Building2 className="w-5 h-5 text-dark-400" />
                        <span>{user?.clubId || 'No club assigned'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
