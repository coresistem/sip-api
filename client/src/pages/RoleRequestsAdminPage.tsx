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
                            className="p-4 rounded-xl bg-dark-800 border border-dark-700"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-dark-600 flex items-center justify-center">
                                        {req.user.avatarUrl ? (
                                            <img src={req.user.avatarUrl} alt={req.user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6 text-dark-400" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h3 className="font-semibold text-white">{req.user.name}</h3>
                                        <p className="text-sm text-dark-400">{req.user.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary-500/20 text-primary-400">
                                                {ROLE_LABELS[req.requestedRole] || req.requestedRole}
                                            </span>
                                            {req.user.nikVerified && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-success-500/20 text-success-400">
                                                    NIK Terverifikasi
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        disabled={processing === req.id}
                                        className="p-2 rounded-lg bg-success-500/20 text-success-400 hover:bg-success-500/30 disabled:opacity-50"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        disabled={processing === req.id}
                                        className="p-2 rounded-lg bg-danger-500/20 text-danger-400 hover:bg-danger-500/30 disabled:opacity-50"
                                    >
                                        <X className="w-5 h-5" />
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
