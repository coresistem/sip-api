import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    UserX,
    Search,
    Loader2,
    Check,
    X,
    Clock,
    Mail,
    Phone,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { api } from '../context/AuthContext';

interface MemberRequest {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    requestType: 'ATHLETE' | 'COACH' | 'PARENT';
    athleteData?: {
        archeryCategory: string;
        skillLevel: string;
        dateOfBirth?: string;
    };
    createdAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    notes?: string;
}

// Mock data
const MOCK_REQUESTS: MemberRequest[] = [
    {
        id: '1',
        user: { id: 'u1', name: 'Ahmad Santoso', email: 'ahmad@email.com', phone: '08123456789' },
        requestType: 'ATHLETE',
        athleteData: { archeryCategory: 'RECURVE', skillLevel: 'BEGINNER', dateOfBirth: '2008-05-15' },
        createdAt: '2026-01-12T10:30:00Z',
        status: 'PENDING'
    },
    {
        id: '2',
        user: { id: 'u2', name: 'Budi Prasetyo', email: 'budi@email.com', phone: '08234567890' },
        requestType: 'ATHLETE',
        athleteData: { archeryCategory: 'COMPOUND', skillLevel: 'INTERMEDIATE', dateOfBirth: '2005-11-20' },
        createdAt: '2026-01-11T14:00:00Z',
        status: 'PENDING'
    },
    {
        id: '3',
        user: { id: 'u3', name: 'Citra Dewi', email: 'citra@email.com', phone: '08345678901' },
        requestType: 'COACH',
        createdAt: '2026-01-10T09:15:00Z',
        status: 'PENDING'
    },
    {
        id: '4',
        user: { id: 'u4', name: 'Dian Permata', email: 'dian@email.com', phone: '08456789012' },
        requestType: 'PARENT',
        createdAt: '2026-01-09T16:45:00Z',
        status: 'APPROVED'
    },
    {
        id: '5',
        user: { id: 'u5', name: 'Eko Wijaya', email: 'eko@email.com' },
        requestType: 'ATHLETE',
        athleteData: { archeryCategory: 'BAREBOW', skillLevel: 'BEGINNER' },
        createdAt: '2026-01-08T11:20:00Z',
        status: 'REJECTED',
        notes: 'Incomplete documentation'
    }
];

export default function MemberApprovalPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<MemberRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
    const [selectedRequest, setSelectedRequest] = useState<MemberRequest | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [isUsingMock, setIsUsingMock] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/clubs/member-requests');
            // Check if response is array or success object
            const data = Array.isArray(response.data) ? response.data :
                (response.data.success && Array.isArray(response.data.data)) ? response.data.data : [];

            setRequests(data);
            setIsUsingMock(false);
        } catch (error) {
            console.log('Using mock member requests', error);
            setRequests(MOCK_REQUESTS);
            setIsUsingMock(true);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        setActionLoading(true);
        try {
            await api.post(`/clubs/member-requests/${requestId}/approve`);
            setRequests(prev => prev.map(r =>
                r.id === requestId ? { ...r, status: 'APPROVED' } : r
            ));
            setSelectedRequest(null);
        } catch (error) {
            if (isUsingMock) {
                // Mock success
                setRequests(prev => prev.map(r =>
                    r.id === requestId ? { ...r, status: 'APPROVED' } : r
                ));
            }
            setSelectedRequest(null);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (requestId: string) => {
        setActionLoading(true);
        try {
            await api.post(`/clubs/member-requests/${requestId}/reject`, { notes: rejectNote });
            setRequests(prev => prev.map(r =>
                r.id === requestId ? { ...r, status: 'REJECTED', notes: rejectNote } : r
            ));
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectNote('');
        } catch (error) {
            if (isUsingMock) {
                // Mock success
                setRequests(prev => prev.map(r =>
                    r.id === requestId ? { ...r, status: 'REJECTED', notes: rejectNote } : r
                ));
            }
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectNote('');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'APPROVED':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'REJECTED':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-dark-700 text-dark-400';
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'ATHLETE':
                return 'bg-blue-500/20 text-blue-400';
            case 'COACH':
                return 'bg-green-500/20 text-green-400';
            case 'PARENT':
                return 'bg-purple-500/20 text-purple-400';
            default:
                return 'bg-dark-700 text-dark-400';
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
                        Member <span className="gradient-text">Approval</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Review and manage membership requests
                    </p>
                    {isUsingMock && (
                        <span className="inline-block px-2 py-0.5 mt-2 rounded bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
                            Viewing Mock Data (Connection Failed)
                        </span>
                    )}
                </div>

                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">{pendingCount} pending requests</span>
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
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
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
                        <UserPlus className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                        <h3 className="text-lg font-medium text-white mb-2">No Requests Found</h3>
                        <p className="text-dark-400">
                            {statusFilter === 'PENDING' ? 'All membership requests have been processed!' : 'No matching requests found.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {filteredRequests.map((request) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 hover:bg-dark-800/50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {request.user.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-medium text-white">{request.user.name}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeBadge(request.requestType)}`}>
                                                {request.requestType}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getStatusBadge(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-dark-400">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                <span>{request.user.email}</span>
                                            </div>
                                            {request.user.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{request.user.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(request.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        {request.athleteData && (
                                            <div className="flex gap-2 mt-2">
                                                <span className="px-2 py-0.5 text-xs bg-dark-700 rounded">{request.athleteData.archeryCategory}</span>
                                                <span className="px-2 py-0.5 text-xs bg-dark-700 rounded">{request.athleteData.skillLevel}</span>
                                            </div>
                                        )}
                                        {request.notes && (
                                            <p className="text-sm text-red-400 mt-2 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {request.notes}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {request.status === 'PENDING' && (
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleApprove(request.id)}
                                                disabled={actionLoading}
                                                className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-1"
                                            >
                                                <Check className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => { setSelectedRequest(request); setShowRejectModal(true); }}
                                                disabled={actionLoading}
                                                className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-1"
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

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
                            <h3 className="text-lg font-semibold text-white mb-4">Reject Membership Request</h3>
                            <p className="text-dark-400 mb-4">
                                You are about to reject the membership request from <span className="text-white font-medium">{selectedRequest.user.name}</span>.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm text-dark-400 mb-2">Rejection Reason (Optional)</label>
                                <textarea
                                    value={rejectNote}
                                    onChange={(e) => setRejectNote(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    className="input w-full h-24 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReject(selectedRequest.id)}
                                    disabled={actionLoading}
                                    className="btn bg-red-500 hover:bg-red-600 text-white flex-1 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
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
