import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Calendar, X, Check, MapPin, ChevronDown, Loader2, Info } from 'lucide-react';
import { updateProfile } from '../../services/profileApi';
import { useLocations } from '../../hooks/useLocations';
import { formatAge } from '../../utils/ageCalculator';

interface ProfileCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    initialData: any;
}

const GENDER_MAP: Record<string, string> = {
    'Laki-laki': 'MALE',
    'Perempuan': 'FEMALE'
};

const REVERSE_GENDER_MAP: Record<string, string> = {
    'MALE': 'Laki-laki',
    'FEMALE': 'Perempuan'
};

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose, onComplete, initialData }) => {
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nik: initialData?.nik || '',
        dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: REVERSE_GENDER_MAP[initialData?.gender] || initialData?.gender || '',
        provinceId: initialData?.provinceId || '',
        cityId: initialData?.cityId || '',
        isStudent: initialData?.isStudent ?? false,
    });

    const {
        provinces,
        cities,
        isLoadingProvinces,
        isLoadingCities,
        setSelectedProvince
    } = useLocations(formData.provinceId, formData.cityId);

    // Age Calculation
    const age = formData.dateOfBirth ? formatAge(formData.dateOfBirth) : null;
    const isUnderAge = age !== null && age < 18;

    // Location already filled logic
    const hasLocation = initialData?.provinceId && initialData?.cityId;

    const isStep1Valid = formData.gender &&
        formData.dateOfBirth &&
        (isUnderAge ? true : formData.nik.length >= 16);

    const isStep2Valid = formData.provinceId && formData.cityId;

    const handleProvinceChange = (provinceId: string) => {
        setFormData({ ...formData, provinceId, cityId: '' });
        setSelectedProvince(provinceId);
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            // Map gender to API enum
            const apiData = {
                ...formData,
                gender: GENDER_MAP[formData.gender] || formData.gender
            };

            const success = await updateProfile(apiData);
            if (success) {
                onComplete();
                onClose();
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        if (hasLocation) {
            handleSave();
        } else {
            setStep(2);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-dark-950/90 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-dark-900 border border-dark-800 rounded-3xl w-full max-w-lg overflow-hidden relative z-10 shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-amber-500" />

                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Lengkapi Profil Root</h2>
                                <p className="text-dark-400 text-sm mt-1">Sesuai standar UU PDP dan verifikasi identitas.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-xl transition-colors text-dark-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-2 mb-10">
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-dark-800'}`} />
                            {!hasLocation && (
                                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-dark-800'}`} />
                            )}
                        </div>

                        {step === 1 ? (
                            <div className="space-y-6">
                                {/* Order: Gender, DOB, then NIK */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <section>
                                        <label className="text-[10px] font-bold text-dark-500 uppercase mb-2 block tracking-widest">Jenis Kelamin</label>
                                        <div className="flex gap-2 p-1 bg-dark-800 border border-dark-700 rounded-2xl">
                                            {['Laki-laki', 'Perempuan'].map((g) => (
                                                <button
                                                    key={g}
                                                    onClick={() => setFormData({ ...formData, gender: g })}
                                                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${formData.gender === g
                                                        ? 'bg-primary-500 text-dark-950 shadow-lg'
                                                        : 'text-dark-400 hover:text-white'
                                                        }`}
                                                >
                                                    {g.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <label className="text-[10px] font-bold text-dark-500 uppercase mb-2 block tracking-widest">Tanggal Lahir</label>
                                        <div
                                            className="relative group cursor-pointer"
                                            onClick={() => {
                                                const input = dateInputRef.current;
                                                if (input) {
                                                    const el = input as any;
                                                    if (el.showPicker) {
                                                        el.showPicker();
                                                    } else {
                                                        el.focus();
                                                        el.click();
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                                                <Calendar size={20} />
                                            </div>
                                            <input
                                                ref={dateInputRef}
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                className="w-full bg-dark-800 border border-dark-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-sm cursor-pointer"
                                            />
                                        </div>
                                    </section>
                                </div>

                                <section>
                                    <label className="text-[10px] font-bold text-dark-500 uppercase mb-2 block tracking-widest">Status Pelajar</label>
                                    <div
                                        onClick={() => setFormData({ ...formData, isStudent: !formData.isStudent })}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${formData.isStudent
                                            ? 'bg-primary-500/10 border-primary-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                            : 'bg-dark-800 border-dark-700 hover:border-dark-600'
                                            }`}
                                    >
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors relative ${formData.isStudent ? 'bg-primary-500' : 'bg-dark-600'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.isStudent ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold leading-tight ${formData.isStudent ? 'text-primary-400' : 'text-dark-300'}`}>
                                                {formData.isStudent ? 'SISWA / MAHASISWA AKTIF' : 'BUKAN PELAJAR'}
                                            </span>
                                            <span className="text-[10px] text-dark-500 mt-0.5">Berpengaruh pada kategori pertandingan dan verifikasi sekolah.</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="pt-2 border-t border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-bold text-dark-500 uppercase block tracking-widest">NIK (16 Digit KTP/KK)</label>
                                        {isUnderAge && (
                                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Opsional (U18)</span>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-500 transition-colors">
                                            <AlertCircle size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={formData.nik}
                                            onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                                            className={`w-full bg-dark-800 border border-dark-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-mono text-lg ${isUnderAge ? 'opacity-60' : ''}`}
                                            placeholder="0000 0000 0000 0000"
                                        />
                                    </div>
                                    {isUnderAge && (
                                        <p className="text-[10px] text-dark-500 mt-2 flex items-center gap-1.5">
                                            <Info size={12} />
                                            Data NIK dapat dilengkapi oleh Orang Tua/Wali nanti.
                                        </p>
                                    )}
                                </section>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <section>
                                    <label className="text-[10px] font-bold text-dark-500 uppercase mb-2 block tracking-widest">Pilih Provinsi</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
                                            <MapPin size={20} />
                                        </div>
                                        <select
                                            value={formData.provinceId}
                                            onChange={(e) => handleProvinceChange(e.target.value)}
                                            className="w-full bg-dark-800 border border-dark-700 text-white pl-12 pr-10 py-4 rounded-2xl appearance-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        >
                                            <option value="">{isLoadingProvinces ? 'Memuat...' : 'Silakan Pilih Provinsi'}</option>
                                            {provinces.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" size={18} />
                                    </div>
                                </section>

                                <section>
                                    <label className="text-[10px] font-bold text-dark-500 uppercase mb-2 block tracking-widest">Pilih Kota / Kabupaten</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
                                            <MapPin size={20} />
                                        </div>
                                        <select
                                            disabled={!formData.provinceId || isLoadingCities}
                                            value={formData.cityId}
                                            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                            className="w-full bg-dark-800 border border-dark-700 text-white pl-12 pr-10 py-4 rounded-2xl appearance-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all disabled:opacity-50"
                                        >
                                            <option value="">{isLoadingCities ? 'Memuat...' : 'Silakan Pilih Kota'}</option>
                                            {cities.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" size={18} />
                                    </div>
                                </section>
                            </div>
                        )}

                        <div className="mt-12 flex gap-4">
                            {step === 2 && (
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-8 py-4 border border-dark-700 text-dark-400 font-bold rounded-2xl hover:bg-dark-800 hover:text-white transition-all text-sm uppercase tracking-widest"
                                >
                                    Kembali
                                </button>
                            )}

                            {step === 1 ? (
                                <button
                                    disabled={!isStep1Valid || isLoading}
                                    onClick={handleContinue}
                                    className="flex-1 py-4 bg-primary-500 hover:bg-primary-400 disabled:opacity-30 disabled:grayscale text-dark-950 font-bold rounded-2xl transition-all shadow-[0_8px_20px_-8px_rgba(245,158,11,0.5)] text-sm uppercase tracking-widest active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        hasLocation ? (
                                            <>
                                                <Check size={20} />
                                                <span>SIMPAN & SELESAI</span>
                                            </>
                                        ) : (
                                            'LANJUTKAN'
                                        )
                                    )}
                                </button>
                            ) : (
                                <button
                                    disabled={!isStep2Valid || isLoading}
                                    onClick={handleSave}
                                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:grayscale text-dark-950 font-bold rounded-2xl transition-all shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 text-sm uppercase tracking-widest active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Check size={20} />
                                            <span>Simpan & Selesai</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileCompletionModal;
