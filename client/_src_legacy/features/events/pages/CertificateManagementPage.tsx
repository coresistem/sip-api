import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Award,
    Download,
    RefreshCw,
    Loader2,
    QrCode,
    Users,
    Trophy,
    FileText,
    Trash2
} from 'lucide-react';
import { api } from '../../../context/AuthContext';

interface Certificate {
    id: string;
    recipientName: string;
    category: string;
    achievement: string;
    rank: number | null;
    totalScore: number | null;
    validationCode: string;
    templateType: string;
    issuedAt: string;
}

interface CertificateStats {
    total: number;
    gold: number;
    silver: number;
    bronze: number;
    participant: number;
}

interface Props {
    competitionId: string;
    competitionName?: string;
}

export default function CertificateManagementPage({ competitionId, competitionName }: Props) {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [stats, setStats] = useState<CertificateStats>({
        total: 0,
        gold: 0,
        silver: 0,
        bronze: 0,
        participant: 0
    });

    useEffect(() => {
        fetchCertificates();
    }, [competitionId]);

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/certificates/competition/${competitionId}`);
            if (response.data.success) {
                const certs = response.data.data || [];
                setCertificates(certs);

                // Calculate stats
                setStats({
                    total: certs.length,
                    gold: certs.filter((c: Certificate) => c.rank === 1).length,
                    silver: certs.filter((c: Certificate) => c.rank === 2).length,
                    bronze: certs.filter((c: Certificate) => c.rank === 3).length,
                    participant: certs.filter((c: Certificate) => !c.rank).length
                });
            }
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBulk = async (includeParticipants: boolean) => {
        setGenerating(true);
        try {
            const response = await api.post(`/certificates/generate-bulk/${competitionId}`, {
                includeParticipants
            });
            if (response.data.success) {
                alert(`${response.data.data.length} certificate(s) generated!`);
                fetchCertificates();
            }
        } catch (error) {
            console.error('Failed to generate certificates:', error);
            alert('Failed to generate certificates');
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this certificate?')) return;
        try {
            await api.delete(`/certificates/${id}`);
            setCertificates(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Failed to delete certificate:', error);
        }
    };

    const getRankBadge = (rank: number | null, templateType: string) => {
        if (rank === 1 || templateType === 'GOLD') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        if (rank === 2 || templateType === 'SILVER') return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
        if (rank === 3 || templateType === 'BRONZE') return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
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
                        <span className="gradient-text">Certificates</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        {competitionName || 'Competition'} - Generate and manage certificates
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchCertificates()}
                        disabled={loading}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.total}</div>
                            <div className="text-sm text-dark-400">Total</div>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-400">{stats.gold}</div>
                            <div className="text-sm text-dark-400">Gold</div>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-400/20 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-gray-300" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-300">{stats.silver}</div>
                            <div className="text-sm text-dark-400">Silver</div>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-400">{stats.bronze}</div>
                            <div className="text-sm text-dark-400">Bronze</div>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-400">{stats.participant}</div>
                            <div className="text-sm text-dark-400">Participants</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Generate Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-4"
            >
                <h2 className="text-lg font-semibold text-white mb-4">Generate Certificates</h2>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => handleGenerateBulk(false)}
                        disabled={generating}
                        className="btn-primary flex items-center gap-2"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                        Generate Winners Only (Top 3)
                    </button>
                    <button
                        onClick={() => handleGenerateBulk(true)}
                        disabled={generating}
                        className="btn-secondary flex items-center gap-2"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                        Generate All Participants
                    </button>
                </div>
                <p className="text-sm text-dark-400 mt-2">
                    Certificates will include QR codes for validation
                </p>
            </motion.div>

            {/* Certificates List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                <div className="p-4 border-b border-dark-700">
                    <h2 className="text-lg font-semibold text-white">Generated Certificates</h2>
                </div>
                {certificates.length === 0 ? (
                    <div className="p-12 text-center">
                        <Award className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                        <h3 className="text-lg font-medium text-white mb-2">No Certificates Yet</h3>
                        <p className="text-dark-400">Generate certificates using the buttons above.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {certificates.map(cert => (
                            <div key={cert.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRankBadge(cert.rank, cert.templateType)}`}>
                                            {cert.rank ? (
                                                <span className="text-lg font-bold">{cert.rank}</span>
                                            ) : (
                                                <Award className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{cert.recipientName}</div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-dark-400">
                                                <span>{cert.category}</span>
                                                <span className="text-dark-600">•</span>
                                                <span>{cert.achievement}</span>
                                                {cert.totalScore && (
                                                    <>
                                                        <span className="text-dark-600">•</span>
                                                        <span>Score: {cert.totalScore}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-sm text-dark-400">
                                            <QrCode className="w-4 h-4" />
                                            <span className="font-mono">{cert.validationCode}</span>
                                        </div>
                                        <button className="p-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cert.id)}
                                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
