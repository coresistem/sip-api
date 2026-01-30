import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User as UserIcon, Phone, CreditCard, Building2,
    Check, AlertCircle, Loader2, Save, Shield, Calendar
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
    };
    onSave?: (data: UpdateProfileData) => Promise<boolean>;
    isSaving?: boolean;
}

export default function MasterProfileSection({ user, onSave, isSaving = false }: MasterProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isValidationTriggered, setIsValidationTriggered] = useState(false);

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
    });

    const cities = formData.provinceId ? getCitiesByProvince(formData.provinceId) : [];
    const provinceName = user.provinceId ? PROVINCES.find(p => p.id === user.provinceId)?.name : 'Not set';
    const cityName = user.cityId ? getCitiesByProvince(user.provinceId || '').find(c => c.id === user.cityId)?.name : 'Not set';

    const getFieldError = (field: string) => {
        if (!isValidationTriggered) return null;
        switch (field) {
            case 'name': return !formData.name ? 'Nama lengkap wajib diisi' : null;
            case 'whatsapp': return !formData.whatsapp ? 'Nomor WhatsApp wajib diisi' : null;
            case 'nik': {
                if (!formData.nik) return 'NIK wajib diisi';
                if (formData.nik.length !== 16) return 'NIK harus 16 digit';
                return null;
            }
            case 'provinceId': return !formData.provinceId ? 'Provinsi wajib dipilih' : null;
            case 'cityId': return !formData.cityId ? 'Kota/Kabupaten wajib dipilih' : null;
            case 'dateOfBirth': return !formData.dateOfBirth ? 'Tanggal lahir wajib diisi' : null;
            case 'gender': return !formData.gender ? 'Jenis kelamin wajib dipilih' : null;
            default: return null;
        }
    };

    const isFormValid = !getFieldError('name') && !getFieldError('whatsapp') &&
        !getFieldError('nik') && !getFieldError('provinceId') &&
        !getFieldError('cityId') && !getFieldError('dateOfBirth') &&
        !getFieldError('gender');

    const handleSave = async () => {
        if (!isFormValid) {
            setIsValidationTriggered(true);
            return;
        }

        if (onSave) {
            const success = await onSave({
                name: formData.name,
                phone: formData.phone,
                whatsapp: formData.whatsapp,
                nik: formData.nik,
                provinceId: formData.provinceId,
                cityId: formData.cityId,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                isStudent: formData.isStudent
            });

            if (success) {
                setSaveSuccess(true);
                setIsEditing(false);
                setIsValidationTriggered(false);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        }
    };

    return (
        <div className="card border-primary-500/20 bg-primary-500/5">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary-400" />
                        Root Identity (Master Profile)
                    </h2>
                    <p className="text-dark-400 text-sm mt-1">Identitas tunggal yang menghubungkan semua Role Anda di C-System.</p>
                </div>

                <div className="flex items-center gap-3">
                    {saveSuccess && (
                        <motion.span
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-green-400 flex items-center gap-1 font-medium"
                        >
                            <Check size={16} /> Berhasil disimpan
                        </motion.span>
                    )}
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={isSaving}
                        className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${isEditing
                            ? 'bg-primary-500 text-black hover:bg-primary-400'
                            : 'bg-dark-700 text-white hover:bg-dark-600 border border-dark-600'
                            }`}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Save size={18} /> : null}
                        {isEditing ? 'Simpan Identitas' : 'Edit Identitas'}
                    </button>
                </div>
            </div>

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
                        <div className="input bg-dark-900/40 border-white/5 pl-11 flex items-center gap-3">
                            <UserIcon className="absolute left-4 w-5 h-5 text-dark-500" />
                            <span className="text-white font-medium">{formData.name}</span>
                        </div>
                    )}
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
                                placeholder="6281234567890"
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            {getFieldError('whatsapp') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('whatsapp')}</p>}
                        </div>
                    ) : (
                        <div className="input bg-dark-900/40 border-white/5 pl-11 flex items-center justify-between">
                            <Phone className="absolute left-4 w-5 h-5 text-dark-500" />
                            <span className="text-white font-mono">{formData.whatsapp || 'Belum diatur'}</span>
                            {formData.whatsapp && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">Connected</span>}
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
                                className={`input w-full pl-11 ${getFieldError('dateOfBirth') ? 'border-red-500/50' : ''}`}
                            />
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            {getFieldError('dateOfBirth') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('dateOfBirth')}</p>}
                        </div>
                    ) : (
                        <div className="input bg-dark-900/40 border-white/5 pl-11 flex items-center">
                            <Calendar className="absolute left-4 w-5 h-5 text-dark-500" />
                            <span className="text-white">
                                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diatur'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">Jenis Kelamin</label>
                    {isEditing ? (
                        <div className="flex gap-4">
                            {['MALE', 'FEMALE'].map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, gender: g })}
                                    className={`flex-1 p-3 rounded-xl border font-bold transition-all ${formData.gender === g
                                        ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                                        : 'bg-dark-900/40 border-dark-600 text-dark-400'
                                        }`}
                                >
                                    {g === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="input bg-dark-900/40 border-white/5 pl-11 flex items-center">
                            <UserIcon className="absolute left-4 w-5 h-5 text-dark-500" />
                            <span className="text-white">{formData.gender === 'MALE' ? 'Laki-laki' : formData.gender === 'FEMALE' ? 'Perempuan' : 'Belum diatur'}</span>
                        </div>
                    )}
                </div>

                {/* NIK */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-dark-300 ml-1">NIK (Nomor Induk Kependudukan)</label>
                    {isEditing ? (
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.nik}
                                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                className={`input w-full pl-11 font-mono tracking-widest ${getFieldError('nik') ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`}
                                placeholder="16 Digit Nomor KTP"
                                maxLength={16}
                            />
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-dark-500">{formData.nik.length}/16</span>
                            {getFieldError('nik') && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{getFieldError('nik')}</p>}
                        </div>
                    ) : (
                        <div className="input bg-dark-900/40 border-white/5 pl-11 flex items-center justify-between">
                            <CreditCard className="absolute left-4 w-5 h-5 text-dark-500" />
                            <span className="text-white font-mono tracking-widest">{formData.nik || 'Belum diverifikasi'}</span>
                            <div className="flex items-center gap-2">
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
                        <div className="input bg-dark-900/40 border-white/5 pl-11 flex items-center">
                            <Building2 className="absolute left-4 w-5 h-5 text-dark-500" />
                            <span className="text-white">{provinceName}</span>
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
                        <div className="input bg-dark-900/40 border-white/5 pl-11 flex items-center justify-between">
                            <Building2 className="absolute left-4 w-5 h-5 text-dark-500" />
                            <span className="text-white">{cityName}</span>
                            {user.coreId && <span className="text-[10px] font-mono text-primary-400 font-bold">Region Code Verified</span>}
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
