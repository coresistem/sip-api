import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    AlertTriangle,
    Loader2,
    Target,
    User,
    Calendar,
    RefreshCw
} from 'lucide-react';
import { api } from '../../core/contexts/AuthContext';

interface PendingScore {
    id: string;
    sessionDate: string;
    sessionType: string;
    totalScore: number;
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
    athlete: {
        id: string;
        user: { name: string };
    };
    coach?: { name: string };
}

export default function ScoreValidationPage() {
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState<string | null>(null);
    const [scores, setScores] = useState<PendingScore[]>([]);
    const [statusFilter, setStatusFilter] = useState<'pending' | 'verified' | 'all'>('pending');

    useEffect(() => {
        fetchScores();
    }, [statusFilter]);

    const fetchScores = async () => {
        setLoading(true);
        try {
            let url = '/scores?limit=50';
            if (statusFilter === 'pending') {
                url += '&isVerified=false';
            } else if (statusFilter === 'verified') {
                url += '&isVerified=true';
            }

            const response = await api.get(url);
            if (response.data.success) {
                setScores(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch scores:', error);
            setScores([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (scoreId: string) => {
        setVerifying(scoreId);
        try {
            const response = await api.patch(`/scores/${scoreId}/verify`, {
                isVerified: true,
                notes: 'Verified by coach'
            });

            if (response.data.success) {
                // Update local state
                setScores(prev => prev.map(s =>
                    s.id === scoreId
                        ? { ...s, isVerified: true, verifiedAt: new Date().toISOString() }
                        : s
                ));

                // If filtering by pending, remove from list
                if (statusFilter === 'pending') {
                    setScores(prev => prev.filter(s => s.id !== scoreId));
                }
            }
        } catch (error) {
            console.error('Failed to verify score:', error);
            alert('Failed to verify score');
        } finally {
            setVerifying(null);
        }
    };

    const pendingCount = scores.filter(s => !s.isVerified).length;

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
                        Score <span className="gradient-text">Verification</span>
                    </h1>
                    <p className="text-dark-400 mt-1">Review and verify athlete training scores</p>
                </div>
                <div className="flex items-center gap-3">
                    {statusFilter === 'pending' && pendingCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <span className="text-amber-400 font-medium">{pendingCount} pending</span>
                        </div>
                    )}
                    <button
                        onClick={fetchScores}
                        className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2"
            >
                {[
                    { key: 'pending' as const, label: 'Pending', icon: AlertTriangle },
                    { key: 'verified' as const, label: 'Verified', icon: CheckCircle },
                    { key: 'all' as const, label: 'All', icon: Target },
                ].map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => setStatusFilter(filter.key)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${statusFilter === filter.key
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                            }`}
                    >
                        <filter.icon className="w-4 h-4" />
                        {filter.label}
                    </button>
                ))}
            </motion.div>

            {/* Scores List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                {scores.length === 0 ? (
                    <div className="p-12 text-center">
                        <Target className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                        <p className="text-dark-400 text-lg">
                            {statusFilter === 'pending'
                                ? 'No pending scores to verify'
                                : 'No scores found'}
                        </p>
                        <p className="text-dark-500 text-sm mt-2">
                            Athlete scores will appear here for verification
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {scores.map((score, index) => (
                            <motion.div
                                key={score.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="p-4 hover:bg-dark-800/50 transition-colors"
                            >
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${score.isVerified
                                            ? 'bg-emerald-500/20'
                                            : 'bg-amber-500/20'
                                            }`}>
                                            {score.isVerified ? (
                                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                                            ) : (
                                                <AlertTriangle className="w-6 h-6 text-amber-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-dark-400" />
                                                <span className="font-medium text-white">
                                                    {score.athlete?.user?.name || 'Unknown Athlete'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-dark-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(score.sessionDate).toLocaleDateString('id-ID')}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-dark-700 text-xs">
                                                    {score.sessionType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary-400">
                                                {score.totalScore}
                                            </div>
                                            <div className="text-xs text-dark-400">Total Score</div>
                                        </div>

                                        {score.isVerified ? (
                                            <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                                                Verified
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleVerify(score.id)}
                                                disabled={verifying === score.id}
                                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {verifying === score.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

