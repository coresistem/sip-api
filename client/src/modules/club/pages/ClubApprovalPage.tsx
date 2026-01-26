import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Search,
    Check,
    X,
    Loader2,
    MapPin,
    Users,
    Calendar,
    FileText,
    Eye,
    AlertCircle
} from 'lucide-react';
import { api } from '../../core/contexts/AuthContext';

interface ClubRequest {
    id: string;
    clubName: string;
    location: string;
    ownerName: string;
    ownerEmail: string;
    memberCount: number;
    documents: string[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
    notes?: string;
}

// Mock data
const MOCK_REQUESTS: ClubRequest[] = [
    {
        id: '1',
        clubName: 'Klub Panahan Sejahtera',
        location: 'Surabaya',
        ownerName: 'Ahmad Wijaya',
        ownerEmail: 'ahmad@email.com',
        memberCount: 25,
        documents: ['registration.pdf', 'owner_id.pdf'],
        status: 'PENDING',
        submittedAt: '2026-01-10'
    },
    {
        id: '2',
        clubName: 'Archery Stars Club',
        location: 'Semarang',
        ownerName: 'Budi Santoso',
        ownerEmail: 'budi@email.com',
        memberCount: 15,
        documents: ['registration.pdf'],
        status: 'PENDING',
        submittedAt: '2026-01-08'
    },
    {
        id: '3',
        clubName: 'Klub Busur Jaya',
        location: 'Malang',
        ownerName: 'Citra Dewi',
        ownerEmail: 'citra@email.com',
        memberCount: 30,
        documents: ['registration.pdf', 'owner_id.pdf', 'facility.pdf'],
        status: 'APPROVED',
        submittedAt: '2026-01-05'
    }
];

export default function ClubApprovalPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<ClubRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    const [selectedRequest, setSelectedRequest] = useState<ClubRequest | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/perpani/club-requests');
            setRequests(response.data?.length > 0 ? response.data : MOCK_REQUESTS);
        } catch (error) {
            console.log('Using mock data');
            setRequests(MOCK_REQUESTS);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(true);
        try {
            await api.post(`/perpani/club-requests/${id}/approve`);
        } catch {
            // Mock success
        }
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
        setShowDetailModal(false);
        setActionLoading(false);
    };

    const handleReject = async (id: string) => {
        setActionLoading(true);
        try {
            await api.post(`/perpani/club-requests/${id}/reject`, { notes: rejectNote });
        } catch {
            // Mock success
        }
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED', notes: rejectNote } : r));
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectNote('');
        setActionLoading(false);
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-dark-700 text-dark-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">
                        Club <span className="gradient-text">Approval</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Review and approve club registrations
                    </p>
                </div>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">{pendingCount} pending</span>
                    </div>
                )}
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col md:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search clubs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === status
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Requests List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                {filteredRequests.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                        <h3 className="text-lg font-medium text-white mb-2">No Requests Found</h3>
                        <p className="text-dark-400">No club registration requests match your filters.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {filteredRequests.map(request => (
                            <div key={request.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{request.clubName}</div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-dark-400">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{request.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    <span>{request.memberCount} members</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(request.submittedAt).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(request.status)}`}>
                                            {request.status}
                                        </span>
                                        <button
                                            onClick={() => { setSelectedRequest(request); setShowDetailModal(true); }}
                                            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {request.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={actionLoading}
                                                    className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedRequest(request); setShowRejectModal(true); }}
                                                    disabled={actionLoading}
                                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDetailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card p-6 max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">{selectedRequest.clubName}</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-dark-400" />
                                    <span className="text-white">{selectedRequest.location}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-dark-400" />
                                    <span className="text-white">{selectedRequest.memberCount} members</span>
                                </div>
                                <div>
                                    <div className="text-sm text-dark-400 mb-2">Owner</div>
                                    <div className="text-white">{selectedRequest.ownerName}</div>
                                    <div className="text-sm text-dark-400">{selectedRequest.ownerEmail}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-dark-400 mb-2">Documents ({selectedRequest.documents.length})</div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRequest.documents.map((doc, i) => (
                                            <span key={i} className="px-3 py-1 bg-dark-700 rounded text-sm flex items-center gap-1">
                                                <FileText className="w-3 h-3" />
                                                {doc}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowDetailModal(false)} className="btn-secondary w-full">
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowRejectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">Reject Club Registration</h3>
                            <p className="text-dark-400 mb-4">
                                You are rejecting <span className="text-white font-medium">{selectedRequest.clubName}</span>.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm text-dark-400 mb-2">Rejection Reason</label>
                                <textarea
                                    value={rejectNote}
                                    onChange={(e) => setRejectNote(e.target.value)}
                                    placeholder="Enter reason..."
                                    className="input w-full h-24 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowRejectModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReject(selectedRequest.id)}
                                    disabled={actionLoading}
                                    className="btn bg-red-500 hover:bg-red-600 text-white flex-1 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                    Reject
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
