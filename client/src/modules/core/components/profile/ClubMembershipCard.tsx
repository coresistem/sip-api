import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, Clock, Loader2, Search } from 'lucide-react';
import { api } from '../../contexts/AuthContext';
import { ClubStatusResponse, getClubStatus, joinClub } from '../../services/profileApi';

interface ClubMembershipCardProps {
    isMinor?: boolean;
    cityName?: string;
}

export default function ClubMembershipCard({ isMinor = false, cityName }: ClubMembershipCardProps) {
    const [status, setStatus] = useState<ClubStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [showClubSearch, setShowClubSearch] = useState(false);
    const [clubSearchTerm, setClubSearchTerm] = useState('');
    const [allClubs, setAllClubs] = useState<{ id: string; name: string; city: string }[]>([]);
    const [isJoiningClub, setIsJoiningClub] = useState(false);

    const fetchStatus = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const data = await getClubStatus();
            setStatus(data);
        } catch (err: any) {
            setErrorMessage(err?.response?.data?.message || 'Failed to fetch club status');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        if (showClubSearch && allClubs.length === 0) {
            api.get('/auth/clubs').then(res => setAllClubs(res.data.data)).catch(() => {
                setErrorMessage('Failed to load club list');
            });
        }
    }, [showClubSearch, allClubs.length]);

    const filteredClubs = useMemo(() => {
        const term = clubSearchTerm.trim().toLowerCase();
        if (!term) return allClubs;
        return allClubs.filter(c => c.name.toLowerCase().includes(term));
    }, [allClubs, clubSearchTerm]);

    const handleJoinClub = async (clubId: string) => {
        if (isJoiningClub) return;
        setIsJoiningClub(true);
        setErrorMessage(null);
        try {
            const success = await joinClub(clubId);
            if (success) {
                setShowClubSearch(false);
                setClubSearchTerm('');
                await fetchStatus();
            }
        } catch (err: any) {
            setErrorMessage(err?.response?.data?.message || 'Failed to send join request');
        } finally {
            setIsJoiningClub(false);
        }
    };

    const title = 'Club Affiliation';

    return (
        <div className="card">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-xs text-dark-400">Bergabung dengan klub untuk mengikuti event resmi.</p>
                </div>
            </div>

            {errorMessage && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-400">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <div className="p-4 rounded-xl border bg-dark-800/50 border-white/5 flex items-center gap-3 text-dark-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading club status...</span>
                </div>
            ) : (
                (() => {
                    const s = status?.status;

                    if (isMinor && s !== 'MEMBER') {
                        return (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
                                <AlertCircle className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-amber-400 mb-1">Pendaftaran Melalui Orang Tua</h4>
                                    <p className="text-sm text-amber-200/70 leading-relaxed">
                                        Karena usia Anda di bawah 18 tahun, pendaftaran klub harus dilakukan oleh Orang Tua/Wali yang terhubung.
                                        Pastikan data Orang Tua sudah terisi dengan benar.
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    if (s === 'MEMBER') {
                        return (
                            <div className="p-4 rounded-xl border flex items-center justify-between bg-dark-800/50 border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{status?.club?.name || 'Club'}</h4>
                                        <p className="text-sm text-dark-400 mt-0.5">Member Aktif</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                    MEMBER
                                </span>
                            </div>
                        );
                    }

                    if (s === 'PENDING') {
                        return (
                            <div className="p-4 rounded-xl border flex items-center justify-between bg-amber-500/5 border-amber-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/10">
                                        <Clock className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-400">Menunggu Persetujuan Admin Klub</h4>
                                        <p className="text-sm text-amber-200/60 mt-0.5">{status?.pendingRequest?.club?.name || 'Club'}</p>
                                    </div>
                                </div>
                                <button
                                    disabled
                                    className="px-4 py-2 rounded-lg bg-white/5 text-dark-500 text-xs font-bold cursor-not-allowed"
                                >
                                    PENDING
                                </button>
                            </div>
                        );
                    }

                    if (s === 'LEFT') {
                        return (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl border flex items-center justify-between bg-dark-800/50 border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-dark-700/60">
                                            <Building2 className="w-5 h-5 text-dark-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Ex-Member</h4>
                                            <p className="text-sm text-dark-400 mt-0.5">
                                                {status?.lastClub?.name ? `Terakhir: ${status.lastClub.name}` : 'Anda saat ini tidak tergabung dalam klub.'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-dark-700 text-dark-300 border border-white/5">
                                        LEFT
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                                            <input
                                                type="text"
                                                value={clubSearchTerm}
                                                onChange={(e) => setClubSearchTerm(e.target.value)}
                                                onFocus={() => setShowClubSearch(true)}
                                                className="input w-full pl-12 h-12"
                                                placeholder={`Cari klub di ${cityName || 'kota Anda'}...`}
                                            />
                                        </div>
                                    </div>
                                    {showClubSearch && (
                                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-white/10 rounded-xl p-2 bg-dark-900/30">
                                            {filteredClubs.map(club => (
                                                <div key={club.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800 border border-white/5 hover:border-primary-500/30 transition-all group">
                                                    <div>
                                                        <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors">{club.name}</h4>
                                                        <p className="text-xs text-dark-400">{club.city}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleJoinClub(club.id)}
                                                        disabled={isJoiningClub}
                                                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-primary-600 hover:text-white text-dark-300 text-xs font-bold transition-all"
                                                    >
                                                        {isJoiningClub ? '...' : 'GABUNG'}
                                                    </button>
                                                </div>
                                            ))}
                                            {filteredClubs.length === 0 && (
                                                <div className="text-center py-4 text-dark-500 text-sm">Tidak ada klub ditemukan.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border flex items-center justify-between bg-amber-500/5 border-amber-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/10">
                                        <Building2 className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-400">Belum Bergabung</h4>
                                        <p className="text-sm text-amber-200/60 mt-0.5">Silakan cari dan ajukan permintaan bergabung.</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                                    NO CLUB
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                                        <input
                                            type="text"
                                            value={clubSearchTerm}
                                            onChange={(e) => setClubSearchTerm(e.target.value)}
                                            onFocus={() => setShowClubSearch(true)}
                                            className="input w-full pl-12 h-12"
                                            placeholder={`Cari klub di ${cityName || 'kota Anda'}...`}
                                        />
                                    </div>
                                </div>

                                {showClubSearch && (
                                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-white/10 rounded-xl p-2 bg-dark-900/30">
                                        {filteredClubs.map(club => (
                                            <div key={club.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800 border border-white/5 hover:border-primary-500/30 transition-all group">
                                                <div>
                                                    <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors">{club.name}</h4>
                                                    <p className="text-xs text-dark-400">{club.city}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleJoinClub(club.id)}
                                                    disabled={isJoiningClub}
                                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-primary-600 hover:text-white text-dark-300 text-xs font-bold transition-all"
                                                >
                                                    {isJoiningClub ? '...' : 'GABUNG'}
                                                </button>
                                            </div>
                                        ))}
                                        {filteredClubs.length === 0 && (
                                            <div className="text-center py-4 text-dark-500 text-sm">Tidak ada klub ditemukan.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
}
