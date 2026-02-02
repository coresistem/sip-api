import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield, Check, X, Award, MapPin, Calendar, Medal, User, FileCheck
} from 'lucide-react';
import axios from 'axios';

// API URL from env or default
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

interface CertificateData {
    id: string;
    recipientName: string;
    category: string;
    achievement: string;
    rank: number | null;
    totalScore: number | null;
    validationCode: string;
    issuedAt: string;
    competition: {
        name: string;
        location: string;
        startDate: string;
        endDate: string;
    };
    athlete?: {
        user: {
            name: string;
            email: string;
        }
    }
}

export default function CertificateVerificationPage() {
    const { code } = useParams<{ code: string }>();
    const [certData, setCertData] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!code) return;

            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/certificates/verify/${code}`);
                if (response.data.success) {
                    setCertData(response.data.data);
                } else {
                    setError('Certificate Not Found');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Certificate Invalid or Not Found');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-dark-400">Verifying Certificate...</p>
                </div>
            </div>
        );
    }

    if (error || !certData) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
                <div className="text-center max-w-md bg-dark-900 border border-dark-800 p-8 rounded-2xl shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <X size={40} className="text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-white">Invalid Certificate</h1>
                    <p className="text-dark-400 mb-6">{error}</p>
                    <div className="bg-dark-800/50 p-4 rounded-lg border border-dark-700 font-mono text-sm text-dark-300">
                        Code: {code}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950 py-12 px-4 flex flex-col items-center">
            {/* Logo Header */}
            <div className="text-center mb-10">
                <img src="/logo.png" alt="Core Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
                <h1 className="text-xl font-bold text-primary-400">Csystem</h1>
                <p className="text-sm text-dark-400">Certificate Verification Service</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Visual Status Header */}
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 ring-4 ring-emerald-500/10">
                        <Check size={32} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Authentic Certificate</h2>
                    <p className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                        <Shield size={14} /> Verified by Core System
                    </p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Recipient Section */}
                    <div className="text-center">
                        <p className="text-dark-400 text-sm uppercase tracking-wider mb-2">Issued To</p>
                        <h3 className="text-3xl font-display font-bold text-white mb-2">{certData.recipientName}</h3>
                        {certData.athlete?.user?.email && (
                            <p className="text-dark-400 text-sm">{certData.athlete.user.email}</p>
                        )}
                    </div>

                    <div className="h-px bg-dark-800 w-full" />

                    {/* Achievement Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-dark-800/50 p-5 rounded-2xl border border-dark-700/50">
                            <div className="flex items-center gap-3 mb-3 text-primary-400">
                                <Award size={20} />
                                <span className="font-semibold text-sm uppercase">Achievement</span>
                            </div>
                            <p className="text-xl font-bold text-white">{certData.achievement}</p>
                            <p className="text-dark-400 mt-1">{certData.category}</p>
                        </div>

                        <div className="bg-dark-800/50 p-5 rounded-2xl border border-dark-700/50">
                            <div className="flex items-center gap-3 mb-3 text-primary-400">
                                <Medal size={20} />
                                <span className="font-semibold text-sm uppercase">Competition</span>
                            </div>
                            <p className="text-lg font-bold text-white leading-tight mb-2">{certData.competition.name}</p>
                            <div className="flex items-center gap-2 text-dark-400 text-sm">
                                <MapPin size={12} />
                                <span>{certData.competition.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-dark-400 text-sm mt-1">
                                <Calendar size={12} />
                                <span>{new Date(certData.competition.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="bg-dark-950 rounded-xl p-4 border border-dark-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Validation Code</p>
                            <p className="font-mono text-primary-400 font-bold">{certData.validationCode}</p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Issued Date</p>
                            <p className="text-dark-300">{new Date(certData.issuedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-dark-950 border-t border-dark-800 p-4 text-center">
                    <p className="text-xs text-dark-500">
                        This is a valid digital certificate issued by Core Archery System.
                        <br />
                        © {new Date().getFullYear()} CoreLink. All rights reserved.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
