import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Heart, Check, Shield, AlertCircle
} from 'lucide-react';
import { ProfileData } from '../../services/profileApi'; // Adjust import path if needed
import { api } from '../../contexts/AuthContext';

interface ParentProfileSectionProps {
    profile: any; // Using any for flexibility or import ProfileData
    isSaving: boolean;
    onSave: (data: any) => Promise<boolean>;
}

export default function ParentProfileSection({ profile, isSaving, onSave }: ParentProfileSectionProps) {
    if (!profile) return <div>Loading profile data...</div>;

    const [isEditing, setIsEditing] = useState(false);
    const [localSaving, setLocalSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Should come from profile.data or similar
    const [formData, setFormData] = useState({
        occupation: (profile.data && profile.data.occupation) ? profile.data.occupation : '',
    });

    // Extract children from roleData
    // Based on backend, roleData IS the array of athletes
    const linkedAthletes = Array.isArray(profile.roleData) ? profile.roleData : [];

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLocalSaving(true);
        const success = await onSave({ data: formData }); // Update nested data
        setLocalSaving(false);
        if (success) {
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    const handleLinkChild = async () => {
        const childId = window.prompt("Masukkan ID Atlet (Core ID) anak Anda:\nContoh: 04.3101.0001");
        if (childId) {
            try {
                // Determine API endpoint - reusing the one we made
                await api.post('/profile/link-child', { childCoreId: childId });
                alert('Berhasil mengirim permintaan koneksi ke akun anak!');
                window.location.reload(); // Quick refresh to show data
            } catch (err: any) {
                console.error(err);
                alert('Gagal menghubungkan: ' + (err.response?.data?.message || err.message));
            }
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Title similar to Athlete Integration */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary-400" />
                        Integrasi Data
                    </h2>
                    <p className="text-sm text-dark-400 mt-1">Kelola hubungan dengan Atlet (Anak).</p>
                </div>
            </div>

            {/* Linked Athletes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Daftar Atlet (Anak)
                    </h2>
                    <button
                        onClick={handleLinkChild}
                        className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-500/10"
                    >
                        <UserPlusLinkIcon className="w-4 h-4" />
                        Hubungkan Atlet
                    </button>
                </div>

                {linkedAthletes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {linkedAthletes.map((athlete: any) => (
                            <div key={athlete.id} className="p-4 rounded-xl bg-dark-800/50 flex items-center gap-4 border border-white/5 hover:border-primary-500/30 transition-all group">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-dark-700 to-dark-800 border border-white/10 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                                    {athlete.user?.avatarUrl ? (
                                        <img src={athlete.user.avatarUrl} alt={athlete.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Users className="w-6 h-6 text-dark-400 group-hover:text-primary-400 transition-colors" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white text-lg truncate group-hover:text-primary-400 transition-colors">{athlete.user?.name || 'Unknown Athlete'}</h4>
                                    <p className="text-sm text-dark-400 flex items-center gap-2">
                                        {athlete.club?.name ? (
                                            <span className="flex items-center gap-1 text-blue-400"><Shield size={12} /> {athlete.club.name}</span>
                                        ) : (
                                            <span className="text-dark-500 italic">No Club</span>
                                        )}
                                        <span className="text-dark-600">•</span>
                                        <span className="text-dark-400">{athlete.user?.coreId || 'NO ID'}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1">
                                        <Check size={12} /> Terhubung
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-dark-400 bg-dark-800/30 rounded-xl dashed-border border-white/5 mx-auto max-w-lg">
                        <div className="w-16 h-16 rounded-full bg-dark-800 mx-auto flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-dark-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Belum ada Atlet terhubung</h3>
                        <p className="text-sm opacity-70 mb-6 max-w-xs mx-auto">
                            Hubungkan profil Anda dengan profil Atlet anak Anda untuk memantau perkembangan dan mengelola administrasi.
                        </p>
                        <button
                            onClick={handleLinkChild}
                            className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-sm transition-all"
                        >
                            Hubungkan Sekarang
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-blue-400 text-sm">Informasi Orang Tua</h4>
                    <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                        Data pekerjaan dan kontak Anda dikelola melalui tab <strong>Root Identity</strong>.
                        Pastikan data tersebut selalu mutakhir untuk keperluan administrasi klub dan event.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Icon helper
function UserPlusLinkIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
        </svg>
    )
}
