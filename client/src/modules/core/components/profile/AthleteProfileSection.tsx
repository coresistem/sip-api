import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Calendar, Users, Building2, Phone,
    GraduationCap, Plus, ChevronDown, Shield, Loader2,
    Check, ExternalLink, Search, AlertCircle, Trophy, UserPlus
} from 'lucide-react';
import { calculateUnderAgeCategory, getAgeCategoryColor, formatAge, UnderAgeCategory } from '../../utils/ageCalculator';
import { UpdateProfileData, joinClub } from '../../services/profileApi';
import { PROVINCES, getCitiesByProvince } from '../../types/territoryData';
import IntegrationStatusBadge from '../ui/IntegrationStatusBadge';
import { api } from '../../contexts/AuthContext';
import { differenceInYears } from 'date-fns';
import ClubMembershipCard from './ClubMembershipCard';
import { toast } from 'react-toastify';

interface AthleteProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        whatsapp?: string;
        coreId?: string;
        nik?: string;
        nikVerified?: boolean;
        isStudent?: boolean;
        clubId?: string;
        dateOfBirth?: string;
        gender?: string;
        division?: string;
        provinceId?: string;
        cityId?: string;
        role?: string;
        avatarUrl?: string;
        isActive?: boolean;
        parentName?: string;
        parentPhone?: string;
    };
    onSave?: (data: UpdateProfileData) => Promise<boolean>;
    isSaving?: boolean;
    viewMode?: 'PROFILE' | 'HISTORY'; // Controlled by parent
    userClubHistory?: {
        clubId: string;
        clubName: string;
        city: string;
        joinDate: string;
        status: string;
    }[];
}

const DIVISIONS = ['Barebow', 'Nasional', 'Recurve', 'Compound', 'Traditional'];

interface AthleteData {
    email: string;
    division: string;
    isStudent: boolean;
    schoolId: string;
    schoolSourceUrl: string;
    nisn: string;
    currentClass: string;
    // Parent Data for < 18
    parentName: string;
    parentPhone: string;
}

