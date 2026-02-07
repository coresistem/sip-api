import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Heart, Check, Shield, AlertCircle, Building2, Search, X, Loader2, Phone, Fingerprint, Save
} from 'lucide-react';
import { updateChildProfile } from '../../services/profileApi';
import { api } from '../../contexts/AuthContext';
import { joinClub } from '../../services/profileApi';
import { toast } from 'react-toastify';

interface ParentProfileSectionProps {
    profile: any;
    isSaving: boolean;
    onSave: (data: any) => Promise<boolean>;
    refreshProfile?: () => Promise<void>;
}

export default function ParentProfileSection({ profile, isSaving, onSave, refreshProfile }: ParentProfileSectionProps) {
    if (!profile) return <div>Loading profile data...</div>;

    const [localSaving, setLocalSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Extract roleData components
    const linkedAthletes = (profile as any)?.roleData?.linkedAthletes || [];
    const pendingRequests = (profile as any)?.roleData?.pendingRequests || [];

    const [clubs, setClubs] = useState<{ id: string; name: string; city?: string; address?: string }[]>([]);
    const [isClubsLoading, setIsClubsLoading] = useState(false);
    const [clubCityFilter, setClubCityFilter] = useState('');
    const [clubNameFilter, setClubNameFilter] = useState('');
    const [selectedClub, setSelectedClub] = useState<{ id: string; name: string; city?: string; address?: string } | null>(null);
    const [isRequestingJoin, setIsRequestingJoin] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);

    useEffect(() => {
        setIsClubsLoading(true);
        api.get('/auth/clubs')
            .then(res => setClubs(res.data.data || []))
            .catch(() => {
                setClubs([]);
            })
            .finally(() => setIsClubsLoading(false));
    }, []);

    const [selectedPendingRequest, setSelectedPendingRequest] = useState<any>(null);
    const [selectedLinkedAthlete, setSelectedLinkedAthlete] = useState<any>(null);
    const [isResponding, setIsResponding] = useState(false);

    // Edit Child State
    const [editNik, setEditNik] = useState('');
    const [editWhatsapp, setEditWhatsapp] = useState('');
    const [editClubId, setEditClubId] = useState('');
    const [isUpdatingChild, setIsUpdatingChild] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (selectedLinkedAthlete) {
            console.log('[SNAG-DEBUG] Selected Athlete:', selectedLinkedAthlete.user?.name);
            console.log('[SNAG-DEBUG] Athlete Object Keys:', Object.keys(selectedLinkedAthlete));
            console.log('[SNAG-DEBUG] Athlete.NIK:', selectedLinkedAthlete.nik, typeof selectedLinkedAthlete.nik);
            console.log('[SNAG-DEBUG] Athlete.User.NIK:', selectedLinkedAthlete.user?.nik, typeof selectedLinkedAthlete.user?.nik);

            // Re-sync with the latest data from profile prop (useful after refreshProfile)
            const latestAthlete = linkedAthletes.find((a: any) => a.id === selectedLinkedAthlete.id) || selectedLinkedAthlete;

            console.log('[SNAG-DEBUG] Latest Athlete NIK:', latestAthlete.nik);

            // Fallback for flattened vs nested data
            const nikValue = latestAthlete.nik || latestAthlete.user?.nik || '';
            const waValue = latestAthlete.whatsapp || latestAthlete.user?.whatsapp || '';

            setEditNik(nikValue);
            setEditWhatsapp(waValue);
            setEditClubId(latestAthlete.clubId || latestAthlete.club?.id || '');
            setShowModal(true);
        } else {
            setShowModal(false);
        }
    }, [selectedLinkedAthlete, profile]);

    const handleUpdateChild = async () => {
        if (!selectedLinkedAthlete || isUpdatingChild) return;
        setIsUpdatingChild(true);
        try {
            const success = await updateChildProfile(selectedLinkedAthlete.id, {
                nik: editNik,
                whatsapp: editWhatsapp,
                clubId: editClubId
            });
            if (success) {
                toast.success('Data anak berhasil diperbarui');
                if (refreshProfile) await refreshProfile();
                setShowModal(false);
                setSelectedLinkedAthlete(null);
            }
        } catch (err: any) {
            console.error(err);
            toast.error('Gagal memperbarui profil anak: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsUpdatingChild(false);
        }
    };

    const handleLinkChild = async () => {
        const childId = window.prompt("Masukkan ID Atlet (Core ID) anak Anda:\nContoh: 04.3101.0001");
        if (childId) {
            try {
                const res = await api.post('/profile/link-child', { childCoreId: childId });
                alert(res.data.message || 'Permintaan koneksi berhasil dikirim!');
                window.location.reload();
            } catch (err: any) {
                console.error(err);
                alert('Gagal menghubungi: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const filteredClubs = clubs
        .filter(c => {
            if (!clubCityFilter.trim()) return true;
            return (c.city || '').toLowerCase().includes(clubCityFilter.trim().toLowerCase());
        })
        .filter(c => {
            if (!clubNameFilter.trim()) return true;
            return (c.name || '').toLowerCase().includes(clubNameFilter.trim().toLowerCase());
        });

    const handleRequestJoin = async () => {
        if (!selectedClub || isRequestingJoin) return;
        setIsRequestingJoin(true);
        setJoinSuccess(false);
        try {
            const success = await joinClub(selectedClub.id);
            if (success) {
                setJoinSuccess(true);
                setTimeout(() => {
                    setSelectedClub(null);
                    setJoinSuccess(false);
                }, 900);
            }
        } catch (err: any) {
            alert('Gagal mengirim permintaan bergabung: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsRequestingJoin(false);
        }
    };

    const handleRespondRequest = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
        if (isResponding) return;
        setIsResponding(true);
        try {
            const res = await api.post('/profile/respond-integration', { requestId, action });
            if (res.data.success) {
                setSelectedPendingRequest(null);
                window.location.reload();
            }
        } catch (err: any) {
            alert('Gagal memproses permintaan: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsResponding(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary-400" />
                        Integrasi Data
                    </h2>
                    <p className="text-sm text-dark-400 mt-1">Kelola hubungan dengan Atlet (Anak).</p>
                </div>
            </div>

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
                        <Search className="w-4 h-4" />
                        Hubungkan Atlet
                    </button>
                </div>

                <div className="space-y-4">
                    {pendingRequests.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2 px-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Menunggu Konfirmasi Ortu
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {pendingRequests.map((req: any) => (
                                    <div
                                        key={req.id}
                                        onClick={() => setSelectedPendingRequest(req)}
                                        className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                            <Users className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                                {req.athlete?.user?.name || 'Calon Anak'}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-amber-400/70 font-mono">
                                                    {req.athlete?.user?.coreId || 'NO CORE ID'}
                                                </span>
                                                <span className="text-dark-500 text-xs">•</span>
                                                <span className="text-xs text-dark-400 italic">Klik untuk Konfirmasi</span>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20">
                                            KONFIRMASI
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {linkedAthletes.length > 0 ? (
                        <div className="space-y-3">
                            {pendingRequests.length > 0 && (
                                <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider px-1 pt-2">
                                    Sudah Terhubung
                                </h3>
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                {linkedAthletes.map((athlete: any) => (
                                    <div
                                        key={athlete.id}
                                        onClick={() => setSelectedLinkedAthlete(athlete)}
                                        className="p-4 rounded-xl bg-dark-800/50 flex items-center gap-4 border border-white/5 hover:border-primary-500/30 cursor-pointer transition-all group"
                                    >
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
                                                <span className="text-dark-400 font-mono text-xs">{athlete.user?.coreId || 'NO ID'}</span>
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
                        </div>
                    ) : pendingRequests.length === 0 ? (
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
                    ) : null}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Building2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Cari Klub</h3>
                            <p className="text-xs text-dark-400">Cari klub berdasarkan kota, lalu ajukan permintaan bergabung.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            value={clubCityFilter}
                            onChange={(e) => setClubCityFilter(e.target.value)}
                            className="input w-full pl-12 h-12"
                            placeholder="Filter kota (misal: Jakarta)"
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            value={clubNameFilter}
                            onChange={(e) => setClubNameFilter(e.target.value)}
                            className="input w-full pl-12 h-12"
                            placeholder="Cari nama klub"
                        />
                    </div>
                </div>

                {isClubsLoading ? (
                    <div className="p-4 rounded-xl border bg-dark-800/50 border-white/5 flex items-center gap-3 text-dark-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Memuat daftar klub...</span>
                    </div>
                ) : (
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-white/10 rounded-xl p-2 bg-dark-900/30">
                        {filteredClubs.map(club => (
                            <div key={club.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800 border border-white/5 hover:border-primary-500/30 transition-all group">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors truncate">{club.name}</h4>
                                    <p className="text-xs text-dark-400 truncate">{club.city || 'Unknown City'}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedClub(club)}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-primary-600 hover:text-white text-dark-300 text-xs font-bold transition-all"
                                >
                                    DETAILS
                                </button>
                            </div>
                        ))}
                        {filteredClubs.length === 0 && (
                            <div className="text-center py-6 text-dark-500 text-sm">Tidak ada klub ditemukan.</div>
                        )}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {selectedLinkedAthlete && showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => setSelectedLinkedAthlete(null)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-dark-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-1 bg-gradient-to-r from-primary-500/50 to-blue-500/50" />

                            <div className="p-6">
                                <div className="flex justify-center mb-6">
                                    <div className="w-24 h-24 rounded-full bg-dark-800 border-2 border-primary-500/30 flex items-center justify-center shadow-2xl overflow-hidden">
                                        {selectedLinkedAthlete.user?.avatarUrl ? (
                                            <img
                                                src={selectedLinkedAthlete.user.avatarUrl}
                                                className="w-full h-full object-cover"
                                                alt="Athlete"
                                            />
                                        ) : (
                                            <Users className="w-12 h-12 text-primary-500/50" />
                                        )}
                                    </div>
                                </div>

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {selectedLinkedAthlete.user?.name}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-mono font-bold border border-primary-500/20">
                                            {selectedLinkedAthlete.user?.coreId || 'NO CORE ID'}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-dark-800 border border-white/5 flex items-center gap-4 text-left group-focus-within:border-primary-500/50 transition-all">
                                            <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                                                <Phone className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider mb-1">WhatsApp Anak</p>
                                                <input
                                                    type="tel"
                                                    value={editWhatsapp}
                                                    onChange={(e) => setEditWhatsapp(e.target.value)}
                                                    placeholder="62812xxxxxx"
                                                    className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-dark-600 font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-dark-800 border border-white/5 flex items-center gap-4 text-left group-focus-within:border-primary-500/50 transition-all">
                                            <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                                                <Fingerprint className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider mb-1">
                                                    NIK Anak
                                                </p>
                                                <input
                                                    type="text"
                                                    maxLength={16}
                                                    value={editNik}
                                                    onChange={(e) => setEditNik(e.target.value)}
                                                    placeholder="16 Digit NIK"
                                                    className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-dark-600 font-mono font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-dark-800 border border-white/5 flex items-center gap-4 text-left group-focus-within:border-primary-500/50 transition-all">
                                            <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                                                <Building2 className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider mb-1">Klub Saat Ini</p>
                                                <select
                                                    value={editClubId}
                                                    onChange={(e) => setEditClubId(e.target.value)}
                                                    className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 font-medium appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-dark-900">Tidak ada Klub</option>
                                                    {clubs.map(c => (
                                                        <option key={c.id} value={c.id} className="bg-dark-900">{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 pt-0 space-y-3">
                                    <button
                                        onClick={handleUpdateChild}
                                        disabled={isUpdatingChild}
                                        className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-dark-800 disabled:text-dark-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
                                    >
                                        {isUpdatingChild ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> SIMPAN PERUBAHAN</>}
                                    </button>

                                    <button
                                        onClick={() => setSelectedLinkedAthlete(null)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/5 uppercase tracking-widest text-sm"
                                    >
                                        TUTUP DETAIL
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {selectedPendingRequest && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => setSelectedPendingRequest(null)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-dark-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-1 bg-gradient-to-r from-amber-500/50 to-orange-500/50" />

                            <div className="p-6">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-dark-800 border-2 border-amber-500/30 flex items-center justify-center shadow-2xl overflow-hidden">
                                        {selectedPendingRequest.athlete?.user?.avatarUrl ? (
                                            <img
                                                src={selectedPendingRequest.athlete.user.avatarUrl}
                                                className="w-full h-full object-cover"
                                                alt="Athlete"
                                            />
                                        ) : (
                                            <Users className="w-10 h-10 text-amber-500/50" />
                                        )}
                                    </div>
                                </div>

                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {selectedPendingRequest.athlete?.user?.name}
                                    </h3>
                                    <p className="text-amber-400 font-mono text-sm">
                                        Core ID: {selectedPendingRequest.athlete?.user?.coreId}
                                    </p>
                                    <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-dark-300">
                                        Apakah Anda mengonfirmasi bahwa orang ini adalah anak Anda?
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleRespondRequest(selectedPendingRequest.id, 'REJECT')}
                                        disabled={isResponding}
                                        className="py-3 rounded-xl border border-white/10 text-dark-300 hover:bg-white/5 font-bold transition-all disabled:opacity-50"
                                    >
                                        REJECT
                                    </button>
                                    <button
                                        onClick={() => handleRespondRequest(selectedPendingRequest.id, 'APPROVE')}
                                        disabled={isResponding}
                                        className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isResponding && <Loader2 className="w-4 h-4 animate-spin" />}
                                        CONFIRM
                                    </button>
                                </div>

                                <button
                                    onClick={() => setSelectedPendingRequest(null)}
                                    className="w-full mt-4 text-xs text-dark-500 hover:text-dark-400 transition-colors uppercase tracking-widest font-bold"
                                >
                                    BATAL
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
