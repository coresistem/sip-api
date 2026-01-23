import { useState, useEffect } from 'react';
import { Check, X, FileText, User, Image, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../context/AuthContext';

interface RoleRequest {
    id: string;
    userId: string;
    requestedRole: string;
    status: string;
    nikDocumentUrl?: string;
    certDocumentUrl?: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        nik?: string;
        nikVerified: boolean;
        avatarUrl?: string;
    };
}

const ROLE_LABELS: Record<string, string> = {
    COACH: 'Pelatih',
    JUDGE: 'Juri',
    PARENT: 'Orang Tua',
    EO: 'Event Organizer',
    ATHLETE: 'Atlet',
};

export default function RoleRequestsAdminPage() {
    const [requests, setRequests] = useState<RoleRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/role-requests/pending');
            setRequests(res.data.data || []);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Gagal memuat permintaan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string) => {
        setProcessing(id);
        try {
            await api.patch(`/role-requests/${id}/approve`);
            toast.success('Permintaan disetujui');
            fetchRequests();
        } catch (error) {
            toast.error('Gagal menyetujui');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Alasan penolakan (opsional):');
        setProcessing(id);
        try {
            await api.patch(`/role-requests/${id}/reject`, { reason });
            toast.success('Permintaan ditolak');
            fetchRequests();
        } catch (error) {
            toast.error('Gagal menolak');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pengajuan Peran Baru</h1>
                    <p className="text-dark-400">Kelola permintaan peran dari pengguna</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300"
                >
                    <RefreshCw className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 text-dark-400">
                    <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Tidak ada permintaan baru</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-dark-600 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-dark-700/50 flex-shrink-0 flex items-center justify-center border border-dark-600/30 overflow-hidden">
                                        {req.user.avatarUrl ? (
                                            <img src={req.user.avatarUrl} alt={req.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6 text-dark-500" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-white truncate">{req.user.name}</h3>
                                        <p className="text-sm text-dark-400 truncate">{req.user.email}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-primary-500/10 text-primary-400 border border-primary-500/20">
                                                {ROLE_LABELS[req.requestedRole] || req.requestedRole}
                                            </span>
                                            {req.user.nikVerified && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Terverifikasi
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center sm:justify-end gap-2 pt-2 sm:pt-0">
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        disabled={processing === req.id}
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 active:scale-95 transition-all disabled:opacity-50 border border-emerald-600/30"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span className="sm:hidden text-xs font-bold">SETUJUI</span>
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        disabled={processing === req.id}
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 active:scale-95 transition-all disabled:opacity-50 border border-red-600/30"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="sm:hidden text-xs font-bold">TOLAK</span>
                                    </button>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="flex gap-3 mt-4 pt-4 border-t border-dark-700">
                                {req.nikDocumentUrl && (
                                    <a
                                        href={req.nikDocumentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600"
                                    >
                                        <Image className="w-4 h-4" />
                                        <span className="text-sm">Foto KTP</span>
                                    </a>
                                )}
                                {req.certDocumentUrl && (
                                    <a
                                        href={req.certDocumentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span className="text-sm">Sertifikat</span>
                                    </a>
                                )}
                            </div>

                            {/* Timestamp */}
                            <div className="text-xs text-dark-500 mt-3">
                                Diajukan: {new Date(req.createdAt).toLocaleString('id-ID')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