export default function AthleteProfileSection({ user, onSave, isSaving = false, viewMode = 'PROFILE', userClubHistory = [] }: AthleteProfileSectionProps) {
    const provinceName = user.provinceId ? PROVINCES.find(p => p.id === user.provinceId)?.name : 'Province not set';
    const cities = user.provinceId ? getCitiesByProvince(user.provinceId) : [];
    const cityName = user.cityId ? cities.find(c => c.id === user.cityId)?.name : 'City not set';

    const [isEditing, setIsEditing] = useState(true); // Always editable as requested
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isValidationTriggered, setIsValidationTriggered] = useState(false);

    // Club Join State
    const [showClubSearch, setShowClubSearch] = useState(false);
    const [clubSearchTerm, setClubSearchTerm] = useState('');
    const [allClubs, setAllClubs] = useState<{ id: string; name: string; city: string }[]>([]);
    const [isJoiningClub, setIsJoiningClub] = useState(false);
    const [clubRequestStatus, setClubRequestStatus] = useState<'PENDING' | 'NONE'>('NONE');

    // School Search State
    const [schoolSearch, setSchoolSearch] = useState('');
    const [showSchoolSearch, setShowSchoolSearch] = useState(false);

    // Form state
    const [formData, setFormData] = useState<AthleteData>({
        email: user.email || '',
        division: user.division || '',
        isStudent: user.isStudent || false,
        schoolId: '',
        schoolSourceUrl: '',
        nisn: '',
        currentClass: '',
        parentName: user.parentName || '',
        parentPhone: user.parentPhone || '',
    });

    const underAgeCategory: UnderAgeCategory | null = user.dateOfBirth
        ? calculateUnderAgeCategory(user.dateOfBirth)
        : null;

    const age = user.dateOfBirth ? differenceInYears(new Date(), new Date(user.dateOfBirth)) : 20;
    const isMinor = age < 18;

    // --- VALIDATION LOGIC ---
    const validateForm = () => {
        const errors: Record<string, string> = {};
        const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;

        if (formData.isStudent) {
            // School data is optional for now
        }

        if (isMinor) {
            if (!formData.parentName) errors.parentName = 'Parent name is required';

            if (!formData.parentPhone) {
                errors.parentPhone = 'Parent WhatsApp is required';
            } else if (!phoneRegex.test(formData.parentPhone)) {
                errors.parentPhone = 'Invalid format (must start with 0, 62, or +62)';
            }
        }

        return errors;
    };

    const validationErrors = validateForm();
    const isFormValid = Object.keys(validationErrors).length === 0;

    const getFieldError = (field: string) => {
        if (!isValidationTriggered) return null;
        return validationErrors[field] || null;
    };

    const handleChange = (field: keyof AthleteData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const normalizeParentWhatsApp = (raw: string) => {
        const digits = raw.replace(/\D/g, '');
        if (digits.startsWith('62')) return digits;
        if (digits.startsWith('08')) return `62${digits.slice(1)}`;
        if (digits.startsWith('0')) return `62${digits.slice(1)}`;
        if (digits.startsWith('8')) return `62${digits}`;
        return digits;
    };

    const canRequestParentApproval =
        isMinor &&
        formData.parentName.trim().length > 3 &&
        formData.parentPhone.trim().length > 3;

    const handleRequestParentApproval = async () => {
        if (!canRequestParentApproval) return;

        const waWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null;
        if (waWindow) {
            waWindow.document.write('<p style="font-family: sans-serif; text-align: center; margin-top: 50px;">Menyampaikan link WhatsApp... Mohon tunggu.</p>');
        }

        const success = await handleSave();

        if (!success) {
            if (waWindow) waWindow.close();
            return;
        }

        const normalizedWa = normalizeParentWhatsApp(formData.parentPhone);
        const baseUrl = window.location.origin;
        const approvalLink = `${baseUrl}/register?ref_athlete_id=${encodeURIComponent(user.id)}&prefill_wa=${encodeURIComponent(formData.parentPhone)}&prefill_name=${encodeURIComponent(formData.parentName)}&role=PARENT`;

        const message = `Halo ${formData.parentName}, saya ${user.name} ingin bergabung di Aplikasi Corelink Sistem Integrasi Panahan (SIP).\n\n` +
            `Mohon bantuan untuk membuat akun Orang Tua/Wali agar saya dapat terdaftar secara resmi di sistem.\n\n` +
            `Persiapkan NIK (Nomor Induk Kependudukan) Anda untuk proses pendaftaran selanjutnya.\n\n` +
            `Silakan klik link pendaftaran ini untuk mengkonfirmasi:\n` +
            `${approvalLink}`;

        const url = `https://wa.me/${normalizedWa}?text=${encodeURIComponent(message)}`;

        if (waWindow) {
            waWindow.location.href = url;
        } else {
            window.open(url, '_blank');
        }
    };

    useEffect(() => {
        if (showClubSearch && allClubs.length === 0) {
            api.get('/auth/clubs').then(res => setAllClubs(res.data.data)).catch(console.error);
        }
    }, [showClubSearch, allClubs.length]);

    const handleJoinClub = async (clubId: string) => {
        if (isJoiningClub) return;
        setIsJoiningClub(true);
        try {
            const success = await joinClub(clubId);
            if (success) {
                setClubRequestStatus('PENDING');
                setShowClubSearch(false);
            }
        } catch (error) {
            console.error('Join club error:', error);
        } finally {
            setIsJoiningClub(false);
        }
    };

    const handleSave = async () => {
        if (!isFormValid) {
            setIsValidationTriggered(true);
            toast.warn('Mohon lengkapi data yang diperlukan');
            return false;
        }

        if (!onSave) {
            setIsEditing(false);
            return false;
        }

        const sanitize = (val: string | undefined) => (val && val.trim() !== '' ? val.trim() : undefined);

        const updateData: UpdateProfileData = {
            isStudent: formData.isStudent,
            athleteData: {
                division: sanitize(formData.division),
                emergencyContact: sanitize(formData.parentName),
                emergencyPhone: sanitize(formData.parentPhone),
            },
            studentData: formData.isStudent ? {
                schoolId: sanitize(formData.schoolId),
                nisn: sanitize(formData.nisn),
                currentClass: sanitize(formData.currentClass),
                schoolSourceUrl: sanitize(formData.schoolSourceUrl)
            } : undefined,
        };

        const success = await onSave(updateData);
        if (success) {
            setSaveSuccess(true);
            setIsEditing(false);
            setIsValidationTriggered(false);
            toast.success('Informasi Orang Tua berhasil disimpan');
            setTimeout(() => setSaveSuccess(false), 3000);
            return true;
        } else {
            toast.error('Gagal menyimpan profil. Silakan coba lagi.');
            return false;
        }
    };

    if (viewMode === 'HISTORY') {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-400" />
                        School History
                    </h3>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b border-dark-700 text-dark-400">
                                    <th className="text-left py-3 px-2">From School</th>
                                    <th className="text-left py-3 px-2">Domicile</th>
                                    <th className="text-left py-3 px-2">To School</th>
                                    <th className="text-left py-3 px-2">Date</th>
                                    <th className="text-left py-3 px-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-dark-500 italic">No school transfers recorded</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        Club History
                    </h3>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b border-dark-700 text-dark-400">
                                    <th className="text-left py-3 px-2">Club Name</th>
                                    <th className="text-left py-3 px-2">City</th>
                                    <th className="text-left py-3 px-2">Joined Date</th>
                                    <th className="text-left py-3 px-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userClubHistory && userClubHistory.length > 0 ? (
                                    userClubHistory.map((history) => (
                                        <tr key={history.clubId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-2 font-medium text-white">{history.clubName}</td>
                                            <td className="py-3 px-2 text-dark-300">{history.city}</td>
                                            <td className="py-3 px-2 text-dark-300">
                                                {new Date(history.joinDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${history.clubId === user.clubId
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-dark-700 text-dark-400'
                                                    }`}>
                                                    {history.clubId === user.clubId ? 'Current' : 'History'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-dark-500 italic">No club membership history recorded</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        Competition Achievements
                    </h3>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b border-dark-700 text-dark-400">
                                    <th className="text-left py-3 px-2">Event</th>
                                    <th className="text-left py-3 px-2">Category</th>
                                    <th className="text-left py-3 px-2">Rank</th>
                                    <th className="text-left py-3 px-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-dark-500 italic">No achievements recorded yet</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            email: user.email || '',
            division: user.division || '',
            isStudent: user.isStudent || false,
            parentName: user.parentName || '',
            parentPhone: user.parentPhone || '',
        }));
    }, [user]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* HEADER AREA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-white/5 gap-4">
                <div>
                    <h2 className="text-lg md:text-xl font-display font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                        Integrasi
                    </h2>
                    <p className="text-xs md:text-sm text-dark-400 mt-1">Kelola hubungan Sekolah, Club, dan Wali.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {saveSuccess && (
                        <span className="text-xs md:text-sm text-green-400 flex items-center gap-1 font-bold animate-in fade-in slide-in-from-right-4">
                            <Check size={14} className="md:w-4 md:h-4" /> Saved!
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 bg-primary-600 text-white hover:bg-primary-500 shadow-lg hover:shadow-primary-500/20 text-xs md:text-sm font-bold"
                    >
                        {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <><Shield size={16} className="md:w-[18px] md:h-[18px]" /> Update Integrasi</>}
                    </button>
                </div>
            </div>

            {/* 1. PARENT / GUARDIAN SECTION */}
            {isMinor && (
                <div className="card border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <UserPlus className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Parent / Guardian Information</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase">Required</span>
                                <span className="text-xs text-amber-200/60">UnderAge Policy ({age} years old)</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Parent Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.parentName}
                                    onChange={(e) => handleChange('parentName', e.target.value)}
                                    className={`input w-full ${getFieldError('parentName') ? 'border-red-500/50' : ''}`}
                                    placeholder="Full Name of Parent"
                                />
                                <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            </div>
                            {getFieldError('parentName') && <p className="text-[10px] text-red-500 mt-1 ml-1">{getFieldError('parentName')}</p>}
                        </div>
                        <div>
                            <label className="label">Parent WhatsApp</label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={formData.parentPhone}
                                        onChange={(e) => handleChange('parentPhone', e.target.value)}
                                        className={`input w-full ${getFieldError('parentPhone') ? 'border-red-500/50' : ''}`}
                                        placeholder="62812xxxxxx"
                                    />
                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                </div>
                                {getFieldError('parentPhone') && <p className="text-[10px] text-red-500 ml-1">{getFieldError('parentPhone')}</p>}

                                {canRequestParentApproval && (
                                    <button
                                        type="button"
                                        onClick={handleRequestParentApproval}
                                        disabled={isSaving}
                                        className={`w-full py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-lg text-center text-green-400 text-xs font-bold transition-all flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink size={14} />
                                                Minta Izin Ortu via WhatsApp
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. CLUB INTEGRATION CARD */}
            <ClubMembershipCard isMinor={isMinor} cityName={cityName} />

            {/* 3. SCHOOL DATA CARD */}
            <div className={`card transition-all duration-500 ${formData.isStudent ? 'opacity-100 translate-y-0' : 'opacity-60 grayscale'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-white/5 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${formData.isStudent ? 'bg-emerald-500/10' : 'bg-dark-700'}`}>
                            <GraduationCap className={`w-5 h-5 md:w-6 md:h-6 ${formData.isStudent ? 'text-emerald-400' : 'text-dark-400'}`} />
                        </div>
                        <div>
                            <h3 className={`text-base md:text-lg font-bold ${formData.isStudent ? 'text-white' : 'text-dark-400'}`}>Data Sekolah</h3>
                            <p className="text-[10px] md:text-xs text-dark-400">Diperlukan untuk kategori kompetisi pelajar.</p>
                        </div>
                    </div>
                    {!formData.isStudent && (
                        <span className="text-[10px] bg-dark-800 text-dark-400 px-2 py-1 rounded border border-white/5">
                            Status: Non-Pelajar
                        </span>
                    )}
                </div>

                {formData.isStudent ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div>
                            <label className="label">School URL (Kemendikdasmen)</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={formData.schoolSourceUrl}
                                    onChange={(e) => handleChange('schoolSourceUrl', e.target.value)}
                                    className="input w-full"
                                    placeholder="https://sekolah.data.kemendikdasmen.go.id/..."
                                />
                                <a href="https://sekolah.data.kemendikdasmen.go.id/sekolah" target="_blank" rel="noopener noreferrer" className="p-3 bg-dark-700 rounded-lg hover:bg-dark-600 border border-white/10 text-white flex items-center justify-center transition-colors shadow-lg">
                                    <Search size={18} />
                                </a>
                            </div>
                            <p className="text-[10px] text-dark-500 mt-1.5 ml-1">Cari URL sekolah Anda di database Kemendikdasmen untuk verifikasi otomatis.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">NISN</label>
                                <input
                                    type="text"
                                    value={formData.nisn}
                                    onChange={(e) => handleChange('nisn', e.target.value)}
                                    className={`input w-full font-mono tracking-wide ${getFieldError('nisn') ? 'border-red-500' : ''}`}
                                    placeholder="Nomor Induk Siswa Nasional"
                                />
                                {getFieldError('nisn') && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{getFieldError('nisn')}</p>}
                            </div>
                            <div>
                                <label className="label">Class / Grade</label>
                                <input
                                    type="text"
                                    value={formData.currentClass}
                                    onChange={(e) => handleChange('currentClass', e.target.value)}
                                    className={`input w-full ${getFieldError('currentClass') ? 'border-red-500' : ''}`}
                                    placeholder="e.g. Kelas 10"
                                />
                                {getFieldError('currentClass') && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{getFieldError('currentClass')}</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center border-2 border-dashed border-dark-700 rounded-xl bg-dark-800/20">
                        <GraduationCap className="w-12 h-12 mx-auto text-dark-600 mb-2" />
                        <p className="text-dark-400 text-sm">Anda tidak mengaktifkan status Pelajar.</p>
                        <p className="text-dark-500 text-xs mt-1">Ubah status di tab Root Identity jika Anda ingin mengisi data ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
