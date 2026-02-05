import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User as UserIcon,
    Phone,
    CreditCard,
    Building2,
    Check,
    AlertCircle,
    Loader2,
    Save,
    Shield,
    Calendar,
    Briefcase,
    Pencil
} from 'lucide-react';
import { PROVINCES, getCitiesByProvince } from '../../types/territoryData';
import { UpdateProfileData } from '../../services/profileApi';

interface MasterProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        whatsapp?: string;
        coreId?: string;
        nik?: string;
        nikVerified?: boolean;
        provinceId?: string;
        cityId?: string;
        dateOfBirth?: string;
        gender?: string;
        isStudent?: boolean;
        occupation?: string;
        role?: string;
    };
    onSave?: (data: UpdateProfileData) => Promise<boolean>;
    isSaving?: boolean;
}

export default function MasterProfileSection({ user, onSave, isSaving = false }: MasterProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isValidationTriggered, setIsValidationTriggered] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form state centered on "Root Identity"
    const [formData, setFormData] = useState({
        name: user.name || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        nik: user.nik || '',
        provinceId: user.provinceId || '',
        cityId: user.cityId || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        isStudent: user.isStudent || false,
        occupation: user.occupation || '',
    });

    // Ensure form synchronizes if parent provides new user data (e.g. after fresh fetch)
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            phone: user.phone || '',
            whatsapp: user.whatsapp || '',
            nik: user.nik || '',
            provinceId: user.provinceId || '',
            cityId: user.cityId || '',
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            gender: user.gender || '',
            isStudent: user.isStudent || false,
            occupation: user.occupation || '',
        }));
    }, [user]);

    const cities = formData.provinceId ? getCitiesByProvince(formData.provinceId) : [];
    const provinceName = user.provinceId ? PROVINCES.find(p => p.id === user.provinceId)?.name : 'Not set';
    const cityName = user.cityId ? getCitiesByProvince(user.provinceId || '').find(c => c.id === user.cityId)?.name : 'Not set';

    // Helper to derive age from current Date of Birth value
    const getAgeFromDateOfBirth = () => {
        if (!formData.dateOfBirth) return null;
        const dob = new Date(formData.dateOfBirth);
        if (Number.isNaN(dob.getTime())) return null;

        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age;
    };

    // Pure validation function independent of UI state
    const validateForm = () => {
        const errors: Record<string, string> = {};
        const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;

        const age = getAgeFromDateOfBirth();
        const isMinor = age !== null && age < 17;

        if (!formData.name) errors.name = 'Nama lengkap wajib diisi';

        if (!formData.whatsapp) {
            errors.whatsapp = 'Nomor WhatsApp wajib diisi';
        } else if (!phoneRegex.test(formData.whatsapp)) {
            errors.whatsapp = 'Format WA tidak valid (harus diawali 0, 62, atau +62)';
        }

        if (formData.phone && !phoneRegex.test(formData.phone)) {
            // Only validate phone if filled
            errors.phone = 'Format Telepon tidak valid (harus diawali 0, 62, atau +62)';
        }

        // NIK validation is conditional based on age:
        // - >= 17 years: mandatory
        // - < 17 years: optional, but if filled must still be 16 digits
        if (!isMinor) {
            if (!formData.nik) errors.nik = 'NIK wajib diisi';
            else if (formData.nik.length !== 16) errors.nik = 'NIK harus 16 digit';
        } else if (formData.nik && formData.nik.length !== 16) {
            errors.nik = 'Jika diisi, NIK harus 16 digit';
        }

        if (!formData.provinceId) errors.provinceId = 'Provinsi wajib dipilih';
        if (!formData.cityId) errors.cityId = 'Kota/Kabupaten wajib dipilih';
        if (!formData.dateOfBirth) errors.dateOfBirth = 'Tanggal lahir wajib diisi';
        if (!formData.gender) errors.gender = 'Jenis kelamin wajib dipilih';

        return errors;
    };

    const validationErrors = validateForm();
    const isFormValid = Object.keys(validationErrors).length === 0;

    const getFieldError = (field: string) => {
        if (!isValidationTriggered) return null;
        return validationErrors[field] || null;
    };

    const handleSave = async () => {
        console.log("[MasterProfile] Save clicked. isValid:", isFormValid, validationErrors);

        if (!isFormValid) {
            setIsValidationTriggered(true);
            setErrorMessage('Beberapa bidang masih belum valid. Silakan periksa kembali.');
            console.warn("[MasterProfile] Validation failed", validationErrors);
            return;
        }

        setErrorMessage(null);

        if (onSave) {
            // Aggressive sanitization: Empty strings MUST optionally become undefined
            const sanitize = (val: string | undefined) => (val && val.trim() !== '' ? val.trim() : undefined);

            const payload = {
                name: sanitize(formData.name)!, // Name is required validated above
                phone: sanitize(formData.phone),
                whatsapp: sanitize(formData.whatsapp),
                nik: sanitize(formData.nik)!,
                provinceId: sanitize(formData.provinceId),
                cityId: sanitize(formData.cityId),
                dateOfBirth: formData.dateOfBirth, // Date string is fine
                gender: formData.gender,
                isStudent: formData.isStudent,
                occupation: sanitize(formData.occupation),
            };

            console.log("[MasterProfile] Final Payload to API:", payload);

            try {
                const success = await onSave(payload);
                console.log("[MasterProfile] onSave result:", success);

                if (success) {
                    setSaveSuccess(true);
                    setIsEditing(false);
                    setIsValidationTriggered(false);
                    setTimeout(() => setSaveSuccess(false), 3000);
                } else {
                    setErrorMessage('Gagal menyimpan identitas. Pastikan data yang dimasukkan valid.');
                }
            } catch (err: any) {
                console.error("[MasterProfile] Exception in onSave:", err);
                setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan.');
            }
        }
    };

    const handleCancelEdit = () => {
        // Reset form back to latest user snapshot and exit edit mode
        setFormData({
            name: user.name || '',
            phone: user.phone || '',
            whatsapp: user.whatsapp || '',
            nik: user.nik || '',
            provinceId: user.provinceId || '',
            cityId: user.cityId || '',
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            gender: user.gender || '',
            isStudent: user.isStudent || false,
            occupation: user.occupation || '',
        });
        setIsEditing(false);
        setIsValidationTriggered(false);
        setErrorMessage(null);
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setIsValidationTriggered(false);
        setErrorMessage(null);
    };

    const isProfileIncomplete = !user.name || !user.whatsapp || !user.nik || !user.dateOfBirth || !user.gender || !user.provinceId || !user.cityId;

    return (
        <div className={`card border transition-all duration-500 ${isProfileIncomplete ? 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'border-primary-500/20 bg-primary-500/5'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-lg md:text-xl font-display font-bold flex items-center gap-2">
                        <Shield className={`w-5 h-5 md:w-6 md:h-6 ${isProfileIncomplete ? 'text-amber-400 animate-pulse' : 'text-primary-400'}`} />
                        Root Identity (Master Profile)
                    </h2>
                    <p className="text-dark-400 text-xs md:text-sm mt-1">Identitas tunggal yang menghubungkan semua Role Anda di C-System.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end">
                    {saveSuccess && (
                        <motion.span
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-green-400 flex items-center gap-1 font-medium"
                        >
                            <Check size={16} /> Berhasil disimpan
                        </motion.span>
                    )}

                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            disabled={isSaving}
                            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 relative overflow-hidden ${isProfileIncomplete
                                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse ring-2 ring-amber-300 ring-offset-2 ring-offset-dark-900 border-transparent'
                                : 'bg-dark-700 text-white hover:bg-dark-600 border border-dark-600'
                                }`}
                        >
                            <Pencil size={16} className="md:w-[18px] md:h-[18px]" />
                            <span>Edit Profile</span>

                            {!isEditing && isProfileIncomplete && (
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
                            )}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 bg-primary-500 text-black hover:bg-primary-400 disabled:opacity-60"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save size={16} className="md:w-[18px] md:h-[18px]" />
                                )}
                                <span className="whitespace-nowrap">Save Changes</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 border border-dark-600 text-dark-100 bg-dark-800 hover:bg-dark-700 disabled:opacity-60"
                            >
                                <span>Cancel</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm"
                >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-bold">{errorMessage}</p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">Nama Lengkap (Sesuai KTP/KK)</label>
                    {isEditing ? (
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`input w-full pl-11 ${getFieldError('name') ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`}
                                placeholder="Contoh: Ricky Antigravity"
                            />
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            {getFieldError('name') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('name')}</p>}
                        </div>
                    ) : (
                        <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center gap-3 relative">
                            <UserIcon className="absolute left-4 w-5 h-5 text-dark-400 z-10" />
                            <span className="text-white font-medium relative z-10">{formData.name}</span>
                        </div>
                    )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">Email Address</label>
                    <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center gap-3 relative cursor-not-allowed opacity-80">
                        {/* Using a generic Mail icon if imported, or UserIcon fallback */}
                        <div className="absolute left-4 w-5 h-5 text-dark-400 z-10 flex items-center justify-center font-bold">@</div>
                        <span className="text-white font-medium relative z-10">{user.email}</span>
                        <span className="ml-auto text-[10px] bg-dark-700 text-dark-300 px-2 py-0.5 rounded-full font-bold">Login ID</span>
                    </div>
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">WhatsApp Number</label>
                    {isEditing ? (
                        <div className="relative">
                            <input
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                                className={`input w-full pl-11 ${getFieldError('whatsapp') ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`}
                                placeholder="62812xxxxxx"
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            {getFieldError('whatsapp') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('whatsapp')}</p>}
                        </div>
                    ) : (
                        <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center justify-between relative">
                            <Phone className="absolute left-4 w-5 h-5 text-dark-400 z-10" />
                            <span className="text-white font-mono relative z-10">{formData.whatsapp || 'Belum diatur'}</span>
                            {formData.whatsapp && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold relative z-10">Connected</span>}
                        </div>
                    )}
                </div>

                {/* Date of Birth & Gender - The Bio Foundation */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">Tanggal Lahir</label>
                    {isEditing ? (
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                onClick={(e) => {
                                    try {
                                        (e.target as HTMLInputElement).showPicker();
                                    } catch (error) {
                                        console.debug("Browser doesn't support showPicker", error);
                                    }
                                }}
                                className={`input w-full pl-11 cursor-pointer ${getFieldError('dateOfBirth') ? 'border-red-500/50' : ''}`}
                            />
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                            {getFieldError('dateOfBirth') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('dateOfBirth')}</p>}
                        </div>
                    ) : (
                        <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center relative">
                            <Calendar className="absolute left-4 w-5 h-5 text-dark-400 z-10" />
                            <span className="text-white relative z-10">
                                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diatur'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">Jenis Kelamin</label>
                    {isEditing ? (
                        <div>
                            <div className="flex gap-2 sm:gap-4">
                                {['MALE', 'FEMALE'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`flex-1 p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${formData.gender === g
                                            ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                                            : getFieldError('gender')
                                                ? 'bg-dark-900/40 border-red-500/50 text-dark-400'
                                                : 'bg-dark-900/40 border-dark-600 text-dark-400'
                                            } `}
                                    >
                                        {g === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                                    </button>
                                ))}
                            </div>
                            {getFieldError('gender') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('gender')}</p>}
                        </div>
                    ) : (
                        <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center relative text-sm md:text-base">
                            <UserIcon className="absolute left-4 w-5 h-5 text-dark-400 z-10" />
                            <span className="text-white relative z-10">{formData.gender === 'MALE' ? 'Laki-laki' : formData.gender === 'FEMALE' ? 'Perempuan' : 'Belum diatur'}</span>
                        </div>
                    )}
                </div>

                {/* Status Pelajar / Occupation Toggle */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">
                        {user.role === 'PARENT' ? 'Pekerjaan (Occupation)' : 'Status Pelajar'}
                    </label>

                    {user.role === 'PARENT' ? (
                        // OCCUPATION INPUT FOR PARENTS
                        isEditing ? (
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 z-10" />
                                <input
                                    type="text"
                                    value={formData.occupation}
                                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                    className="input pl-11 w-full bg-dark-900/40 border-dark-600 focus:border-primary-500 text-xs sm:text-sm font-bold text-white placeholder:font-normal placeholder:text-dark-500"
                                    placeholder="Contoh: Karyawan Swasta, PNS, Wiraswasta..."
                                />
                            </div>
                        ) : (
                            <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center relative gap-3 text-sm md:text-base">
                                <Briefcase className="absolute left-4 w-5 h-5 text-dark-400 z-10" />
                                <span className={`font-medium relative z-10 ${formData.occupation ? 'text-white' : 'text-dark-400 italic'} `}>
                                    {formData.occupation || 'Belum diisi'}
                                </span>
                            </div>
                        )
                    ) : (
                        // STUDENT TOGGLE FOR ATHLETES
                        isEditing ? (
                            <div
                                onClick={() => setFormData({ ...formData, isStudent: !formData.isStudent })}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.isStudent
                                    ? 'bg-primary-500/10 border-primary-500'
                                    : 'bg-dark-900/40 border-dark-600 hover:border-dark-500'
                                    } `}
                            >
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isStudent ? 'bg-primary-500' : 'bg-dark-600'} `}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${formData.isStudent ? 'translate-x-6' : 'translate-x-0'} `} />
                                </div>
                                <span className={`text-xs sm:text-sm font-bold ${formData.isStudent ? 'text-primary-400' : 'text-dark-400'} `}>
                                    {formData.isStudent ? 'Siswa / Mahasiswa Aktif' : 'Bukan Pelajar'}
                                </span>
                            </div>
                        ) : (
                            <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center relative gap-3 text-sm md:text-base">
                                <div className="absolute left-4 w-5 h-5 flex items-center justify-center opacity-70">🎓</div>
                                <span className={`font-medium relative z-10 ${formData.isStudent ? 'text-primary-400' : 'text-white'} `}>
                                    {formData.isStudent ? 'Pelajar Aktif' : 'Non-Pelajar'}
                                </span>
                            </div>
                        )
                    )}
                </div>

                {/* NIK */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">
                        {(() => {
                            const age = getAgeFromDateOfBirth();
                            const isMinor = age !== null && age < 17;
                            return isMinor ? 'NIK (Opsional / Lihat KK)' : 'NIK (Sesuai KTP)';
                        })()}
                    </label>
                    {isEditing ? (
                        user.nikVerified ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.nik}
                                    readOnly
                                    className="input w-full pl-11 font-mono tracking-widest bg-dark-900/60 border-dark-700 cursor-not-allowed opacity-80"
                                />
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full font-bold border border-primary-500/40">
                                    Verified – NIK tidak dapat diubah
                                </span>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.nik}
                                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                    className={`input w-full pl-11 font-mono tracking-widest ${getFieldError('nik') ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`}
                                    placeholder={(() => {
                                        const age = getAgeFromDateOfBirth();
                                        const isMinor = age !== null && age < 17;
                                        return isMinor ? 'Bisa dilengkapi nanti oleh Orang Tua' : '16 Digit Nomor KTP';
                                    })()}
                                    maxLength={16}
                                />
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-dark-500">{formData.nik.length}/16</span>
                                {getFieldError('nik') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('nik')}</p>}
                            </div>
                        )
                    ) : (
                        <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center justify-between relative">
                            <CreditCard className="absolute left-4 w-5 h-5 text-dark-400 z-10" />
                            <span className="text-white font-mono tracking-widest relative z-10">{formData.nik || 'Belum diverifikasi'}</span>
                            <div className="flex items-center gap-2 relative z-10">
                                {user.nikVerified ? (
                                    <span className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-bold border border-primary-500/30">Verified Identity</span>
                                ) : formData.nik ? (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">Pending Review</span>
                                ) : null}
                            </div>
                        </div>
                    )}
                    {!isEditing && !user.nikVerified && (
                        <div className="flex items-center gap-2 p-3 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <AlertCircle className="text-amber-400 w-4 h-4 flex-shrink-0" />
                            <p className="text-[11px] text-amber-200/80">
                                Identitas Root diperlukan untuk pendaftaran kompetisi resmi dan integrasi Club. Silakan lengkapi NIK Anda.
                            </p>
                        </div>
                    )}
                </div>

                {/* Territory Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">Provinsi Domisili (KTP/KK)</label>
                    {isEditing ? (
                        <div className="relative">
                            <select
                                value={formData.provinceId}
                                onChange={(e) => setFormData({ ...formData, provinceId: e.target.value, cityId: '' })}
                                className={`input w-full pl-11 appearance-none cursor-pointer ${getFieldError('provinceId') ? 'border-red-500/50' : ''}`}
                            >
                                <option value="">Pilih Provinsi</option>
                                {PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                            {getFieldError('provinceId') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('provinceId')}</p>}
                        </div>
                    ) : (
                        <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center relative">
                            <Building2 className="absolute left-4 w-5 h-5 text-dark-400 z-10" />
                            <span className="text-white relative z-10">{provinceName}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">Kota / Kabupaten</label>
                    {isEditing ? (
                        <div className="relative">
                            <select
                                value={formData.cityId}
                                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                disabled={!formData.provinceId}
                                className={`input w-full pl-11 appearance-none cursor-pointer disabled:opacity-50 ${getFieldError('cityId') ? 'border-red-500/50' : ''}`}
                            >
                                <option value="">Pilih Kota/Kabupaten</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                            {getFieldError('cityId') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('cityId')}</p>}
                        </div>
                    ) : (
                        <div className="input bg-dark-950/80 backdrop-blur-md border-white/10 pl-11 flex items-center justify-between relative">
                            <Building2 className="absolute left-4 w-5 h-5 text-dark-400 z-10" />
                            <span className="text-white relative z-10">{cityName}</span>
                            {user.coreId && <span className="text-[10px] font-mono text-primary-400 font-bold relative z-10">Region Code Verified</span>}
                        </div>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="mt-8 pt-6 border-t border-primary-500/10 flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <AlertCircle className="text-primary-400 w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Informasi Penting</h4>
                        <p className="text-dark-400 text-[11px] leading-relaxed mt-1">
                            Perubahan pada Nama, NIK, dan Domisili akan berdampak pada validasi kartu anggota (Core ID) Anda.
                            Pastikan data sesuai dengan dokumen kependudukan resmi untuk menghindari penolakan verifikasi oleh Admin.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
