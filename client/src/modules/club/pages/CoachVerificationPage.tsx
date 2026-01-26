import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../core/contexts/AuthContext';
import {
    Award, CheckCircle, XCircle, Clock, User, Building2,
    FileText, ExternalLink, RefreshCw, Search
} from 'lucide-react';

interface PendingCoach {
    id: string;
    userId: string;
    certificateUrl?: string;
    certificateLevel?: string;
    verificationStatus: string;
    bio?: string;
    yearsExperience?: number;
    createdAt: string;
    user: {
        name: string;
        email: string;
        sipId?: string;
        club?: { name: string };
    };
}

export default function CoachVerificationPage() {
    const [coaches, setCoaches] = useState<PendingCoach[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCoach, setSelectedCoach] = useState<PendingCoach | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPendingCoaches();
    }, []);

    const fetchPendingCoaches = async () => {
        setLoading(true);
        try {
            const response = await api.get('/coaches/pending');
            if (response.data.success) {
                setCoaches(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch pending coaches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (coachId: string, status: 'VERIFIED' | 'REJECTED') => {
        setProcessing(true);
        try {
            const response = await api.post(`/coaches/${coachId}/verify`, {
                status,
                rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
            });

            if (response.data.success) {
                // Remove from list
                setCoaches(prev => prev.filter(c => c.id !== coachId));
                setSelectedCoach(null);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Failed to verify coach:', error);
            alert('Failed to process verification');
        } finally {
            setProcessing(false);
        }
    };

    const filteredCoaches = coaches.filter(coach =>
        coach.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.user.sipId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-amber-400" />
                        Coach Certification Verification
                    </h1>
                    <p className="text-dark-400">
                        Review and verify coach certification submissions
                    </p>
                </div>

                <button
                    onClick={fetchPendingCoaches}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{coaches.length}</p>
                        <p className="text-dark-400 text-sm">Pending Verifications</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">-</p>
                        <p className="text-dark-400 text-sm">Verified This Month</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">-</p>
                        <p className="text-dark-400 text-sm">Rejected This Month</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, or SIP ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full pl-12"
                />
            </div>

            {/* Pending Coaches List */}
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">Pending Submissions</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    </div>
                ) : filteredCoaches.length === 0 ? (
                    <div className="text-center py-12 text-dark-400">
                        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No pending coach verifications</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCoaches.map((coach, index) => (
                            <motion.div
                                key={coach.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedCoach?.id === coach.id
                                    ? 'bg-primary-500/10 border-primary-500'
                                    : 'bg-dark-800 border-dark-700 hover:border-dark-600'
                                    }`}
                                onClick={() => setSelectedCoach(coach)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                                            {coach.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{coach.user.name}</h3>
                                            <p className="text-dark-400 text-sm">{coach.user.email}</p>
                                            {coach.user.sipId && (
                                                <p className="text-primary-400 text-sm font-mono mt-1">
                                                    {coach.user.sipId}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                                            {coach.certificateLevel || 'No Level'}
                                        </span>
                                        <p className="text-dark-500 text-xs mt-2">
                                            {new Date(coach.createdAt).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                </div>

                                {coach.user.club && (
                                    <div className="flex items-center gap-2 mt-3 text-dark-400 text-sm">
                                        <Building2 className="w-4 h-4" />
                                        {coach.user.club.name}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedCoach && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedCoach(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-dark-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary-400" />
                                Coach Verification Details
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {selectedCoach.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">{selectedCoach.user.name}</h4>
                                        <p className="text-dark-400">{selectedCoach.user.email}</p>
                                        {selectedCoach.user.sipId && (
                                            <p className="text-primary-400 font-mono text-sm">
                                                {selectedCoach.user.sipId}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-dark-400 text-sm">Certification Level</label>
                                        <p className="font-medium">{selectedCoach.certificateLevel || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="text-dark-400 text-sm">Years of Experience</label>
                                        <p className="font-medium">{selectedCoach.yearsExperience || 0} years</p>
                                    </div>
                                </div>

                                {selectedCoach.bio && (
                                    <div>
                                        <label className="text-dark-400 text-sm">Bio</label>
                                        <p className="text-dark-200">{selectedCoach.bio}</p>
                                    </div>
                                )}

                                {selectedCoach.certificateUrl && (
                                    <div>
                                        <label className="text-dark-400 text-sm block mb-2">Certificate Document</label>
                                        <a
                                            href={selectedCoach.certificateUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
                                        >
                                            <FileText className="w-4 h-4" />
                                            View Certificate
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}

                                <div className="border-t border-dark-700 pt-4 mt-4">
                                    <label className="text-dark-400 text-sm block mb-2">
                                        Rejection Reason (if rejecting)
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter reason for rejection..."
                                        className="input w-full"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => handleVerify(selectedCoach.id, 'VERIFIED')}
                                        disabled={processing}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Verify
                                    </button>
                                    <button
                                        onClick={() => handleVerify(selectedCoach.id, 'REJECTED')}
                                        disabled={processing || !rejectionReason.trim()}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-400 hover:to-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                </div>

                                <button
                                    onClick={() => setSelectedCoach(null)}
                                    className="w-full py-2 text-dark-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
